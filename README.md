# CRM A Agência

Sistema completo de gestão de leads e contratos para quiz de qualificação.

## 🚀 Funcionalidades

- ✅ Dashboard interativo com gráficos em tempo real
- ✅ Gestão completa de leads com classificação automática (Quente/Morno/Frio)
- ✅ Sistema de contratos com cálculo automático de receita
- ✅ Exportação de dados (emails, telefones, Instagrams, localizações)
- ✅ Geolocalização automática via IP
- ✅ Sistema de auditoria completo
- ✅ Glassmorphism ultra futurístico
- ✅ Totalmente responsivo

## 📋 Pré-requisitos

- Node.js 18+ 
- MySQL 8+ (ou TiDB Cloud)
- Conta Manus OAuth

## 🔧 Instalação Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Executar migrações do banco de dados
npm run db:push

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🌐 Deploy

Veja o arquivo `GUIA-DEPLOY-GITHUB-RENDER.md` para instruções completas de deploy usando GitHub e Render.

## 📚 Documentação

- `GUIA-INSTALACAO-CRM.md` - Guia completo de instalação e uso
- `GUIA-DEPLOY-GITHUB-RENDER.md` - Guia de deploy em produção

## 🛠️ Tecnologias

- **Frontend:** React 19 + Vite + TailwindCSS + shadcn/ui
- **Backend:** Express 4 + tRPC 11
- **Banco de Dados:** MySQL 8 + Drizzle ORM
- **Autenticação:** Manus OAuth
- **Gráficos:** Recharts
- **Storage:** S3

## 📄 Licença

Desenvolvido por Manus AI para A Agência.

## 📞 Suporte

Para suporte, entre em contato através do painel do Manus.

