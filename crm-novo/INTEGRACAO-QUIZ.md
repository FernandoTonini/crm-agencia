# Integração do Quiz com o CRM

Este documento explica como integrar o quiz do WordPress/Elementor com o CRM para capturar leads automaticamente.

## 📋 Visão Geral

O quiz envia dados para **dois destinos simultaneamente**:

1. **Google Sheets** - Para backup e análise rápida
2. **CRM API** - Para gestão completa de leads

## 🔌 Endpoint da API

O quiz deve enviar uma requisição POST para:

```
POST https://sua-api.onrender.com/api/leads
```

**Importante**: Substitua `sua-api.onrender.com` pela URL real do seu backend Render.

## 📦 Formato dos Dados

### Campos Obrigatórios

```javascript
{
  "name": "Nome do Lead",
  "email": "email@example.com",
  "phone": "(11) 99999-9999",
  "score": 85,
  "classification": "Quente"
}
```

### Campos Opcionais

```javascript
{
  "instagram": "instagram_handle",
  "question1": "Resposta da pergunta 1",
  "question2": "Resposta da pergunta 2",
  "question3": "Resposta da pergunta 3",
  "question4": "Resposta da pergunta 4",
  "question5": "Resposta da pergunta 5",
  "question6": "Resposta da pergunta 6",
  "question7": "Resposta da pergunta 7",
  "ipAddress": "123.456.789.0"
}
```

### Classificação Automática

A classificação é baseada no score:

- **Quente**: score >= 70
- **Morno**: score >= 40 e < 70
- **Frio**: score < 40

## 💻 Código de Exemplo

### Exemplo Completo (JavaScript)

```javascript
// Função para enviar lead para o CRM
async function enviarParaCRM(dadosLead) {
  const API_URL = 'https://sua-api.onrender.com/api/leads';
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosLead)
    });

    const resultado = await response.json();
    
    if (resultado.success) {
      console.log('Lead enviado com sucesso para o CRM!');
      return true;
    } else {
      console.error('Erro ao enviar lead:', resultado.message);
      return false;
    }
  } catch (error) {
    console.error('Erro de conexão:', error);
    return false;
  }
}

// Exemplo de uso após o quiz
const dadosDoQuiz = {
  name: document.getElementById('nome').value,
  email: document.getElementById('email').value,
  phone: document.getElementById('telefone').value,
  instagram: document.getElementById('instagram').value,
  score: calcularScore(), // Sua função de cálculo de score
  classification: classificarLead(score),
  question1: respostas[0],
  question2: respostas[1],
  question3: respostas[2],
  question4: respostas[3],
  question5: respostas[4],
  question6: respostas[5],
  question7: respostas[6],
  ipAddress: await obterIP()
};

// Enviar para CRM
await enviarParaCRM(dadosDoQuiz);

// Enviar para Google Sheets (seu código existente)
await enviarParaGoogleSheets(dadosDoQuiz);
```

### Função para Obter IP do Usuário

```javascript
async function obterIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Erro ao obter IP:', error);
    return null;
  }
}
```

### Função para Classificar Lead

```javascript
function classificarLead(score) {
  if (score >= 70) return 'Quente';
  if (score >= 40) return 'Morno';
  return 'Frio';
}
```

## 🔄 Fluxo Completo

```
1. Usuário responde quiz
   ↓
2. JavaScript calcula score
   ↓
3. JavaScript classifica lead (Quente/Morno/Frio)
   ↓
4. JavaScript obtém IP do usuário
   ↓
5. Envio PARALELO:
   ├─→ Google Sheets (backup)
   └─→ CRM API (gestão)
   ↓
6. CRM processa:
   ├─→ Salva no banco de dados
   ├─→ Obtém geolocalização via IP
   └─→ Cria registro completo
   ↓
7. Lead aparece no dashboard do CRM
```

## 🎨 Exemplo de Integração no WordPress

### Opção 1: Via Elementor Form

1. Crie um formulário no Elementor
2. Adicione os campos necessários
3. Em **Actions After Submit**, adicione **Webhook**
4. Configure:
   - **Webhook URL**: `https://sua-api.onrender.com/api/leads`
   - **Method**: `POST`
   - **Fields Mapping**:
     ```
     name: [field id="nome"]
     email: [field id="email"]
     phone: [field id="telefone"]
     instagram: [field id="instagram"]
     score: [field id="score"]
     classification: [field id="classification"]
     question1: [field id="q1"]
     question2: [field id="q2"]
     ...
     ```

### Opção 2: Via JavaScript Customizado

Adicione no **Custom HTML** do Elementor:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#seu-form-quiz');
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Coletar dados do formulário
    const formData = new FormData(form);
    const dados = {
      name: formData.get('nome'),
      email: formData.get('email'),
      phone: formData.get('telefone'),
      instagram: formData.get('instagram'),
      score: parseInt(formData.get('score')),
      classification: formData.get('classification'),
      question1: formData.get('q1'),
      question2: formData.get('q2'),
      question3: formData.get('q3'),
      question4: formData.get('q4'),
      question5: formData.get('q5'),
      question6: formData.get('q6'),
      question7: formData.get('q7'),
      ipAddress: await obterIP()
    };
    
    // Enviar para CRM
    try {
      const response = await fetch('https://sua-api.onrender.com/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      
      const resultado = await response.json();
      
      if (resultado.success) {
        alert('Quiz enviado com sucesso!');
        form.reset();
      } else {
        alert('Erro ao enviar quiz. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão. Verifique sua internet.');
    }
  });
});

async function obterIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return null;
  }
}
</script>
```

## 🧪 Testar a Integração

### Teste Manual via Postman/Insomnia

1. Abra Postman ou Insomnia
2. Crie uma nova requisição POST
3. URL: `https://sua-api.onrender.com/api/leads`
4. Headers:
   ```
   Content-Type: application/json
   ```
5. Body (raw JSON):
   ```json
   {
     "name": "Teste Lead",
     "email": "teste@example.com",
     "phone": "(11) 99999-9999",
     "instagram": "teste_instagram",
     "score": 85,
     "classification": "Quente",
     "question1": "Resposta 1",
     "question2": "Resposta 2",
     "question3": "Resposta 3",
     "question4": "Resposta 4",
     "question5": "Resposta 5",
     "question6": "Resposta 6",
     "question7": "Resposta 7",
     "ipAddress": "123.456.789.0"
   }
   ```
6. Clique em **Send**
7. Verifique se recebeu resposta de sucesso
8. Acesse o CRM e veja se o lead apareceu

### Teste via Navegador (Console)

Abra o Console do navegador (F12) e cole:

```javascript
fetch('https://sua-api.onrender.com/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Teste Console',
    email: 'console@test.com',
    phone: '(11) 98888-8888',
    score: 75,
    classification: 'Quente'
  })
})
.then(res => res.json())
.then(data => console.log('Sucesso:', data))
.catch(err => console.error('Erro:', err));
```

## 🔒 Segurança

### Endpoint Público

O endpoint `/api/leads` é **público** (não requer autenticação) para permitir que o quiz envie dados.

### Proteções Implementadas

1. **Validação de dados**: Campos obrigatórios são verificados
2. **Sanitização**: Dados são limpos antes de salvar
3. **Rate limiting**: (Recomendado adicionar) Limitar requisições por IP
4. **CORS**: Apenas domínios autorizados podem enviar dados

### Recomendações

1. Configure CORS para aceitar apenas seu domínio:
   ```javascript
   // No backend, editar server.js
   app.use(cors({
     origin: ['https://seusite.com', 'https://www.seusite.com']
   }));
   ```

2. Adicione rate limiting (opcional):
   ```bash
   npm install express-rate-limit
   ```

## 📊 Monitoramento

### Ver Leads Recebidos

1. Acesse o CRM
2. Vá em **Leads**
3. Os leads do quiz aparecem com status **"novo"**

### Logs no Render

1. Acesse seu serviço no Render
2. Clique em **Logs**
3. Veja todas as requisições POST recebidas

## ❓ Troubleshooting

### Erro: CORS blocked

**Problema**: Navegador bloqueia requisição por CORS

**Solução**:
1. Verifique se `FRONTEND_URL` está configurado no Render
2. Adicione o domínio do seu site WordPress nas configurações de CORS

### Erro: 400 Bad Request

**Problema**: Dados enviados estão incorretos

**Solução**:
1. Verifique se todos os campos obrigatórios estão sendo enviados
2. Verifique o formato dos dados (JSON válido)
3. Veja os logs no Render para detalhes do erro

### Erro: 500 Internal Server Error

**Problema**: Erro no servidor

**Solução**:
1. Verifique os logs no Render
2. Verifique se o banco de dados está acessível
3. Teste a conexão com o banco no TiDB Cloud

### Lead não aparece no CRM

**Problema**: Requisição foi enviada mas lead não aparece

**Solução**:
1. Verifique se a resposta da API foi `success: true`
2. Acesse o banco de dados diretamente e veja se o lead foi salvo
3. Recarregue a página de Leads no CRM

## 📝 Checklist de Integração

- [ ] Backend deployado no Render
- [ ] Endpoint `/api/leads` testado e funcionando
- [ ] CORS configurado corretamente
- [ ] Quiz modificado para enviar dados
- [ ] Teste manual realizado com sucesso
- [ ] Lead de teste apareceu no CRM
- [ ] Geolocalização funcionando
- [ ] Google Sheets continua recebendo dados

---

**Pronto!** Seu quiz está integrado com o CRM e capturando leads automaticamente.

