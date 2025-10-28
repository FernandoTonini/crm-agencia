// ====================================================================
// MIDDLEWARE DE AUDITORIA
// ====================================================================
// Registra todas as ações (create, update, delete) no activity_log

import db from '../database/connection.js';

export const auditoryMiddleware = async (req, res, next) => {
  // Armazenar informações do usuário na requisição
  req.auditUser = {
    id: req.user?.id,
    name: req.user?.name || 'Desconhecido'
  };

  // Armazenar método original de send
  const originalSend = res.send;

  res.send = function (data) {
    // Registrar atividade se foi sucesso (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Não registrar GET requests
      if (req.method !== 'GET') {
        logActivity(req, res, data);
      }
    }

    // Chamar send original
    originalSend.call(this, data);
  };

  next();
};

// ====================================================================
// FUNÇÃO DE LOG
// ====================================================================

async function logActivity(req, res, responseData) {
  try {
    const action = getAction(req.method);
    const { entityType, entityId, entityName } = extractEntityInfo(req);

    if (!entityType) return; // Não registrar se não conseguir identificar entidade

    const changes = {
      before: req.body?.before || null,
      after: req.body || null
    };

    const description = generateDescription(action, entityType, entityName, req.auditUser.name);

    const query = `
      INSERT INTO activity_log (userId, userName, action, entityType, entityId, entityName, changes, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(query, [
      req.auditUser.id,
      req.auditUser.name,
      action,
      entityType,
      entityId,
      entityName,
      JSON.stringify(changes),
      description
    ]);
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    // Não interromper requisição se falhar log
  }
}

// ====================================================================
// FUNÇÕES AUXILIARES
// ====================================================================

function getAction(method) {
  switch (method) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'unknown';
  }
}

function extractEntityInfo(req) {
  const path = req.path;
  const body = req.body;

  // Leads
  if (path.includes('/leads')) {
    const leadId = path.match(/\/leads\/(\d+)/)?.[1];
    return {
      entityType: 'lead',
      entityId: leadId || body?.id,
      entityName: body?.name || 'Lead'
    };
  }

  // Contracts
  if (path.includes('/contracts')) {
    const contractId = path.match(/\/contracts\/(\d+)/)?.[1];
    return {
      entityType: 'contract',
      entityId: contractId || body?.id,
      entityName: body?.contractValue ? `Contrato R$ ${body.contractValue}` : 'Contrato'
    };
  }

  // Services
  if (path.includes('/services')) {
    const serviceId = path.match(/\/services\/(\d+)/)?.[1];
    return {
      entityType: 'service',
      entityId: serviceId || body?.id,
      entityName: body?.serviceName || 'Serviço'
    };
  }

  return {};
}

function generateDescription(action, entityType, entityName, userName) {
  const actionText = {
    create: 'criou',
    update: 'modificou',
    delete: 'deletou'
  }[action] || 'atualizou';

  return `${userName} ${actionText} ${entityType} "${entityName}"`;
}

// ====================================================================
// FUNÇÕES DE AUDITORIA MANUAL
// ====================================================================

export async function logManualActivity(userId, userName, action, entityType, entityId, entityName, changes = null) {
  try {
    const description = generateDescription(action, entityType, entityName, userName);

    const query = `
      INSERT INTO activity_log (userId, userName, action, entityType, entityId, entityName, changes, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(query, [
      userId,
      userName,
      action,
      entityType,
      entityId,
      entityName,
      changes ? JSON.stringify(changes) : null,
      description
    ]);
  } catch (error) {
    console.error('Erro ao registrar atividade manual:', error);
  }
}

// ====================================================================
// FUNÇÃO PARA OBTER LOG DE ATIVIDADES
// ====================================================================

export async function getActivityLog(limit = 50, offset = 0) {
  try {
    const query = `
      SELECT 
        id,
        userId,
        userName,
        action,
        entityType,
        entityId,
        entityName,
        description,
        createdAt
      FROM activity_log
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.execute(query, [limit, offset]);
    return rows;
  } catch (error) {
    console.error('Erro ao obter log de atividades:', error);
    return [];
  }
}

// ====================================================================
// FUNÇÃO PARA OBTER LOG DE USUÁRIO ESPECÍFICO
// ====================================================================

export async function getUserActivityLog(userId, limit = 50) {
  try {
    const query = `
      SELECT 
        id,
        userId,
        userName,
        action,
        entityType,
        entityId,
        entityName,
        description,
        createdAt
      FROM activity_log
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [userId, limit]);
    return rows;
  } catch (error) {
    console.error('Erro ao obter log do usuário:', error);
    return [];
  }
}

// ====================================================================
// FUNÇÃO PARA OBTER LOG DE ENTIDADE ESPECÍFICA
// ====================================================================

export async function getEntityActivityLog(entityType, entityId) {
  try {
    const query = `
      SELECT 
        id,
        userId,
        userName,
        action,
        entityType,
        entityId,
        entityName,
        description,
        createdAt
      FROM activity_log
      WHERE entityType = ? AND entityId = ?
      ORDER BY createdAt DESC
    `;

    const [rows] = await db.execute(query, [entityType, entityId]);
    return rows;
  } catch (error) {
    console.error('Erro ao obter log da entidade:', error);
    return [];
  }
}

