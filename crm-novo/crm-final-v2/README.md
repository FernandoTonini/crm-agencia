# CRM A Agência

Sistema completo de gestão de leads e contratos com design glassmorphism ultra futurístico.

## 🎨 Design

- **Cores**: Dourado (#d4af37), Preto (#0a0a0a), Prata (#c0c0c0)
- **Efeito**: Glassmorphism estilo iPhone com blur intenso
- **Glows Coloridos**: Vermelho (leads quentes), Amarelo (mornos), Azul (frios)
- **Tipografia**: Manrope (Google Fonts)

## 🚀 Funcionalidades

### Dashboard
- Estatísticas gerais (total de leads, contratos ativos, valor total)
- Gráfico de pizza (classificação de leads)
- Gráfico de barras (pipeline de vendas)
- Alertas de renovação de contratos

### Gestão de Leads
- Listagem com filtros (classificação, status, busca)
- Cards com glows coloridos por temperatura
- Visualização detalhada
- Criação e edição manual
- Exportação de dados (emails, telefones, Instagram, localizações)
- Sistema de auditoria (rastreamento de alterações)

### Gestão de Contratos
- Listagem de contratos
- Criação e edição
- Cálculo automático de data de término
- Alertas de renovação (30 dias antes)
- Vinculação com leads

### Integrações
- **Quiz**: Captura leads automaticamente
- **Google Sheets**: Envio paralelo de dados
- **Geolocalização**: Captura automática via IP

## 📦 Stack Tecnológica

### Backend
- Node.js + Express
- MySQL (TiDB Cloud / PlanetScale)
- JWT para autenticação
- bcrypt para hash de senhas
- Axios para geolocalização

### Frontend
- React + Vite
- TailwindCSS
- Recharts (gráficos)
- React Router
- Axios

## 🛠️ Instalação Local

### Pré-requisitos
- Node.js 18+
- MySQL (ou TiDB Cloud / PlanetScale)
- Git

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas credenciais
npm run db:setup  # Criar tabelas
npm run dev       # Iniciar servidor
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Editar .env com URL da API
npm run dev       # Iniciar aplicação
```

## 🌐 Deploy

### Backend (Render)

1. Criar Web Service no Render
2. Conectar repositório GitHub
3. Configurar:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
4. Adicionar variáveis de ambiente:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Frontend (Vercel / Render)

1. Criar Static Site
2. Conectar repositório GitHub
3. Configurar:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
4. Adicionar variável:
   - `VITE_API_URL` (URL do backend)

### Banco de Dados (TiDB Cloud)

1. Criar cluster gratuito
2. Copiar connection string
3. Executar script `database/schema.sql`

## 📝 Credenciais Padrão

**Email**: admin@agenciaa.com  
**Senha**: admin123

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

## 🔒 Segurança

- Senhas com hash bcrypt (10 rounds)
- Tokens JWT com expiração (7 dias)
- CORS configurado
- Prepared statements (SQL injection protection)
- HTTPS obrigatório em produção

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual

### Leads
- `GET /api/leads` - Listar leads
- `GET /api/leads/:id` - Buscar lead
- `POST /api/leads` - Criar lead (público - usado pelo quiz)
- `PUT /api/leads/:id` - Atualizar lead
- `DELETE /api/leads/:id` - Deletar lead
- `GET /api/leads/export/:type` - Exportar dados

### Contratos
- `GET /api/contracts` - Listar contratos
- `GET /api/contracts/:id` - Buscar contrato
- `POST /api/contracts` - Criar contrato
- `PUT /api/contracts/:id` - Atualizar contrato
- `DELETE /api/contracts/:id` - Deletar contrato
- `GET /api/contracts/renewals` - Renovações próximas

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas

## 🎯 Integração do Quiz

O quiz envia dados para o CRM via POST request:

```javascript
const response = await fetch('https://sua-api.com/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Nome do Lead',
    email: 'email@example.com',
    phone: '(11) 99999-9999',
    instagram: 'instagram_handle',
    score: 85,
    classification: 'Quente',
    question1: 'Resposta 1',
    // ... outras respostas
    ipAddress: '123.456.789.0'
  })
});
```

## 📱 Responsividade

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verificar credenciais no `.env`
- Verificar se o banco está acessível
- Verificar se as tabelas foram criadas (`npm run db:setup`)

### Erro de CORS
- Verificar `FRONTEND_URL` no backend
- Verificar `VITE_API_URL` no frontend

### Token inválido
- Limpar localStorage do navegador
- Fazer login novamente

## 📄 Licença

MIT

## 👨‍💻 Autor

A Agência - Sistema CRM

