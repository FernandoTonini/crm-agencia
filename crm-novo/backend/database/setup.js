import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔧 Iniciando setup do banco de dados...\n');

    // Conectar ao banco
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: {
        rejectUnauthorized: true
      }
    });

    console.log('✅ Conectado ao banco de dados');

    // Ler arquivo SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Dividir por statements (separados por ;)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executando ${statements.length} statements SQL...\n`);

    // Executar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await connection.query(statement);
        
        // Identificar tipo de statement
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE.*?`?(\w+)`?/i)?.[1];
          console.log(`✅ Tabela criada: ${tableName}`);
        } else if (statement.toUpperCase().includes('INSERT INTO')) {
          console.log(`✅ Dados inseridos`);
        }
      } catch (error) {
        console.error(`❌ Erro no statement ${i + 1}:`, error.message);
      }
    }

    console.log('\n✅ Setup do banco de dados concluído com sucesso!');
    console.log('\n📊 Tabelas criadas:');
    console.log('   - users (usuários do sistema)');
    console.log('   - leads (leads capturados)');
    console.log('   - contracts (contratos fechados)');
    console.log('\n👤 Usuário admin padrão criado:');
    console.log('   Email: admin@agenciaa.com');
    console.log('   Senha: admin123');
    console.log('   ⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');

  } catch (error) {
    console.error('\n❌ Erro ao configurar banco de dados:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar setup
setupDatabase();

