import { query } from '../config/database.js';

// Obter estatísticas do dashboard
export const getStats = async (req, res) => {
  try {
    // Total de leads
    const [totalLeads] = await query('SELECT COUNT(*) as count FROM leads');
    
    // Leads por classificação
    const leadsByClassification = await query(`
      SELECT classification, COUNT(*) as count
      FROM leads
      GROUP BY classification
    `);

    // Leads por status
    const leadsByStatus = await query(`
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
    `);

    // Total de contratos ativos
    const [activeContracts] = await query(`
      SELECT COUNT(*) as count FROM contracts WHERE isActive = 1
    `);

    // Valor total de contratos ativos
    const [totalValue] = await query(`
      SELECT SUM(contractValue) as total FROM contracts WHERE isActive = 1
    `);

    // Contratos próximos da renovação (30 dias)
    const [renewalCount] = await query(`
      SELECT COUNT(*) as count
      FROM contracts
      WHERE isActive = 1
      AND endDate <= DATE_ADD(NOW(), INTERVAL 30 DAY)
      AND endDate >= NOW()
    `);

    // Leads recentes (últimos 7 dias)
    const [recentLeads] = await query(`
      SELECT COUNT(*) as count
      FROM leads
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Taxa de conversão (leads fechados / total de leads)
    const [closedLeads] = await query(`
      SELECT COUNT(*) as count FROM leads WHERE status = 'fechado'
    `);

    const conversionRate = totalLeads.count > 0 
      ? ((closedLeads.count / totalLeads.count) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        totalLeads: totalLeads.count,
        activeContracts: activeContracts.count,
        totalValue: totalValue.total || 0,
        renewalCount: renewalCount.count,
        recentLeads: recentLeads.count,
        conversionRate: parseFloat(conversionRate),
        leadsByClassification: leadsByClassification.map(item => ({
          name: item.classification,
          value: item.count
        })),
        leadsByStatus: leadsByStatus.map(item => ({
          name: item.status,
          value: item.count
        }))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
};

export default { getStats };

