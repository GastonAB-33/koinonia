import { LexiconAnalysis, OriginalLanguage } from '../../types/lexicon';
import { IAIService } from './aiService';
import { MOCK_LEXICON_DATABASE } from './mockAIData';
import {
  SPANISH_STRONG_CURATED,
  translateStrongDefinition,
  translateStrongMorphology
} from '../lexicon/strongSpanishDictionary';

let greekDict: Record<string, any> | null = null;
let hebrewDict: Record<string, any> | null = null;

async function loadDictionaries() {
  if (typeof window === 'undefined') return;
  if (!greekDict) {
    try {
      const res = await fetch('/data/lexicon/strongs-greek.json');
      if (res.ok) greekDict = await res.json();
    } catch (e) {}
  }
  if (!hebrewDict) {
    try {
      const res = await fetch('/data/lexicon/strongs-hebrew.json');
      if (res.ok) hebrewDict = await res.json();
    } catch (e) {}
  }
}

/**
 * MockAIService provee análisis léxico y exegético:
 * 1. Consulta los diccionarios reales de Strong (Griego y Hebreo) traducidos al español.
 * 2. Mantiene compatibilidad con la base pre-catalogada y fallbacks inteligentes.
 */
export class MockAIService implements IAIService {
  async analyzeOriginalLanguage(verseRef: string, wordOrPhrase: string): Promise<LexiconAnalysis> {
    await loadDictionaries();

    const clean = wordOrPhrase.toLowerCase().trim();

    // 1. Si es directamente un código Strong (ej. H7363 o G3056)
    const strongMatch = wordOrPhrase.trim().toUpperCase().match(/^([HG])(\d+)$/);
    if (strongMatch) {
      const code = wordOrPhrase.trim().toUpperCase();
      const isG = strongMatch[1] === 'G';
      const dict = isG ? greekDict : hebrewDict;
      const entry = dict?.[code];
      if (entry) {
        const curated = SPANISH_STRONG_CURATED[code];
        const spanishMorph = curated ? curated.morphology : translateStrongMorphology(entry.derivation || '');
        const spanishDef = curated ? curated.translation : translateStrongDefinition(entry.strongs_def || entry.kjv_def || '');
        const contextText = curated
          ? `${curated.explanation}\n\nUso bíblico: ${curated.usage}`
          : `Definición léxica de Concordancia Strong: ${spanishDef}.\n\nFormas frecuentes en las Escrituras: ${translateStrongDefinition(entry.kjv_def || '')}.`;

        return {
          wordOrPhrase,
          originalText: entry.lemma || '',
          transliteration: entry.translit || entry.xlit || (entry.pron ? `${entry.pron}` : ''),
          language: isG ? 'greek' : 'hebrew',
          strongNumber: code,
          morphology: spanishMorph,
          rootWord: curated ? curated.morphology : translateStrongMorphology(entry.derivation || entry.lemma),
          definition: spanishDef,
          theologicalContext: contextText,
          occurrencesCount: curated ? 35 : (isG ? 45 : 30),
          crossReferences: [verseRef]
        };
      }
    }

    // 2. Buscar coincidencia en la base léxica en español precatalogada
    for (const [key, analysis] of Object.entries(MOCK_LEXICON_DATABASE)) {
      if (clean.includes(key) || key.includes(clean)) {
        return analysis;
      }
    }

    // 3. Determinar idioma según el libro del versículo
    const ntBooks = [
      'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos', 'Corintios', 'Gálatas',
      'Efesios', 'Filipenses', 'Colosenses', 'Tesalonicenses', 'Timoteo', 'Tito',
      'Filemón', 'Hebreos', 'Santiago', 'Pedro', 'Judas', 'Apocalipsis'
    ];
    const isNT = ntBooks.some((b) => verseRef.includes(b));
    const lang: OriginalLanguage = isNT ? 'greek' : 'hebrew';

    return {
      wordOrPhrase,
      originalText: isNT ? 'λόγος' : 'רֵאשִׁית',
      transliteration: isNT ? 'Logos' : 'Reshit',
      language: lang,
      strongNumber: isNT ? 'G3056' : 'H7225',
      morphology: isNT ? 'Sustantivo griego koiné' : 'Sustantivo hebreo masorético',
      rootWord: isNT ? 'λέγω (legō)' : 'רֹאשׁ (rosh)',
      definition: `Término en ${verseRef}. Puedes activar el análisis con Gemini para exégesis completa.`,
      theologicalContext: `En el texto de ${verseRef}, este vocablo comunica la revelación en su lengua original (${lang === 'greek' ? 'Griego' : 'Hebreo'}).`,
      occurrencesCount: 42,
      crossReferences: [verseRef, 'Salmos 119:105', 'Juan 1:1']
    };
  }

  async suggestCrossReferences(_topicOrVerse: string): Promise<string[]> {
    return [
      'Génesis 1:1 - Creación primordial y soberanía divina',
      'Juan 1:1-3 - La preexistencia del Verbo y su rol cocreador',
      'Colosenses 1:16-17 - Todas las cosas fueron creadas por medio de Él y para Él',
      'Hebreos 1:1-3 - Dios ha hablado por el Hijo, resplandor de su gloria'
    ];
  }

  async transcribeStudyImage(_base64Data: string, _mimeType?: string, _customPrompt?: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return `# Estudio Bíblico: Romanos 8:28-30
## El Propósito Eterno de Dios

> «Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.» (Romanos 8:28 RVR1960)

### Puntos Principales:
1. **La certeza del creyente**: «Y sabemos» (*Oidamen*) - no es una esperanza incierta, sino una convicción arraigada en el carácter inmutable de Dios.
2. **El alcance de la providencia**: «Todas las cosas» - tanto victorias como sufrimientos obran coordinadamente bajo la soberanía divina.
3. **La cadena dorada de la redención (vv. 29-30)**:
   - *Conoció de antemano* (Prógnōsis)
   - *Predestinó* (Proōrisen)
   - *Llamó* (Ekalesen)
   - *Justificó* (Edikaiōsen)
   - *Glorificó* (Edoxasen)

### Aplicación Práctica:
- Descansar en que nada escapa al gobierno providencial de nuestro Padre celestial.
- Orar alineando nuestra voluntad con su designio redentor y no con nuestras circunstancias pasajeras.`;
  }
}

export const aiService = new MockAIService();
