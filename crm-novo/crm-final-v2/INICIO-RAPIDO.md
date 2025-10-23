# 🚀 Início Rápido - CRM A Agência

Este guia permite que você tenha o CRM funcionando em **menos de 30 minutos**.

## 📦 O Que Você Tem

Um sistema CRM completo com:
- **Backend**: API REST em Node.js + Express
- **Frontend**: Interface React com design glassmorphism
- **Banco**: MySQL (compatível com TiDB Cloud, PlanetScale, etc.)

## ⚡ Opção 1: Testar Localmente (5 minutos)

### Pré-requisitos
- Node.js 18+ instalado
- MySQL local (ou use TiDB Cloud gratuito)

### Passo 1: Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite o arquivo `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_HOST=seu_host
DATABASE_PORT=4000
DATABASE_USER=seu_usuario
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=crm_agencia
JWT_SECRET=meu_secret_super_seguro
FRONTEND_URL=http://localhost:5173
```

Criar tabelas:
```bash
npm run db:setup
```

Iniciar servidor:
```bash
npm run dev
```

### Passo 2: Configurar Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edite o arquivo `.env`:
```env
VITE_API_URL=http://localhost:5000
```

Iniciar aplicação:
```bash
npm run dev
```

### Passo 3: Acessar

Abra: `http://localhost:5173`

**Login padrão:**
- Email: `admin@agenciaa.com`
- Senha: `admin123`

---

## 🌐 Opção 2: Deploy em Produção (25 minutos)

### Passo 1: Banco de Dados (5 min)

1. Crie conta em [tidbcloud.com](https://tidbcloud.com)
2. Crie cluster Serverless (gratuito)
3. Copie a connection string
4. Execute o SQL em `backend/database/schema.sql`

### Passo 2: Backend no Render (10 min)

1. Crie conta em [render.com](https://render.com)
2. Faça upload do código no GitHub
3. Crie Web Service apontando para o repositório
4. Configure:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
5. Adicione variáveis de ambiente (veja `backend/.env.example`)
6. Aguarde deploy

### Passo 3: Frontend na Vercel (10 min)

1. Crie conta em [vercel.com](https://vercel.com)
2. Importe projeto do GitHub
3. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
4. Adicione variável: `VITE_API_URL` (URL do Render)
5. Deploy automático

### Passo 4: Atualizar CORS

1. Volte ao Render
2. Adicione variável `FRONTEND_URL` com URL da Vercel
3. Salve (reinicia automaticamente)

**Pronto!** Acesse a URL da Vercel e faça login.

---

## 📚 Documentação Completa

Para instruções detalhadas, consulte:

- **README.md** - Visão geral completa
- **GUIA-DEPLOY.md** - Deploy passo a passo com prints
- **INTEGRACAO-QUIZ.md** - Como integrar o quiz
- **RESUMO-PROJETO.md** - Detalhes técnicos

---

## 🆘 Problemas Comuns

### Backend não inicia
- Verifique se o banco de dados está acessível
- Confirme que todas as variáveis de ambiente estão corretas
- Veja os logs: `npm run dev` (local) ou Render > Logs (produção)

### Frontend não conecta
- Verifique se `VITE_API_URL` está correto
- Teste o backend diretamente: `https://sua-api.com/health`
- Verifique CORS: `FRONTEND_URL` deve estar no backend

### Erro ao fazer login
- Verifique se as tabelas foram criadas (`npm run db:setup`)
- Tente criar uma nova conta usando "Criar conta"
- Veja logs do backend para detalhes

---

## 🎯 Próximos Passos

Após ter o CRM funcionando:

1. ✅ Altere a senha do admin
2. ✅ Adicione um lead de teste
3. ✅ Explore o dashboard
4. ✅ Teste a exportação de dados
5. ✅ Integre o quiz (veja INTEGRACAO-QUIZ.md)

---

## 💡 Dicas

- Use o plano gratuito para testar
- Faça backup do banco regularmente
- Monitore os logs para detectar problemas
- Atualize as dependências periodicamente

---

**Dúvidas?** Consulte a documentação completa nos arquivos `.md` do projeto.

