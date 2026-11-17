import { LexiconAnalysis } from '../../types/lexicon';
import { IAIService } from './aiService';
import { MockAIService } from './mockAIService';

const STORAGE_KEY = 'koinonia_gemini_api_key';

export interface WorkingCandidate {
  apiVersion: 'v1' | 'v1beta';
  model: string;
}

const PREFERRED_ORDER = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro'
];

const DEFAULT_FALLBACK_CANDIDATES: WorkingCandidate[] = [
  { apiVersion: 'v1', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-2.0-flash' },
  { apiVersion: 'v1', model: 'gemini-1.5-flash-8b' },
  { apiVersion: 'v1beta', model: 'gemini-2.0-flash-exp' },
  { apiVersion: 'v1', model: 'gemini-1.5-pro' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-pro' }
];

let cachedWorkingCandidate: WorkingCandidate | null = null;

async function getCandidateEndpoints(apiKey: string): Promise<WorkingCandidate[]> {
  if (cachedWorkingCandidate) {
    return [
      cachedWorkingCandidate,
      ...DEFAULT_FALLBACK_CANDIDATES.filter(
        (c) => !(c.apiVersion === cachedWorkingCandidate!.apiVersion && c.model === cachedWorkingCandidate!.model)
      )
    ];
  }

  const discovered: WorkingCandidate[] = [];

  // Consultar endpoints de listado en v1 y v1beta
  for (const apiVersion of ['v1', 'v1beta'] as const) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`, {
        headers: { 'x-goog-api-key': apiKey }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.models)) {
          const supported = data.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => m.name.replace(/^models\//, ''));

          for (const model of supported) {
            discovered.push({ apiVersion, model });
          }
        }
      }
    } catch {
      // Ignorar y seguir al siguiente endpoint
    }
  }

  if (discovered.length > 0) {
    discovered.sort((a, b) => {
      const indexA = PREFERRED_ORDER.indexOf(a.model);
      const indexB = PREFERRED_ORDER.indexOf(b.model);
      const scoreA = indexA >= 0 ? indexA : 999;
      const scoreB = indexB >= 0 ? indexB : 999;
      return scoreA - scoreB;
    });

    cachedWorkingCandidate = discovered[0];
    return discovered;
  }

  return DEFAULT_FALLBACK_CANDIDATES;
}

/**
 * Filtra y limpia cualquier fuga de metadatos, razonamiento o etiquetas generadas por el modelo,
 * y une palabras partidas con guión al final de línea ('adora-' 'ción' -> 'adoración').
 */
export function cleanTranscriptionText(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText.trim();

  // 1. Si el modelo volcó su razonamiento o estructura de prompt ('Role: ... Task: ...'):
  // Buscar si colocó el bloque real detrás de "Content: # " o "Content:"
  const contentMarkerMatch = cleaned.match(/(?:^|\n)\*?\s*Content:\s*([\s\S]+)/i);
  if (contentMarkerMatch && contentMarkerMatch[1]) {
    cleaned = contentMarkerMatch[1].trim();
  }

  // 2. Eliminar líneas de metadatos o auto-corrección que el modelo haya agregado
  const lines = cleaned.split('\n');
  const filteredLines = lines.filter((line) => {
    const l = line.trim();
    if (!l) return true;
    if (/^\*?\s*Role\s*:/i.test(l)) return false;
    if (/^\*?\s*Task\s*:/i.test(l)) return false;
    if (/^\*?\s*Requirements\s*:/i.test(l)) return false;
    if (/^\*?\s*Context\s*:/i.test(l)) return false;
    if (/^\*?\s*Input Image\s*:/i.test(l)) return false;
    if (/^\*?\s*Logo\s*:/i.test(l)) return false;
    if (/^\*?\s*Check (?:spelling|punctuation|structure)\s*:/i.test(l)) return false;
    if (/^\*?\s*(?:Professional|Maximum fidelity|Markdown structure|Includes page info)\?/i.test(l)) return false;
    if (/^\*?\s*\(Self-Correction/i.test(l)) return false;
    if (/^\*?\s*Text verification\s*:/i.test(l)) return false;
    if (/^\*?\s*Note on the cut-off\s*:/i.test(l)) return false;
    if (/^\*?\s*Header\s*:\s*Page\s*#?\d+/i.test(l)) return false;
    if (/^\*?\s*Paragraph\s+\d+\s*:/i.test(l)) return false;
    if (/^\*?\s*Body\s*:\s*Standard paragraphs/i.test(l)) return false;
    return true;
  });

  cleaned = filteredLines.join('\n').trim();

  // 3. Unir palabras con guión cortadas al final de una línea: ej. "adora-\nción" -> "adoración"
  cleaned = cleaned.replace(/(\b[a-záéíóúñA-ZÁÉÍÓÚÑ]{2,})-\s*\n\s*([a-záéíóúñA-ZÁÉÍÓÚÑ]{2,}\b)/gu, '$1$2');

  // 4. Unir palabras cortadas con guión y espacio dentro de la misma línea producidas por OCR: ej. "adora- ción"
  cleaned = cleaned.replace(/(\b[a-záéíóúñA-ZÁÉÍÓÚÑ]{2,})-\s+([a-záéíóúñA-ZÁÉÍÓÚÑ]{2,}\b)/gu, '$1$2');

  return cleaned.trim();
}

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
    cachedWorkingCandidate = null;
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
    cachedWorkingCandidate = null;
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

    const candidates = await getCandidateEndpoints(key);
    let lastError = '';

    for (const candidate of candidates) {
      try {
        const url = `https://generativelanguage.googleapis.com/${candidate.apiVersion}/models/${candidate.model}:generateContent?key=${key}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key
          },
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
          cachedWorkingCandidate = candidate;
          return {
            success: true,
            message: `¡Conexión exitosa con Google Gemini (${candidate.model} en ${candidate.apiVersion})!`
          };
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

    const tryCallModel = async (candidate: WorkingCandidate) => {
      const url = `https://generativelanguage.googleapis.com/${candidate.apiVersion}/models/${candidate.model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
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
        throw new Error(errorData?.error?.message || `Error ${response.status} de Gemini (${candidate.model})`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Gemini no devolvió contenido.');

      const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(cleanJson);
    };

    const candidates = await getCandidateEndpoints(apiKey);
    let lastError: any = null;

    for (const candidate of candidates) {
      try {
        const parsed = await tryCallModel(candidate);
        cachedWorkingCandidate = candidate;

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
      } catch (err) {
        lastError = err;
        console.warn(`[GeminiAIService] Falló ${candidate.model} en ${candidate.apiVersion}:`, err);
      }
    }

    console.warn('[GeminiAIService] Falló la llamada a Gemini, recurriendo a Concordancia Strong local:', lastError);
    const fallback = await this.mockFallback.analyzeOriginalLanguage(verseRef, wordOrPhrase);
    return fallback;
  }

  async suggestCrossReferences(topicOrVerse: string): Promise<string[]> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return this.mockFallback.suggestCrossReferences(topicOrVerse);
    }

    const candidates = await getCandidateEndpoints(apiKey);

    for (const candidate of candidates) {
      try {
        const url = `https://generativelanguage.googleapis.com/${candidate.apiVersion}/models/${candidate.model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
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
        cachedWorkingCandidate = candidate;
        return JSON.parse(cleanJson);
      } catch {
        continue;
      }
    }

    return this.mockFallback.suggestCrossReferences(topicOrVerse);
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

    // Directiva OCR estricta para garantizar 100% de precisión y cero metatexto/alucinaciones
    const ocrDirective = `INSTRUCCIÓN OCR OBLIGATORIA:
Transcribe de manera textual y con máxima fidelidad todo el contenido visible de esta página.

REGLAS ESTRICTAS DE SALIDA:
1. Devuelve DIRECTAMENTE y EXCLUSIVAMENTE el texto transcripto en formato Markdown.
2. PROHIBIDO GENERAR INTRODUCCIONES, METADATOS O AUTO-CORRECCIÓN: No escribas "Role:", "Task:", "Logo:", "Paragraph 1:", "Note:", ni "(Self-Correction during drafting)".
3. Si una palabra está dividida por un guión al final de la línea (ej. "adora-" y "ción", o "indi-" y "vidual"), ÚNELA en una sola palabra completa ("adoración", "individual").
4. Respeta mayúsculas, comillas (ej. «...» o "..."), cursivas y signos de puntuación del texto impreso.
5. Si una oración se corta al final de la página visible, transcríbela con exactitud hasta la última palabra visible sin inventar texto.
6. Si la página tiene un título destacado (ej: "PRÓLOGO"), colócalo como encabezado Markdown (# PRÓLOGO).`;

    const promptText = customPrompt
      ? `${ocrDirective}\n\nDetalle de la página:\n${customPrompt}`
      : ocrDirective;

    const tryCallVision = async (candidate: WorkingCandidate) => {
      const url = `https://generativelanguage.googleapis.com/${candidate.apiVersion}/models/${candidate.model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: 'Eres un sistema OCR de precisión editorial. Extrae y transcribe fielmente el texto de la imagen a Markdown limpio. Nunca incluyas comentarios, ni análisis de rol, ni etiquetas de párrafos, ni auto-corrección. Devuelve únicamente el texto transcripto.'
              }
            ]
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType || 'image/jpeg',
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
            temperature: 0.0,
            topP: 0.95
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message || `Error ${response.status} de Gemini (${candidate.model} en ${candidate.apiVersion})`
        );
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Gemini no devolvió texto de la imagen.');

      // Limpiar y perfeccionar el texto resultante
      return cleanTranscriptionText(rawText);
    };

    const candidates = await getCandidateEndpoints(apiKey);
    let lastError: any = null;

    for (const candidate of candidates) {
      try {
        const result = await tryCallVision(candidate);
        cachedWorkingCandidate = candidate;
        return result;
      } catch (err: any) {
        lastError = err;
        console.warn(`[GeminiAIService] Falló visión con ${candidate.model} en ${candidate.apiVersion}:`, err);
      }
    }

    console.warn('[GeminiAIService] Falló la llamada de visión a Gemini, recurriendo a Mock:', lastError);
    const fallback = await this.mockFallback.transcribeStudyImage(base64Data, mimeType, customPrompt);
    return `${fallback}\n\n*(Nota de respaldo: Transcripción simulada generada porque falló la conexión con la clave de IA: ${lastError?.message || 'Error de modelos'}). Puedes verificar tu API Key de Google AI Studio en el botón "Configurar Clave".*`;
  }
}

export const geminiService = new GeminiAIService();
