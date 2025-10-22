# Guia Completo de Deploy - CRM A Agência

Este documento fornece instruções detalhadas para fazer o deploy do CRM em produção usando **Render** (backend) e **Vercel** (frontend) com banco de dados **TiDB Cloud**.

## 📋 Pré-requisitos

Antes de começar, você precisará criar contas gratuitas nos seguintes serviços:

- **GitHub** - para hospedar o código ([github.com](https://github.com))
- **TiDB Cloud** - para o banco de dados MySQL ([tidbcloud.com](https://tidbcloud.com))
- **Render** - para o backend API ([render.com](https://render.com))
- **Vercel** - para o frontend ([vercel.com](https://vercel.com))

## Parte 1: Preparar o Banco de Dados (TiDB Cloud)

O TiDB Cloud oferece um cluster MySQL gratuito compatível com o CRM.

### Passo 1.1: Criar Conta no TiDB Cloud

1. Acesse [tidbcloud.com](https://tidbcloud.com)
2. Clique em **"Sign Up"** (Cadastrar)
3. Crie sua conta usando email ou GitHub
4. Confirme seu email

### Passo 1.2: Criar Cluster Gratuito

1. No dashboard, clique em **"Create Cluster"**
2. Selecione **"Serverless Tier"** (gratuito)
3. Escolha a região **"US West (Oregon)"** ou mais próxima de você
4. Dê um nome ao cluster: **"crm-agencia"**
5. Clique em **"Create"**
6. Aguarde 2-3 minutos até o cluster ficar pronto

### Passo 1.3: Obter String de Conexão

1. Clique no cluster criado
2. Clique em **"Connect"**
3. Selecione **"General"** como tipo de conexão
4. Copie a **Connection String** (algo como):
   ```
   mysql://usuario.root:senha@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/test
   ```
5. **IMPORTANTE**: Guarde essa string em um lugar seguro!

### Passo 1.4: Criar Tabelas do Banco

1. No TiDB Cloud, clique em **"SQL Editor"** (no menu lateral)
2. Cole o conteúdo do arquivo `backend/database/schema.sql`
3. Clique em **"Run"** para executar
4. Verifique se as 3 tabelas foram criadas: `users`, `leads`, `contracts`

**Pronto!** Seu banco de dados está configurado.

---

## Parte 2: Preparar o Código no GitHub

### Passo 2.1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique no **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Nome: **"crm-agencia"**
5. Descrição: **"Sistema CRM com glassmorphism"**
6. Deixe como **"Public"** (ou Private se preferir)
7. **NÃO** marque "Initialize with README"
8. Clique em **"Create repository"**

### Passo 2.2: Fazer Upload do Código

Você tem duas opções:

**Opção A: Via Interface Web (Mais Fácil)**

1. No seu repositório criado, clique em **"uploading an existing file"**
2. Arraste a pasta `crm-novo` inteira para o GitHub
3. Escreva uma mensagem: **"Initial commit"**
4. Clique em **"Commit changes"**

**Opção B: Via Git (Linha de Comando)**

```bash
cd /caminho/para/crm-novo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/crm-agencia.git
git push -u origin main
```

**Pronto!** Seu código está no GitHub.

---

## Parte 3: Deploy do Backend (Render)

### Passo 3.1: Criar Conta no Render

1. Acesse [render.com](https://render.com)
2. Clique em **"Get Started"**
3. Cadastre-se usando sua conta do GitHub (recomendado)
4. Autorize o Render a acessar seus repositórios

### Passo 3.2: Criar Web Service

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório **"crm-agencia"**
4. Se não aparecer, clique em **"Configure account"** e autorize o acesso

### Passo 3.3: Configurar o Serviço

Preencha os campos:

- **Name**: `crm-agencia-api`
- **Region**: `Oregon (US West)` (ou mais próxima)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### Passo 3.4: Adicionar Variáveis de Ambiente

Role até a seção **"Environment Variables"** e adicione:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *Cole sua connection string do TiDB Cloud* |
| `JWT_SECRET` | *Gere uma senha aleatória forte (ex: `meu_secret_super_seguro_123abc`)* |
| `FRONTEND_URL` | *Deixe em branco por enquanto, vamos preencher depois* |

**Como gerar JWT_SECRET seguro:**
- Opção 1: Use um gerador online: [randomkeygen.com](https://randomkeygen.com)
- Opção 2: Invente uma senha longa e aleatória (mínimo 32 caracteres)

### Passo 3.5: Fazer Deploy

1. Clique em **"Create Web Service"**
2. Aguarde 3-5 minutos enquanto o Render faz o build
3. Quando aparecer **"Live"** em verde, seu backend está online!
4. Copie a URL (algo como `https://crm-agencia-api.onrender.com`)

### Passo 3.6: Testar o Backend

Abra no navegador:
```
https://crm-agencia-api.onrender.com/health
```

Você deve ver:
```json
{
  "success": true,
  "message": "CRM API está funcionando",
  "timestamp": "2024-..."
}
```

**Pronto!** Seu backend está funcionando.

---

## Parte 4: Deploy do Frontend (Vercel)

### Passo 4.1: Criar Conta na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Sign Up"**
3. Cadastre-se usando sua conta do GitHub
4. Autorize a Vercel a acessar seus repositórios

### Passo 4.2: Importar Projeto

1. No dashboard da Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Encontre seu repositório **"crm-agencia"**
4. Clique em **"Import"**

### Passo 4.3: Configurar o Projeto

Preencha os campos:

- **Project Name**: `crm-agencia`
- **Framework Preset**: `Vite`
- **Root Directory**: Clique em **"Edit"** e selecione `frontend`
- **Build Command**: `npm run build` (já vem preenchido)
- **Output Directory**: `dist` (já vem preenchido)

### Passo 4.4: Adicionar Variável de Ambiente

Na seção **"Environment Variables"**, adicione:

| Name | Value |
|------|-------|
| `VITE_API_URL` | *Cole a URL do seu backend Render (ex: `https://crm-agencia-api.onrender.com`)* |

### Passo 4.5: Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos enquanto a Vercel faz o build
3. Quando aparecer **"Congratulations!"**, seu frontend está online!
4. Clique em **"Visit"** para ver seu CRM

### Passo 4.6: Configurar Domínio Personalizado (Opcional)

Se você tem o domínio `painel.agenciaa.com`:

1. Na Vercel, vá em **"Settings"** > **"Domains"**
2. Clique em **"Add"**
3. Digite: `painel.agenciaa.com`
4. Siga as instruções para configurar o DNS

---

## Parte 5: Atualizar CORS no Backend

Agora que temos a URL do frontend, precisamos atualizar o backend:

1. Volte ao Render
2. Acesse seu serviço **"crm-agencia-api"**
3. Vá em **"Environment"**
4. Edite a variável `FRONTEND_URL`
5. Cole a URL do seu frontend Vercel (ex: `https://crm-agencia.vercel.app`)
6. Clique em **"Save Changes"**
7. O Render vai reiniciar automaticamente

---

## Parte 6: Testar o CRM Completo

### Passo 6.1: Acessar o CRM

1. Abra a URL do seu frontend (Vercel)
2. Você verá a tela de login

### Passo 6.2: Fazer Login

Use as credenciais padrão:
- **Email**: `admin@agenciaa.com`
- **Senha**: `admin123`

### Passo 6.3: Explorar o Sistema

1. **Dashboard**: Veja as estatísticas e gráficos
2. **Leads**: Adicione um lead manualmente para testar
3. **Contratos**: Crie um contrato vinculado ao lead

### Passo 6.4: Testar Integração do Quiz

O quiz pode enviar dados para:
```
POST https://crm-agencia-api.onrender.com/api/leads
```

---

## 🔧 Troubleshooting

### Problema: Backend não inicia no Render

**Solução:**
1. Vá em **"Logs"** no Render
2. Procure por erros de conexão com banco de dados
3. Verifique se a `DATABASE_URL` está correta
4. Teste a conexão com o banco no TiDB Cloud

### Problema: Frontend não conecta com backend

**Solução:**
1. Abra o Console do navegador (F12)
2. Procure por erros de CORS
3. Verifique se `VITE_API_URL` está correto na Vercel
4. Verifique se `FRONTEND_URL` está correto no Render

### Problema: Erro 401 ao fazer login

**Solução:**
1. Verifique se o usuário admin foi criado no banco
2. Execute novamente o script `schema.sql` no TiDB Cloud
3. Tente criar uma nova conta usando o botão "Criar conta"

### Problema: Render mostra "Service Unavailable"

**Solução:**
1. O plano gratuito do Render "hiberna" após 15 minutos de inatividade
2. A primeira requisição após hibernação demora 30-60 segundos
3. Aguarde e recarregue a página
4. Considere fazer um "ping" periódico para manter o serviço ativo

---

## 📊 Monitoramento

### Logs do Backend (Render)

1. Acesse seu serviço no Render
2. Clique em **"Logs"**
3. Veja todas as requisições em tempo real

### Logs do Frontend (Vercel)

1. Acesse seu projeto na Vercel
2. Clique em **"Deployments"**
3. Clique em um deployment
4. Veja os logs de build

### Banco de Dados (TiDB Cloud)

1. Acesse o TiDB Cloud
2. Vá em **"Monitoring"**
3. Veja uso de CPU, memória e queries

---

## 🔄 Como Atualizar o CRM

### Atualizar Código

1. Faça as alterações no código local
2. Commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Descrição das alterações"
   git push
   ```
3. **Render** e **Vercel** fazem deploy automático!

### Atualizar Banco de Dados

1. Acesse o SQL Editor no TiDB Cloud
2. Execute suas queries de alteração
3. Exemplo: adicionar coluna
   ```sql
   ALTER TABLE leads ADD COLUMN nova_coluna VARCHAR(255);
   ```

---

## 💰 Custos

### Plano Gratuito

Com os planos gratuitos, você tem:

- **TiDB Cloud**: 5GB de armazenamento
- **Render**: 750 horas/mês (suficiente para 1 serviço 24/7)
- **Vercel**: 100GB de bandwidth/mês

### Quando Atualizar

Considere planos pagos quando:
- Mais de 1000 leads/mês
- Mais de 10.000 visitas/mês
- Necessidade de uptime garantido (sem hibernação)

---

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Altere a senha do admin
2. ✅ Configure o domínio personalizado
3. ✅ Integre o quiz com a API
4. ✅ Configure backup do banco de dados
5. ✅ Adicione mais usuários ao sistema

---

## 📞 Suporte

Se encontrar problemas:

1. Consulte a seção **Troubleshooting** acima
2. Verifique os logs no Render e Vercel
3. Teste cada componente separadamente (banco, backend, frontend)
4. Revise as variáveis de ambiente

---

**Parabéns!** 🎉 Seu CRM está online e funcionando!

