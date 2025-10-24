import { query } from '../config/database.js';
import { processContractDescription, isConfigured } from '../services/openaiService.js';

// Listar todos os contratos
export const getAllContracts = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let sql = `
      SELECT c.*, l.name as leadName, l.email as leadEmail, l.phone as leadPhone
      FROM contracts c
      LEFT JOIN leads l ON c.leadId = l.id
      WHERE 1=1
    `;
    const params = [];

    if (isActive !== undefined) {
      sql += ' AND c.isActive = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY c.createdAt DESC';

    const contracts = await query(sql, params);

    // Buscar serviços de cada contrato
    for (let contract of contracts) {
      const services = await query(
        'SELECT * FROM contract_services WHERE contractId = ?',
        [contract.id]
      );
      contract.extractedServices = services;
    }

    res.json({
      success: true,
      data: contracts,
      count: contracts.length
    });

  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar contratos'
    });
  }
};

// Buscar contrato por ID
export const getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const contracts = await query(`
      SELECT c.*, l.name as leadName, l.email as leadEmail, l.phone as leadPhone
      FROM contracts c
      LEFT JOIN leads l ON c.leadId = l.id
      WHERE c.id = ?
    `, [id]);

    if (contracts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    const contract = contracts[0];

    // Buscar serviços do contrato
    const services = await query(
      'SELECT * FROM contract_services WHERE contractId = ?',
      [id]
    );
    contract.extractedServices = services;

    res.json({
      success: true,
      data: contract
    });

  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar contrato'
    });
  }
};

// Criar novo contrato (COM IA)
export const createContract = async (req, res) => {
  try {
    const {
      leadId,
      contractValue,
      contractDuration,
      services,
      startDate,
      notes
    } = req.body;

    const userId = req.user?.name || req.user?.email || 'Sistema';

    // Validar campos obrigatórios
    if (!leadId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: leadId, startDate'
      });
    }

    // Verificar se lead existe
    const lead = await query('SELECT id FROM leads WHERE id = ?', [leadId]);
    if (lead.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead não encontrado'
      });
    }

    let finalContractValue = contractValue;
    let finalContractDuration = contractDuration;
    let extractedServices = [];
    let processedByAI = false;

    // Se houver "notes" e a IA estiver configurada, processar com IA
    if (notes && isConfigured()) {
      console.log('Processando contrato com IA...');
      const aiResult = await processContractDescription(notes);
      
      if (aiResult.success && aiResult.data) {
        processedByAI = true;
        
        // Se a IA extraiu valores, usar eles (a menos que já tenham sido fornecidos)
        if (!contractValue && aiResult.data.totalValue) {
          finalContractValue = aiResult.data.totalValue * 100; // Converter para centavos
        }
        
        if (!contractDuration && aiResult.data.duration) {
          finalContractDuration = aiResult.data.duration;
        }

        // Guardar serviços extraídos
        if (aiResult.data.services && aiResult.data.services.length > 0) {
          extractedServices = aiResult.data.services;
        }
      }
    }

    // Se ainda não tiver valor ou duração, retornar erro
    if (!finalContractValue || !finalContractDuration) {
      return res.status(400).json({
        success: false,
        message: 'Informe o valor e duração do contrato, ou escreva uma descrição completa para a IA processar'
      });
    }

    // Calcular data de término
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + parseInt(finalContractDuration));

    // Inserir contrato
    const result = await query(
      `INSERT INTO contracts (
        leadId, contractValue, contractDuration, services, startDate, endDate,
        isActive, renewalNotified, notes, createdBy, processedByAI, aiExtractedServices
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        leadId,
        finalContractValue,
        finalContractDuration,
        services ? JSON.stringify(services) : null,
        start,
        end,
        true,
        false,
        notes || null,
        userId,
        processedByAI,
        extractedServices.length > 0 ? JSON.stringify(extractedServices) : null
      ]
    );

    const contractId = result.insertId;

    // Inserir serviços extraídos na tabela contract_services
    if (extractedServices.length > 0) {
      for (let service of extractedServices) {
        await query(
          'INSERT INTO contract_services (contractId, serviceName, serviceValue) VALUES (?, ?, ?)',
          [contractId, service.name, service.value * 100] // Converter para centavos
        );
      }
    }

    // Atualizar status do lead para "fechado"
    await query(
      'UPDATE leads SET status = ?, lastModifiedBy = ?, lastModifiedAt = NOW() WHERE id = ?',
      ['fechado', userId, leadId]
    );

    // Buscar contrato criado
    const [newContract] = await query(`
      SELECT c.*, l.name as leadName, l.email as leadEmail, l.phone as leadPhone
      FROM contracts c
      LEFT JOIN leads l ON c.leadId = l.id
      WHERE c.id = ?
    `, [contractId]);

    // Buscar serviços
    const contractServices = await query(
      'SELECT * FROM contract_services WHERE contractId = ?',
      [contractId]
    );
    newContract.extractedServices = contractServices;

    res.status(201).json({
      success: true,
      message: 'Contrato criado com sucesso' + (processedByAI ? ' (processado pela IA)' : ''),
      data: newContract,
      aiProcessed: processedByAI
    });

  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar contrato',
      error: error.message
    });
  }
};

// Atualizar contrato
export const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      contractValue,
      contractDuration,
      services,
      startDate,
      endDate,
      isActive,
      renewalNotified,
      notes
    } = req.body;

    const userId = req.user?.name || req.user?.email || 'Sistema';

    // Verificar se contrato existe
    const existing = await query('SELECT id FROM contracts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Atualizar contrato
    await query(
      `UPDATE contracts SET
        contractValue = COALESCE(?, contractValue),
        contractDuration = COALESCE(?, contractDuration),
        services = COALESCE(?, services),
        startDate = COALESCE(?, startDate),
        endDate = COALESCE(?, endDate),
        isActive = COALESCE(?, isActive),
        renewalNotified = COALESCE(?, renewalNotified),
        notes = COALESCE(?, notes),
        lastModifiedBy = ?,
        lastModifiedAt = NOW()
      WHERE id = ?`,
      [
        contractValue,
        contractDuration,
        services ? JSON.stringify(services) : null,
        startDate,
        endDate,
        isActive,
        renewalNotified,
        notes,
        userId,
        id
      ]
    );

    // Buscar contrato atualizado
    const [updated] = await query(`
      SELECT c.*, l.name as leadName, l.email as leadEmail, l.phone as leadPhone
      FROM contracts c
      LEFT JOIN leads l ON c.leadId = l.id
      WHERE c.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Contrato atualizado com sucesso',
      data: updated
    });

  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar contrato'
    });
  }
};

// Deletar contrato
export const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se contrato existe
    const existing = await query('SELECT id FROM contracts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Deletar contrato (serviços serão deletados automaticamente por CASCADE)
    await query('DELETE FROM contracts WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Contrato deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar contrato'
    });
  }
};

// Buscar contratos próximos de renovação
export const getContractsNearRenewal = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const contracts = await query(`
      SELECT c.*, l.name as leadName, l.email as leadEmail, l.phone as leadPhone
      FROM contracts c
      LEFT JOIN leads l ON c.leadId = l.id
      WHERE c.isActive = 1
        AND c.renewalNotified = 0
        AND DATEDIFF(c.endDate, NOW()) <= ?
        AND DATEDIFF(c.endDate, NOW()) >= 0
      ORDER BY c.endDate ASC
    `, [days]);

    res.json({
      success: true,
      data: contracts,
      count: contracts.length
    });

  } catch (error) {
    console.error('Erro ao buscar contratos próximos de renovação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar contratos próximos de renovação'
    });
  }
};

// Estatísticas por serviço
export const getServiceStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        serviceName,
        COUNT(*) as contractCount,
        SUM(serviceValue) as totalRevenue,
        AVG(serviceValue) as avgRevenue
      FROM contract_services
      GROUP BY serviceName
      ORDER BY totalRevenue DESC
    `);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de serviços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas de serviços'
    });
  }
};

