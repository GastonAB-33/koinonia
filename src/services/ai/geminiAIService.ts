import { LexiconAnalysis } from '../../types/lexicon';
import { IAIService } from './aiService';
import { MockAIService } from './mockAIService';

const STORAGE_KEY = 'koinonia_gemini_api_key';
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash';
const LEGACY_MODEL = 'gemini-1.5-flash';

/**
 * Obtiene la API Key configurada por el usuario (en localStorage o variable de entorno de Vite)
 */
export function getGeminiApiKey(): string {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : '';
  if (localKey && localKey.trim()) return localKey.trim();

  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) return envKey.trim();

  return '';
}

/**
 * Guarda o elimina la API Key en el almacenamiento local del navegador
 */
export function setGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key || !key.trim()) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

/**
 * Servicio de Inteligencia Artificial conectado con Google Gemini API en vivo
 */
export class GeminiAIService implements IAIService {
  private mockFallback = new MockAIService();

  hasApiKey(): boolean {
    return Boolean(getGeminiApiKey());
  }

  async testConnection(apiKeyToTest?: string): Promise<{ success: boolean; message: string }> {
    const key = apiKeyToTest || getGeminiApiKey();
    if (!key) {
      return { success: false, message: 'No se ha proporcionado ninguna API Key.' };
    }

    const models = [PRIMARY_MODEL, FALLBACK_MODEL, LEGACY_MODEL];
    let lastError = '';

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: 'Responde {"status":"OK"} en formato JSON' }]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          })
        });

        if (response.ok) {
          return { success: true, message: `¡Conexión exitosa con Google Gemini AI (${model})!` };
        }

        const errorData = await response.json().catch(() => ({}));
        lastError = errorData?.error?.message || `Error HTTP ${response.status}: ${response.statusText}`;
      } catch (err: any) {
        lastError = err?.message || 'Error de red al conectar con Gemini.';
      }
    }

    return { success: false, message: lastError || 'No se pudo conectar con Gemini.' };
  }

  async analyzeOriginalLanguage(verseRef: string, wordOrPhrase: string): Promise<LexiconAnalysis> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      console.info('[GeminiAIService] Sin API Key configurada. Usando MockAIService.');
      return this.mockFallback.analyzeOriginalLanguage(verseRef, wordOrPhrase);
    }

    const prompt = `Actúa como un teólogo erudito y lingüista experto en Hebreo Bíblico, Griego Koiné y Arameo Bíblico.
Analiza la palabra o frase "${wordOrPhrase}" en el contexto bíblico exacto del versículo "${verseRef}".

Genera un análisis léxico, morfológico, etimológico y exegético profundo.
IMPORTANTE: Redacta la definición, morfología y el comentario teológico en ESPAÑOL fluido, elegante y teológicamente riguroso.
Responde ÚNICAMENTE con un objeto JSON válido con exactamente los siguientes campos:

{
  "wordOrPhrase": "${wordOrPhrase}",
  "originalText": "Palabra exacta en el idioma original (hebreo con niqqud/vocales o griego con acentos politónicos)",
  "transliteration": "Transliteración fonética al español (ej. 'Bereshit', 'Logos', 'Jésed')",
  "language": "hebrew" | "greek" | "aramaic",
  "strongNumber": "Número Strong correspondiente (ej. 'H7225' o 'G3056')",
  "morphology": "Análisis morfológico y gramatical detallado en español (ej. 'Sustantivo masculino singular constructo', 'Verbo en aoristo activo indicativo')",
  "rootWord": "Palabra raíz o lema original con su transliteración en español",
  "definition": "Definición léxica precisa y rango semántico del término en este contexto bíblico en español",
  "theologicalContext": "Comentario teológico y trasfondo histórico exegético en español. Explica la riqueza doctrinal que este vocablo comunica en el versículo y cómo se conecta con el plan redentor de Dios.",
  "occurrencesCount": 10,
  "crossReferences": ["Referencia bíblica 1", "Referencia bíblica 2", "Referencia bíblica 3"]
}`;

    const tryCallModel = async (model: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Error ${response.status} de Gemini (${model})`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Gemini no devolvió contenido.');

      const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(cleanJson);
    };

    try {
      let parsed: any;
      try {
        parsed = await tryCallModel(PRIMARY_MODEL);
      } catch (primaryErr) {
        console.warn(`[GeminiAIService] Falló ${PRIMARY_MODEL}, reintentando con ${FALLBACK_MODEL}:`, primaryErr);
        try {
          parsed = await tryCallModel(FALLBACK_MODEL);
        } catch (fallbackErr) {
          console.warn(`[GeminiAIService] Falló ${FALLBACK_MODEL}, reintentando con ${LEGACY_MODEL}:`, fallbackErr);
          parsed = await tryCallModel(LEGACY_MODEL);
        }
      }

      const langLower = String(parsed.language || '').toLowerCase();
      const normalizedLang =
        langLower.includes('heb') ? 'hebrew' : langLower.includes('aram') ? 'aramaic' : 'greek';

      return {
        wordOrPhrase: parsed.wordOrPhrase || wordOrPhrase,
        originalText: parsed.originalText || wordOrPhrase,
        transliteration: parsed.transliteration || '',
        language: normalizedLang,
        strongNumber: parsed.strongNumber || 'S/N',
        morphology: parsed.morphology || 'Término bíblico',
        rootWord: parsed.rootWord || parsed.originalText || '',
        definition: parsed.definition || 'Sin definición disponible.',
        theologicalContext: parsed.theologicalContext || '',
        occurrencesCount: typeof parsed.occurrencesCount === 'number' ? parsed.occurrencesCount : 1,
        crossReferences: Array.isArray(parsed.crossReferences) ? parsed.crossReferences : [verseRef]
      };
    } catch (error: any) {
      console.warn('[GeminiAIService] Falló la llamada a Gemini, recurriendo a Concordancia Strong local:', error);
      const fallback = await this.mockFallback.analyzeOriginalLanguage(verseRef, wordOrPhrase);
      return fallback;
    }
  }

  async suggestCrossReferences(topicOrVerse: string): Promise<string[]> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return this.mockFallback.suggestCrossReferences(topicOrVerse);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${PRIMARY_MODEL}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Provee 4 referencias cruzadas clave para "${topicOrVerse}". Responde ÚNICAMENTE en JSON como un arreglo de cadenas: ["Libro Cap:Ver - Breve nota en español", ...]`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) throw new Error('Error al sugerir referencias cruzadas.');
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return this.mockFallback.suggestCrossReferences(topicOrVerse);
    }
  }

  async transcribeStudyImage(
    base64Data: string,
    mimeType: string = 'image/jpeg',
    customPrompt?: string
  ): Promise<string> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      console.info('[GeminiAIService] Sin API Key configurada. Usando Mock.');
      return this.mockFallback.transcribeStudyImage(base64Data, mimeType, customPrompt);
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

    const promptText =
      customPrompt ||
      `Actúa como un erudito bíblico y transcriptor exegético profesional.
Analiza con máxima precisión la imagen adjunta, que contiene notas manuscritas, apuntes de un cuaderno de estudio bíblico, bosquejos pastorales o páginas de comentarios/Escrituras.

INSTRUCCIONES CLAVE:
1. Transcribe con fidelidad todo el contenido visible. Si hay letra cursiva o difícil, deduce el término bíblico/teológico correcto por el contexto.
2. Identifica y conserva con exactitud versículos citados (ej. "Ro 8:28", "Jn 1:1").
3. Si aparecen términos o palabras en griego o hebreo (o sus transliteraciones), transcríbelas con esmero.
4. Organiza la salida en Markdown enriquecido y ordenado:
   - Usa encabezados (# Título principal, ## Secciones, ### Subpuntos).
   - Usa listas numeradas o con viñetas para las divisiones del estudio.
   - Usa bloques de cita (> «...») para pasajes bíblicos.
   - Usa negritas (*término*) para conceptos centrales.
5. NO agregues saludos ni comentarios explicativos como "Aquí tienes la transcripción", entrega directamente el texto formateado del estudio bíblico listo para ser leído y editado.`;

    const tryCallVision = async (model: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: cleanBase64
                  }
                },
                {
                  text: promptText
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.15
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Error ${response.status} de Gemini (${model})`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Gemini no devolvió texto de la imagen.');
      return rawText.trim();
    };

    try {
      try {
        return await tryCallVision(PRIMARY_MODEL);
      } catch (err1) {
        console.warn(`[GeminiAIService] Falló visión con ${PRIMARY_MODEL}, reintentando con ${FALLBACK_MODEL}:`, err1);
        try {
          return await tryCallVision(FALLBACK_MODEL);
        } catch (err2) {
          console.warn(`[GeminiAIService] Falló visión con ${FALLBACK_MODEL}, reintentando con ${LEGACY_MODEL}:`, err2);
          return await tryCallVision(LEGACY_MODEL);
        }
      }
    } catch (finalErr: any) {
      console.warn('[GeminiAIService] Falló la llamada de visión a Gemini, recurriendo a Mock:', finalErr);
      const fallback = await this.mockFallback.transcribeStudyImage(base64Data, mimeType, customPrompt);
      return `${fallback}\n\n*(Nota de respaldo: Transcripción simulada generada porque falló la conexión con la clave de IA: ${finalErr.message})*`;
    }
  }
}

export const geminiService = new GeminiAIService();