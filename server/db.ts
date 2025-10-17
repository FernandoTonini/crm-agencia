import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, leads, InsertLead, Lead, contracts, InsertContract, Contract } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========================================
// FUNÇÕES DE LEADS
// ========================================

export async function createLead(lead: InsertLead): Promise<Lead> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(leads).values(lead);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(leads).where(eq(leads.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getAllLeads(): Promise<Lead[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(leads).orderBy(desc(leads.timestamp));
}

export async function getLeadsByClassification(classification: "Quente" | "Morno" | "Frio"): Promise<Lead[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(leads).where(eq(leads.classification, classification)).orderBy(desc(leads.timestamp));
}

export async function getLeadById(id: number): Promise<Lead | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLead(id: number, data: Partial<InsertLead>): Promise<Lead | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(leads).set(data).where(eq(leads.id, id));
  
  const updated = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return updated.length > 0 ? updated[0] : undefined;
}

export async function getLeadsByStatus(status: string): Promise<Lead[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(leads).where(eq(leads.status, status as any)).orderBy(desc(leads.timestamp));
}

// ========================================
// FUNÇÕES DE CONTRATOS
// ========================================

export async function createContract(contract: InsertContract): Promise<Contract> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(contracts).values(contract);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(contracts).where(eq(contracts.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getContractsByLeadId(leadId: number): Promise<Contract[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(contracts).where(eq(contracts.leadId, leadId)).orderBy(desc(contracts.createdAt));
}

export async function getActiveContracts(): Promise<Contract[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(contracts).where(eq(contracts.isActive, true)).orderBy(desc(contracts.startDate));
}

export async function getContractsNearExpiration(daysBeforeExpiration: number = 30): Promise<Contract[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysBeforeExpiration);

  return await db.select().from(contracts)
    .where(
      and(
        eq(contracts.isActive, true),
        gte(contracts.endDate, now),
        lte(contracts.endDate, futureDate)
      )
    )
    .orderBy(contracts.endDate);
}

export async function updateContract(id: number, data: Partial<InsertContract>): Promise<Contract | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(contracts).set(data).where(eq(contracts.id, id));
  
  const updated = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return updated.length > 0 ? updated[0] : undefined;
}

// ========================================
// ESTATÍSTICAS E DASHBOARDS
// ========================================

export async function getLeadsStats() {
  const db = await getDb();
  if (!db) {
    return {
      total: 0,
      quente: 0,
      morno: 0,
      frio: 0,
      novo: 0,
      contatado: 0,
      negociacao: 0,
      fechado: 0,
      perdido: 0,
      renovacao: 0,
    };
  }

  const allLeads = await db.select().from(leads);
  
  return {
    total: allLeads.length,
    quente: allLeads.filter(l => l.classification === "Quente").length,
    morno: allLeads.filter(l => l.classification === "Morno").length,
    frio: allLeads.filter(l => l.classification === "Frio").length,
    novo: allLeads.filter(l => l.status === "novo").length,
    contatado: allLeads.filter(l => l.status === "contatado").length,
    negociacao: allLeads.filter(l => l.status === "negociacao").length,
    fechado: allLeads.filter(l => l.status === "fechado").length,
    perdido: allLeads.filter(l => l.status === "perdido").length,
    renovacao: allLeads.filter(l => l.status === "renovacao").length,
  };
}

export async function getContractsStats() {
  const db = await getDb();
  if (!db) {
    return {
      total: 0,
      active: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
    };
  }

  const allContracts = await db.select().from(contracts);
  const activeContracts = allContracts.filter(c => c.isActive);
  
  const totalRevenue = allContracts.reduce((sum, c) => sum + c.contractValue, 0);
  const monthlyRevenue = activeContracts.reduce((sum, c) => {
    const monthlyValue = c.contractValue / c.contractDuration;
    return sum + monthlyValue;
  }, 0);
  
  return {
    total: allContracts.length,
    active: activeContracts.length,
    totalRevenue,
    monthlyRevenue: Math.round(monthlyRevenue),
  };
}

