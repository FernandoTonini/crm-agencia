import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import contractsRoutes from './routes/contracts.js';
import dashboardRoutes from './routes/dashboard.js';
import { auditoryMiddleware } from './middleware/auditoryMiddleware.js';

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CRM API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(auditoryMiddleware);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    console.log('🔌 Testando conexão com banco de dados...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      console.error('⚠️  Servidor iniciará, mas funcionalidades que dependem do banco não funcionarão');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 CRM A Agência - Backend API');
      console.log('='.repeat(60));
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60) + '\n');
      
      console.log('📋 Rotas disponíveis:');
      console.log('   POST   /api/auth/register       - Criar conta');
      console.log('   POST   /api/auth/login          - Login');
      console.log('   GET    /api/auth/me             - Usuário atual');
      console.log('   GET    /api/leads               - Listar leads');
      console.log('   POST   /api/leads               - Criar lead (público)');
      console.log('   GET    /api/leads/:id           - Buscar lead');
      console.log('   PUT    /api/leads/:id           - Atualizar lead');
      console.log('   DELETE /api/leads/:id           - Deletar lead');
      console.log('   GET    /api/leads/export/:type  - Exportar dados');
      console.log('   GET    /api/contracts           - Listar contratos');
      console.log('   POST   /api/contracts           - Criar contrato');
      console.log('   GET    /api/contracts/:id       - Buscar contrato');
      console.log('   PUT    /api/contracts/:id       - Atualizar contrato');
      console.log('   DELETE /api/contracts/:id       - Deletar contrato');
      console.log('   GET    /api/contracts/renewals  - Renovações próximas');
      console.log('   GET    /api/dashboard/stats     - Estatísticas');
      console.log('\n' + '='.repeat(60) + '\n');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar
startServer();

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export default app;

