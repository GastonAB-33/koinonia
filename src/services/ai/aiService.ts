import { LexiconAnalysis } from '../../types/lexicon';

export interface IAIService {
  /**
   * Realiza un análisis exegético del término o versículo en sus lenguas originales (Hebreo / Griego)
   */
  analyzeOriginalLanguage(verseRef: string, wordOrPhrase: string): Promise<LexiconAnalysis>;

  /**
   * Genera un resumen teológico o sugerencia de conexiones para la pizarra
   */
  suggestCrossReferences(topicOrVerse: string): Promise<string[]>;
}

export { geminiService as aiService, getGeminiApiKey, setGeminiApiKey } from './geminiAIService';
