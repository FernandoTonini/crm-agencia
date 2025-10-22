import { query } from '../config/database.js';
import axios from 'axios';

// Obter geolocalização por IP
const getGeolocation = async (ip) => {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    if (response.data.status === 'success') {
      return {
        city: response.data.city,
        state: response.data.regionName,
        country: response.data.country,
        latitude: response.data.lat?.toString(),
        longitude: response.data.lon?.toString()
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter geolocalização:', error);
    return null;
  }
};

// Listar todos os leads
export const getAllLeads = async (req, res) => {
  try {
    const { classification, status, search } = req.query;
    
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (classification) {
      sql += ' AND classification = ?';
      params.push(classification);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY timestamp DESC';

    const leads = await query(sql, params);

    res.json({
      success: true,
      data: leads,
      count: leads.length
    });

  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar leads'
    });
  }
};

// Buscar lead por ID
export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const leads = await query('SELECT * FROM leads WHERE id = ?', [id]);

    if (leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead não encontrado'
      });
    }

    res.json({
      success: true,
      data: leads[0]
    });

  } catch (error) {
    console.error('Erro ao buscar lead:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar lead'
    });
  }
};

// Criar novo lead (usado pelo quiz e manualmente)
export const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      instagram,
      score,
      classification,
      question1,
      question2,
      question3,
      question4,
      question5,
      question6,
      question7,
      ipAddress
    } = req.body;

    // Validar campos obrigatórios
    if (!name || !email || !phone || !score || !classification) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: name, email, phone, score, classification'
      });
    }

    // Obter geolocalização se IP fornecido
    let geoData = null;
    if (ipAddress) {
      geoData = await getGeolocation(ipAddress);
    }

    // Inserir lead
    const result = await query(
      `INSERT INTO leads (
        name, email, phone, instagram, score, classification,
        question1, question2, question3, question4, question5, question6, question7,
        ipAddress, locationCity, locationState, locationCountry, 
        locationLatitude, locationLongitude, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, email, phone, instagram || null, score, classification,
        question1 || null, question2 || null, question3 || null, 
        question4 || null, question5 || null, question6 || null, question7 || null,
        ipAddress || null,
        geoData?.city || null,
        geoData?.state || null,
        geoData?.country || null,
        geoData?.latitude || null,
        geoData?.longitude || null,
        'novo'
      ]
    );

    // Buscar lead criado
    const [newLead] = await query('SELECT * FROM leads WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Lead criado com sucesso',
      data: newLead
    });

  } catch (error) {
    console.error('Erro ao criar lead:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar lead'
    });
  }
};

// Atualizar lead
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.name || req.user?.email || 'Sistema';

    // Verificar se lead existe
    const existingLead = await query('SELECT * FROM leads WHERE id = ?', [id]);
    if (existingLead.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead não encontrado'
      });
    }

    // Campos permitidos para atualização
    const allowedFields = [
      'name', 'email', 'phone', 'instagram', 'score', 'classification',
      'status', 'observations', 'question1', 'question2', 'question3',
      'question4', 'question5', 'question6', 'question7'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
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
      `UPDATE leads SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Buscar lead atualizado
    const [updatedLead] = await query('SELECT * FROM leads WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Lead atualizado com sucesso',
      data: updatedLead
    });

  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar lead'
    });
  }
};

// Deletar lead
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM leads WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Lead deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar lead'
    });
  }
};

// Exportar dados
export const exportData = async (req, res) => {
  try {
    const { type } = req.params; // emails, phones, instagram, locations

    let data = [];
    let filename = '';

    switch (type) {
      case 'emails':
        const emails = await query('SELECT email FROM leads ORDER BY timestamp DESC');
        data = emails.map(l => l.email);
        filename = 'emails.txt';
        break;

      case 'phones':
        const phones = await query('SELECT phone FROM leads ORDER BY timestamp DESC');
        data = phones.map(l => l.phone);
        filename = 'telefones.txt';
        break;

      case 'instagram':
        const instagrams = await query('SELECT instagram FROM leads WHERE instagram IS NOT NULL ORDER BY timestamp DESC');
        data = instagrams.map(l => l.instagram);
        filename = 'instagram.txt';
        break;

      case 'locations':
        const locations = await query('SELECT name, locationCity, locationState, locationCountry FROM leads WHERE locationCity IS NOT NULL ORDER BY timestamp DESC');
        data = locations.map(l => `${l.name} - ${l.locationCity}, ${l.locationState}, ${l.locationCountry}`);
        filename = 'localizacoes.txt';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de exportação inválido'
        });
    }

    const content = data.join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao exportar dados'
    });
  }
};

export default {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportData
};

