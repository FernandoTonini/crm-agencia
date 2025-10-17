import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ========================================
  // ROTAS DE LEADS
  // ========================================
  leads: router({
    // Criar novo lead (público - chamado pelo quiz)
    create: publicProcedure
      .input(z.object({
        timestamp: z.string().optional(),
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        instagram: z.string().optional(),
        score: z.number(),
        classification: z.enum(["Quente", "Morno", "Frio"]),
        question_1: z.string().optional(),
        question_2: z.string().optional(),
        question_3: z.string().optional(),
        question_4: z.string().optional(),
        question_5: z.string().optional(),
        question_6: z.string().optional(),
        question_7: z.string().optional(),
        ip_address: z.string().optional(),
        location_city: z.string().optional(),
        location_state: z.string().optional(),
        location_country: z.string().optional(),
        location_latitude: z.string().optional(),
        location_longitude: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const lead = await db.createLead({
          timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
          name: input.name,
          email: input.email,
          phone: input.phone,
          instagram: input.instagram || null,
          score: input.score,
          classification: input.classification,
          question1: input.question_1 || null,
          question2: input.question_2 || null,
          question3: input.question_3 || null,
          question4: input.question_4 || null,
          question5: input.question_5 || null,
          question6: input.question_6 || null,
          question7: input.question_7 || null,
          ipAddress: input.ip_address || null,
          locationCity: input.location_city || null,
          locationState: input.location_state || null,
          locationCountry: input.location_country || null,
          locationLatitude: input.location_latitude || null,
          locationLongitude: input.location_longitude || null,
          status: "novo",
        });
        return lead;
      }),

    // Listar todos os leads (protegido)
    list: publicProcedure.query(async () => {
      return await db.getAllLeads();
    }),

    createManual: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          instagram: z.string().optional(),
          classification: z.enum(["Quente", "Morno", "Frio"]),
          score: z.number().min(0).max(70),
          status: z.enum(["novo", "contatado", "negociacao", "fechado", "perdido", "renovacao"]).default("novo"),
          question_1: z.string().optional(),
          question_2: z.string().optional(),
          question_3: z.string().optional(),
          question_4: z.string().optional(),
          question_5: z.string().optional(),
          question_6: z.string().optional(),
          question_7: z.string().optional(),
          location_city: z.string().optional(),
          location_state: z.string().optional(),
          location_country: z.string().optional(),
          location_latitude: z.string().optional(),
          location_longitude: z.string().optional(),
          ip_address: z.string().optional(),
          observations: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const lead = await db.createLead({
          timestamp: new Date(),
          name: input.name,
          email: input.email,
          phone: input.phone,
          instagram: input.instagram || null,
          score: input.score,
          classification: input.classification,
          question1: input.question_1 || null,
          question2: input.question_2 || null,
          question3: input.question_3 || null,
          question4: input.question_4 || null,
          question5: input.question_5 || null,
          question6: input.question_6 || null,
          question7: input.question_7 || null,
          ipAddress: input.ip_address || null,
          locationCity: input.location_city || null,
          locationState: input.location_state || null,
          locationCountry: input.location_country || null,
          locationLatitude: input.location_latitude || null,
          locationLongitude: input.location_longitude || null,
          status: input.status || "novo",
          observations: input.observations || null,
          lastModifiedBy: ctx.user.name || ctx.user.id,
        });
        return { success: true, leadId: lead.id };
      }),

    updateFull: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().min(1).optional(),
          instagram: z.string().optional(),
          classification: z.enum(["Quente", "Morno", "Frio"]).optional(),
          score: z.number().min(0).max(70).optional(),
          status: z.enum(["novo", "contatado", "negociacao", "fechado", "perdido", "renovacao"]).optional(),
          question_1: z.string().optional(),
          question_2: z.string().optional(),
          question_3: z.string().optional(),
          question_4: z.string().optional(),
          question_5: z.string().optional(),
          question_6: z.string().optional(),
          question_7: z.string().optional(),
          location_city: z.string().optional(),
          location_state: z.string().optional(),
          location_country: z.string().optional(),
          location_latitude: z.string().optional(),
          location_longitude: z.string().optional(),
          ip_address: z.string().optional(),
          observations: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        // Preparar dados para atualização
        const updateData: any = {
          lastModifiedBy: ctx.user.name || ctx.user.id,
        };
        
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.phone) updateData.phone = data.phone;
        if (data.instagram !== undefined) updateData.instagram = data.instagram || null;
        if (data.classification) updateData.classification = data.classification;
        if (data.score !== undefined) updateData.score = data.score;
        if (data.status) updateData.status = data.status;
        if (data.question_1 !== undefined) updateData.question1 = data.question_1 || null;
        if (data.question_2 !== undefined) updateData.question2 = data.question_2 || null;
        if (data.question_3 !== undefined) updateData.question3 = data.question_3 || null;
        if (data.question_4 !== undefined) updateData.question4 = data.question_4 || null;
        if (data.question_5 !== undefined) updateData.question5 = data.question_5 || null;
        if (data.question_6 !== undefined) updateData.question6 = data.question_6 || null;
        if (data.question_7 !== undefined) updateData.question7 = data.question_7 || null;
        if (data.location_city !== undefined) updateData.locationCity = data.location_city || null;
        if (data.location_state !== undefined) updateData.locationState = data.location_state || null;
        if (data.location_country !== undefined) updateData.locationCountry = data.location_country || null;
        if (data.location_latitude !== undefined) updateData.locationLatitude = data.location_latitude || null;
        if (data.location_longitude !== undefined) updateData.locationLongitude = data.location_longitude || null;
        if (data.ip_address !== undefined) updateData.ipAddress = data.ip_address || null;
        if (data.observations !== undefined) updateData.observations = data.observations || null;
        
        await db.updateLead(id, updateData);
        return { success: true };
      }),

    // Listar leads por classificação
    listByClassification: protectedProcedure
      .input(z.object({
        classification: z.enum(["Quente", "Morno", "Frio"]),
      }))
      .query(async ({ input }) => {
        return await db.getLeadsByClassification(input.classification);
      }),

    // Listar leads por status
    listByStatus: protectedProcedure
      .input(z.object({
        status: z.enum(["novo", "contatado", "negociacao", "fechado", "perdido", "renovacao"]),
      }))
      .query(async ({ input }) => {
        return await db.getLeadsByStatus(input.status);
      }),

    // Obter lead por ID
    getById: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getLeadById(input.id);
      }),

    // Atualizar lead
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["novo", "contatado", "negociacao", "fechado", "perdido", "renovacao"]).optional(),
        observations: z.string().optional(),
        instagram: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return await db.updateLead(id, {
          ...data,
          lastModifiedBy: ctx.user?.name || 'Sistema',
          lastModifiedAt: new Date(),
        });
      }),

    // Estatísticas de leads
    stats: protectedProcedure.query(async () => {
      return await db.getLeadsStats();
    }),
  }),

  // ========================================
  // ROTAS DE CONTRATOS
  // ========================================
  contracts: router({
    // Criar novo contrato
    create: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        contractValue: z.number(),
        contractDuration: z.number(),
        services: z.string().optional(),
        startDate: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + input.contractDuration);

        const contract = await db.createContract({
          leadId: input.leadId,
          contractValue: input.contractValue,
          contractDuration: input.contractDuration,
          services: input.services || null,
          startDate,
          endDate,
          notes: input.notes || null,
          isActive: true,
          renewalNotified: false,
          createdBy: ctx.user?.name || 'Sistema',
        });

        // Atualizar status do lead para "fechado"
        await db.updateLead(input.leadId, { 
          status: "fechado",
          lastModifiedBy: ctx.user?.name || 'Sistema',
          lastModifiedAt: new Date(),
        });

        return contract;
      }),

    // Listar contratos de um lead
    listByLead: protectedProcedure
      .input(z.object({
        leadId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getContractsByLeadId(input.leadId);
      }),

    // Listar contratos ativos
    listActive: protectedProcedure.query(async () => {
      return await db.getActiveContracts();
    }),

    // Listar contratos próximos do vencimento
    listNearExpiration: protectedProcedure
      .input(z.object({
        days: z.number().default(30),
      }))
      .query(async ({ input }) => {
        return await db.getContractsNearExpiration(input.days);
      }),

    // Listar todos os contratos
    list: protectedProcedure.query(async () => {
      return await db.getActiveContracts();
    }),

    // Atualizar contrato
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean().optional(),
        renewalNotified: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return await db.updateContract(id, {
          ...data,
          lastModifiedBy: ctx.user?.name || 'Sistema',
          lastModifiedAt: new Date(),
        });
      }),

    // Atualizar contrato completo
    updateFull: protectedProcedure
      .input(z.object({
        id: z.number(),
        contractValue: z.number().optional(),
        contractDuration: z.number().optional(),
        services: z.string().optional(),
        startDate: z.string().optional(),
        notes: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, startDate, contractDuration, ...data } = input;
        
        const updateData: any = {
          ...data,
          lastModifiedBy: ctx.user?.name || 'Sistema',
          lastModifiedAt: new Date(),
        };
        
        // Se mudou data de início ou duração, recalcular data final
        if (startDate && contractDuration) {
          const start = new Date(startDate);
          const end = new Date(start);
          end.setMonth(end.getMonth() + contractDuration);
          updateData.startDate = start;
          updateData.endDate = end;
          updateData.contractDuration = contractDuration;
        } else if (startDate) {
          updateData.startDate = new Date(startDate);
        } else if (contractDuration) {
          updateData.contractDuration = contractDuration;
        }
        
        return await db.updateContract(id, updateData);
      }),

    // Estatísticas de contratos
    stats: protectedProcedure.query(async () => {
      return await db.getContractsStats();
    }),
  }),

  // ========================================
  // DASHBOARD
  // ========================================
  dashboard: router({
    // Obter dados gerais do dashboard
    overview: protectedProcedure.query(async () => {
      const leadsStats = await db.getLeadsStats();
      const contractsStats = await db.getContractsStats();
      const nearExpiration = await db.getContractsNearExpiration(30);

      return {
        leads: leadsStats,
        contracts: contractsStats,
        renewals: nearExpiration.length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;

