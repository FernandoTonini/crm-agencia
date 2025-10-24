import OpenAI from 'openai';

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Processar descrição de contrato com IA
 * Extrai: serviços, valores, prazos
 * 
 * Exemplo de entrada:
 * "contrato de 3 meses por 750 de trafego, midias sociais e site"
 * 
 * Exemplo de saída:
 * {
 *   services: [
 *     { name: "Tráfego Pago", value: 250 },
 *     { name: "Mídias Sociais", value: 250 },
 *     { name: "Desenvolvimento de Site", value: 250 }
 *   ],
 *   totalValue: 750,
 *   duration: 3,
 *   totalContract: 2250
 * }
 */
export const processContractDescription = async (description) => {
  try {
    const prompt = `Você é um assistente especializado em processar descrições de contratos de marketing digital e desenvolvimento web.

Analise a seguinte descrição de contrato e extraia as informações em formato JSON:

DESCRIÇÃO: "${description}"

Retorne APENAS um objeto JSON válido (sem markdown, sem explicações) com esta estrutura:
{
  "services": [
    {
      "name": "Nome do Serviço (padronizado)",
      "value": valor_mensal_em_reais_numero
    }
  ],
  "totalValue": valor_total_mensal_numero,
  "duration": duracao_em_meses_numero,
  "totalContract": valor_total_do_contrato_numero
}

REGRAS:
1. Padronize os nomes dos serviços:
   - "trafego", "tráfego", "ads" → "Tráfego Pago"
   - "midias", "mídias sociais", "social media" → "Mídias Sociais"
   - "site", "website", "landing page" → "Desenvolvimento de Site"
   - "seo" → "SEO"
   - "email", "email marketing" → "Email Marketing"
   - "design", "design gráfico" → "Design Gráfico"
   - "copywriting", "redação" → "Copywriting"
   - "consultoria" → "Consultoria"

2. Se o valor total for informado mas não houver divisão por serviço, divida igualmente entre os serviços mencionados

3. Se não houver valor mencionado, retorne null nos campos de valor

4. Se não houver duração mencionada, retorne null em duration

5. Calcule totalContract = totalValue * duration

6. Valores devem ser números (sem R$, sem vírgulas)

Exemplo:
Entrada: "contrato de 3 meses por 750 de trafego, midias sociais e site"
Saída:
{
  "services": [
    {"name": "Tráfego Pago", "value": 250},
    {"name": "Mídias Sociais", "value": 250},
    {"name": "Desenvolvimento de Site", "value": 250}
  ],
  "totalValue": 750,
  "duration": 3,
  "totalContract": 2250
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo mais barato e rápido
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em processar contratos. Retorne APENAS JSON válido, sem markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Baixa temperatura para respostas mais consistentes
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Remover markdown se houver
    const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse do JSON
    const result = JSON.parse(jsonText);

    // Validar estrutura
    if (!result.services || !Array.isArray(result.services)) {
      throw new Error('Resposta da IA inválida: services não é um array');
    }

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Erro ao processar contrato com IA:', error);
    
    // Se der erro, retornar estrutura vazia
    return {
      success: false,
      error: error.message,
      data: {
        services: [],
        totalValue: null,
        duration: null,
        totalContract: null
      }
    };
  }
};

/**
 * Verificar se a API Key está configurada
 */
export const isConfigured = () => {
  return !!process.env.OPENAI_API_KEY;
};

