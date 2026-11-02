export type OriginalLanguage = 'hebrew' | 'greek' | 'aramaic';

export interface LexiconAnalysis {
  wordOrPhrase: string;
  originalText: string;        // e.g., בְּרֵאשִׁית or Λόγος
  transliteration: string;     // e.g., "Bereshit" or "Logos"
  language: OriginalLanguage;
  strongNumber: string;        // e.g., "H7225" or "G3056"
  morphology: string;          // e.g., "Sustantivo masculino singular"
  rootWord: string;            // e.g., "רֹאשׁ (rosh)"
  definition: string;          // Definición sucinta
  theologicalContext: string;  // Explicación teológica e histórica simulada por IA
  occurrencesCount: number;    // Ocurrencias en el texto bíblico
  crossReferences: string[];   // Pasajes clave relacionados
}
