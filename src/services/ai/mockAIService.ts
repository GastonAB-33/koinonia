import { LexiconAnalysis } from '../../types/lexicon';
import { IAIService } from './aiService';
import { MOCK_LEXICON_DATABASE } from './mockAIData';

/**
 * MockAIService simula las respuestas de análisis exegético que proveerá Google Gemini.
 * Permite examinar palabras en griego y hebreo con transliteración, morfología y contexto teológico.
 */
export class MockAIService implements IAIService {
  async analyzeOriginalLanguage(verseRef: string, wordOrPhrase: string): Promise<LexiconAnalysis> {
    // Simular latencia de inferencia de IA (200ms)
    await new Promise((resolve) => setTimeout(resolve, 180));

    const clean = wordOrPhrase.toLowerCase().trim();

    // Buscar coincidencia directa o parcial en la base léxica
    for (const [key, analysis] of Object.entries(MOCK_LEXICON_DATABASE)) {
      if (clean.includes(key) || key.includes(clean)) {
        return analysis;
      }
    }

    // Si es un término no catalogado específicamente, generamos un análisis realista contextual
    const isOT = verseRef.includes('Génesis') || verseRef.includes('Salmo') || verseRef.includes('Isaías');
    const lang = isOT ? 'hebrew' : 'greek';

    // TODO: Integrar Google Gemini API aquí
    // const prompt = `Realiza una exégesis teológica del término "${wordOrPhrase}" en ${verseRef}.`;
    // const aiResult = await geminiClient.generateContent(prompt);
    // return JSON.parse(aiResult);

    return {
      wordOrPhrase,
      originalText: isOT ? 'חֶסֶד וֶאֱמֶת' : 'πλήρωμα τῆς χάριτος',
      transliteration: isOT ? 'Jésed ve’emet' : 'Plerōma tēs charitos',
      language: lang,
      strongNumber: isOT ? 'H2617' : 'G4138',
      morphology: 'Sustantivo en construcción con cláusula teológica',
      rootWord: isOT ? 'חָסַד (jasad)' : 'πληρόω (plēroō)',
      definition: `Término central en ${verseRef} que denota plenitud de pacto, amor inquebrantable y fidelidad divina.`,
      theologicalContext: `En el contexto canónico de ${verseRef}, este vocablo comunica la fidelidad inmutable del Dios de Israel y la revelación redentora completada en el Mesías. Aporta una riqueza conceptual insustituible respecto a las traducciones contemporáneas convencionales.`,
      occurrencesCount: 42,
      crossReferences: [verseRef, 'Salmos 89:14', 'Efesios 1:7', 'Colosenses 2:9']
    };
  }

  async suggestCrossReferences(_topicOrVerse: string): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [
      'Génesis 1:1 - Creación primordial y soberanía divina',
      'Juan 1:1-3 - La preexistencia del Verbo y su rol cocreador',
      'Colosenses 1:16-17 - Todas las cosas fueron creadas por medio de Él y para Él',
      'Hebreos 1:1-3 - Dios ha hablado por el Hijo, resplandor de su gloria'
    ];
  }
}

export const aiService = new MockAIService();
