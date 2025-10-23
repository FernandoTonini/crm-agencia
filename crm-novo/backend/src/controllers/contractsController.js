import { query } from '../config/database.js';

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

    res.json({
      success: true,
      data: contracts[0]
    });

  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar contrato'
    });
  }
};

// Criar novo contrato
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
    if (!leadId || !contractValue || !contractDuration || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: leadId, contractValue, contractDuration, startDate'
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

    // Calcular data de término (startDate + contractDuration meses)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + parseInt(contractDuration));

    // Inserir contrato
    const result = await query(
      `INSERT INTO contracts (
        leadId, contractValue, contractDuration, services, startDate, endDate,
        isActive, renewalNotified, notes, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        leadId,
        contractValue,
        contractDuration,
        services ? JSON.stringify(services) : null,
        start,
        end,
        true,
        false,
        notes || null,
        userId
      ]
    );

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
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Contrato criado com sucesso',
      data: newContract
    });

  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar contrato'
    });
  }
};

// Atualizar contrato
export const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.name || req.user?.email || 'Sistema';

    // Verificar se contrato existe
    const existingContract = await query('SELECT * FROM contracts WHERE id = ?', [id]);
    if (existingContract.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

    // Campos permitidos para atualização
    const allowedFields = [
      'contractValue', 'contractDuration', 'services', 'startDate',
      'endDate', 'isActive', 'renewalNotified', 'notes'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'services' && typeof updates[key] === 'object') {
          updateFields.push(`${key} = ?`);
          updateValues.push(JSON.stringify(updates[key]));
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(updates[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo válido para atualizar'
      });
    }

    // Adicionar auditoria
    updateFields.push('lastModifiedBy = ?', 'lastModifiedAt = NOW()');
    updateValues.push(userId);
    updateValues.push(id);

    await query(
      `UPDATE contracts SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Buscar contrato atualizado
    const [updatedContract] = await query(`
      SELECT c.*, l.name as leadName, l.email as leadEmail, l.phone as leadPhone
      FROM contracts c
      LEFT JOIN leads l ON c.leadId = l.id
      WHERE c.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Contrato atualizado com sucesso',
      data: updatedContract
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

    const result = await query('DELETE FROM contracts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contrato não encontrado'
      });
    }

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

// Buscar contratos próximos da renovação (30 dias)
export const getRenewals = async (req, res) => {
  try {
    const contracts = await query(`
      SELECT c.*, l.name as leadName, l.email as leadEmail, l.phone as leadPhone
      FROM contracts c
      LEFT JOIN leads l ON c.leadId = l.id
      WHERE c.isActive = 1
      AND c.endDate <= DATE_ADD(NOW(), INTERVAL 30 DAY)
      AND c.endDate >= NOW()
      ORDER BY c.endDate ASC
    `);

    res.json({
      success: true,
      data: contracts,
      count: contracts.length
    });

  } catch (error) {
    console.error('Erro ao buscar renovações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar renovações'
    });
  }
};

export default {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getRenewals
};

