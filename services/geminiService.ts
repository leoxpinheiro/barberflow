import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_SERVICES, MOCK_PROFESSIONALS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const servicesList = MOCK_SERVICES.map(s => `${s.name} (R$${s.price})`).join(', ');
    const prosList = MOCK_PROFESSIONALS.map(p => p.name).join(', ');

    const systemPrompt = `
      Você é o "Agendador IA" do sistema BarberFlow.
      Seu tom é educado, profissional e prestativo.
      Seu objetivo é ajudar o cliente a agendar um horário ou tirar dúvidas.
      
      Dados do estabelecimento:
      - Serviços disponíveis: ${servicesList}
      - Profissionais: ${prosList}
      - Horário de funcionamento: Segunda a Sábado, das 09:00 às 19:00.
      
      Regras:
      1. Se o cliente quiser agendar, pergunte qual serviço e horário preferido.
      2. Seja breve e direto.
      3. Responda sempre em Português do Brasil.
      4. Se perguntarem preços, use a lista acima.
      
      Usuário disse: "${userMessage}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return response.text || "Desculpe, não consegui entender. Pode repetir?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Estou tendo dificuldades para conectar ao servidor de inteligência agora. Pode tentar agendar manualmente pelos botões?";
  }
};

export interface Suggestion {
  serviceId?: string;
  date?: string;
  time?: string;
  intent: 'booking' | 'info' | 'greeting';
}

// Advanced function to extract structured intent for the UI to react
export const analyzeIntent = async (userMessage: string): Promise<Suggestion> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analise a mensagem do usuário e extraia a intenção em JSON.
      Serviços IDs disponíveis: ${MOCK_SERVICES.map(s => `${s.name}=${s.id}`).join(', ')}.
      Mensagem: "${userMessage}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, enum: ['booking', 'info', 'greeting'] },
            serviceId: { type: Type.STRING, nullable: true },
            time: { type: Type.STRING, nullable: true },
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return { intent: 'info' };
    return JSON.parse(text) as Suggestion;
  } catch (e) {
    console.error(e);
    return { intent: 'info' };
  }
}

export const generateMarketingCopy = async (idea: string, storeName: string): Promise<string> => {
  try {
    const prompt = `
      Atue como um especialista em Marketing Digital para Barbearias e Salões.
      O nome do estabelecimento é: "${storeName}".
      
      Sua tarefa: Criar um texto curto, altamente persuasivo e engajador para ser enviado no WhatsApp dos clientes.
      
      A ideia/motivo da promoção é: "${idea}".
      
      Regras:
      1. Use emojis relevantes (barba, tesoura, fogo, etc).
      2. Seja informal e direto (estilo "Fala campeão!").
      3. Inclua uma Chamada para Ação (CTA) no final convidando para agendar pelo link.
      4. O texto não deve ser muito longo (máximo 3 parágrafos curtos).
      5. Não coloque "Assunto:" ou aspas, apenas o corpo da mensagem.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8, // Um pouco mais criativo
      }
    });

    return response.text || "Olá! Estamos com horários disponíveis. Agende agora!";
  } catch (error) {
    console.error("Marketing AI Error:", error);
    return "Não foi possível gerar o texto agora. Tente novamente.";
  }
};