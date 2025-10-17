import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de Leads - Armazena todos os leads capturados pelo quiz
 */
export const leads = mysqlTable("leads", {
  id: int("id").primaryKey().autoincrement(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  instagram: varchar("instagram", { length: 255 }),
  
  // Classificação e pontuação
  score: int("score").notNull(),
  classification: mysqlEnum("classification", ["Quente", "Morno", "Frio"]).notNull(),
  
  // Respostas do quiz
  question1: text("question1"),
  question2: text("question2"),
  question3: text("question3"),
  question4: text("question4"),
  question5: text("question5"),
  question6: text("question6"),
  question7: text("question7"),
  
  // Dados de geolocalização
  ipAddress: varchar("ipAddress", { length: 100 }),
  locationCity: varchar("locationCity", { length: 255 }),
  locationState: varchar("locationState", { length: 255 }),
  locationCountry: varchar("locationCountry", { length: 255 }),
  locationLatitude: varchar("locationLatitude", { length: 50 }),
  locationLongitude: varchar("locationLongitude", { length: 50 }),
  
  // Status do lead
  status: mysqlEnum("status", ["novo", "contatado", "negociacao", "fechado", "perdido", "renovacao"]).default("novo").notNull(),
  
  // Observações
  observations: text("observations"),
  
  // Auditoria
  lastModifiedBy: varchar("lastModifiedBy", { length: 255 }),
  lastModifiedAt: timestamp("lastModifiedAt"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Tabela de Contratos - Armazena informações de contratos fechados
 */
export const contracts = mysqlTable("contracts", {
  id: int("id").primaryKey().autoincrement(),
  leadId: int("leadId").notNull().references(() => leads.id),
  
  // Informações do contrato
  contractValue: int("contractValue").notNull(), // Valor em centavos
  contractDuration: int("contractDuration").notNull(), // Duração em meses
  services: text("services"), // Serviços contratados (JSON string)
  
  // Datas
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  renewalNotified: boolean("renewalNotified").default(false).notNull(),
  
  // Observações adicionais
  notes: text("notes"),
  
  // Auditoria
  createdBy: varchar("createdBy", { length: 255 }),
  lastModifiedBy: varchar("lastModifiedBy", { length: 255 }),
  lastModifiedAt: timestamp("lastModifiedAt"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

