/**
 * Diccionario y traductor de términos Strong (Hebreo y Griego) al Español
 */

// Glosario específico de términos teológicos y raíces frecuentes
export const SPANISH_STRONG_CURATED: Record<string, {
  translation: string;
  morphology: string;
  usage: string;
  explanation: string;
}> = {
  // Hebreo
  'H7363': {
    translation: 'Revolotear, empollar, cernirse, moverse suavemente, temblar',
    morphology: 'Verbo hebreo (Raíz primitiva)',
    usage: 'Aparece en Génesis 1:2 (el Espíritu se movía/cernía), Deuteronomio 32:11 (águila que revolotea) y Jeremías 23:9 (huesos que tiemblan).',
    explanation: 'Transmite la imagen tierna y protectora de un ave empollando su nido para dar calor y vida. En Génesis 1:2, describe al Espíritu Santo preparando el cosmos para traer orden y vida.'
  },
  'H7225': {
    translation: 'Principio, primicias, comienzo, cabecera',
    morphology: 'Sustantivo femenino singular constructo (de H7218 rosh, cabeza)',
    usage: 'Aparece 51 veces en el A.T. (Génesis 1:1, Proverbios 8:22, Jeremías 2:3).',
    explanation: 'No solo marca el inicio cronológico, sino la fuente, las primicias consagradas a Dios y el fundamento de todo lo creado.'
  },
  'H1254': {
    translation: 'Crear de la nada, dar forma primordial, fundar',
    morphology: 'Verbo Qal perfecto (Actividad exclusiva de Dios)',
    usage: 'Aparece 48 veces en el A.T. (Génesis 1:1, Isaías 40:26, Salmo 51:10).',
    explanation: 'En las Escrituras, el sujeto de "Bara" siempre es Dios (Elohim). Señala un acto creativo sin materia preexistente.'
  },
  'H430': {
    translation: 'Dios, Creador Supremo, Poderoso',
    morphology: 'Sustantivo plural de majestad (singular en significado)',
    usage: 'Aparece más de 2.600 veces en el A.T.',
    explanation: 'Forma plural intensiva que enfatiza la grandeza, omnipotencia y majestad del único Dios verdadero.'
  },
  'H8064': {
    translation: 'Cielos, firmamento, morada celeste',
    morphology: 'Sustantivo masculino dual/plural',
    usage: 'Aparece 420 veces en el A.T.',
    explanation: 'Abarca tanto el espacio atmosférico visible como la dimensión espiritual donde Dios manifiesta su trono.'
  },
  'H776': {
    translation: 'Tierra, suelo, mundo terrenal, territorio',
    morphology: 'Sustantivo femenino singular',
    usage: 'Aparece más de 2.500 veces en el A.T.',
    explanation: 'El ámbito terrenal habitado por el ser humano bajo el pacto y cuidado de Dios.'
  },
  'H7307': {
    translation: 'Espíritu, aliento, viento, soplo vital',
    morphology: 'Sustantivo común femenino',
    usage: 'Aparece 378 veces en el A.T.',
    explanation: 'El aliento de vida divino que anima a la creación y la Persona del Espíritu Santo que transforma los corazones.'
  },
  'H216': {
    translation: 'Luz, resplandor, iluminación divina',
    morphology: 'Sustantivo común masculino',
    usage: 'Aparece 120 veces en el A.T.',
    explanation: 'El primer mandato de Dios: disipar las tinieblas primordiales y revelar su gloria.'
  },

  // Griego
  'G3056': {
    translation: 'El Verbo, la Palabra eterna, la Expresión divina',
    morphology: 'Sustantivo masculino nominativo singular (de lego, hablar/razonar)',
    usage: 'Aparece 330 veces en el N.T. (Juan 1:1, 1:14, 1 Juan 1:1, Apocalipsis 19:13).',
    explanation: 'La Segunda Persona de la Trinidad; la comunicación perfecta, personal y encarnada del corazón de Dios hacia la humanidad.'
  },
  'G2316': {
    translation: 'Dios, Deidad Suprema',
    morphology: 'Sustantivo masculino singular',
    usage: 'Aparece más de 1.300 veces en el N.T.',
    explanation: 'El Dios viviente y verdadero, revelado plenamente en Jesucristo.'
  },
  'G2222': {
    translation: 'Vida divina, vida increada, vida eterna',
    morphology: 'Sustantivo femenino singular (Zoe)',
    usage: 'Aparece 135 veces en el N.T.',
    explanation: 'Diferente de "Bios" (vida biológica perecedera); es la plenitud de vida indestructible en Dios.'
  },
  'G5485': {
    translation: 'Gracia, favor inmerecido, benevolencia divina',
    morphology: 'Sustantivo femenino (Charis)',
    usage: 'Aparece 155 veces en el N.T.',
    explanation: 'La bondad soberana de Dios que salva y capacita al creyente sin ningún mérito propio.'
  },
  'G26': {
    translation: 'Amor sacrificial, afecto incondicional',
    morphology: 'Sustantivo femenino (Ágape)',
    usage: 'Aparece 116 veces en el N.T.',
    explanation: 'El amor divino que busca desinteresadamente el mayor bien del prójimo a costa de sí mismo.'
  },
  'G4151': {
    translation: 'Espíritu, viento, aliento santo',
    morphology: 'Sustantivo neutro (Pneuma)',
    usage: 'Aparece 385 veces en el N.T.',
    explanation: 'El Espíritu Santo de Dios, consolador, regenerador y guía del creyente.'
  },
  'G4102': {
    translation: 'Fe, convicción firme, fidelidad, confianza',
    morphology: 'Sustantivo femenino (Pistis)',
    usage: 'Aparece 244 veces en el N.T.',
    explanation: 'La confianza absoluta en la fidelidad y las promesas de Dios reveladas en Cristo.'
  }
};

/**
 * Traduce términos técnicos y gramaticales de la Concordancia Strong al español
 */
export function translateStrongMorphology(rawMorph: string): string {
  if (!rawMorph) return 'Término en idioma original';

  let text = rawMorph;
  text = text.replace(/a primitive root/gi, 'Raíz verbal primitiva');
  text = text.replace(/primitive root/gi, 'Raíz primitiva');
  text = text.replace(/from\s+([GH]\d+)/gi, 'Derivado de $1');
  text = text.replace(/from the same as\s+([GH]\d+)/gi, 'De la misma raíz que $1');
  text = text.replace(/masculine noun/gi, 'Sustantivo masculino');
  text = text.replace(/feminine noun/gi, 'Sustantivo femenino');
  text = text.replace(/proper name/gi, 'Nombre propio');
  text = text.replace(/proper masculine noun/gi, 'Nombre propio masculino');
  text = text.replace(/adjective/gi, 'Adjetivo');
  text = text.replace(/verb/gi, 'Verbo');
  text = text.replace(/preposition/gi, 'Preposición');
  text = text.replace(/adverb/gi, 'Adverbio');
  text = text.replace(/particle/gi, 'Partícula');
  text = text.replace(/pronoun/gi, 'Pronombre');
  text = text.replace(/conjunction/gi, 'Conjunción');
  text = text.replace(/interjection/gi, 'Interjección');

  return text;
}

/**
 * Traduce y limpia definiciones en inglés de Strong al español
 */
export function translateStrongDefinition(rawDef: string): string {
  if (!rawDef) return 'Definición disponible en léxico original.';

  let text = rawDef.trim();

  // Reemplazar patrones comunes de James Strong
  text = text.replace(/^to\s+/i, '');
  text = text.replace(/by implication,?/gi, '(en sentido figurado:');
  text = text.replace(/specifically,?/gi, 'específicamente:');
  text = text.replace(/literally,?/gi, 'literalmente:');
  text = text.replace(/figuratively,?/gi, 'figurativamente:');

  // Traducción de verbos y palabras frecuentes
  const GLOSSARY: Record<string, string> = {
    'brood': 'empollar, cernirse, proteger',
    'flutter': 'revolotear, vibrar suavemente',
    'shake': 'temblar, estremecerse',
    'move': 'moverse, desplazarse',
    'relax': 'ablandarse, relajarse',
    'relaxed': 'relajado, reposado',
    'create': 'crear, producir',
    'make': 'hacer, formar',
    'form': 'moldear, dar forma',
    'speak': 'hablar, declarar',
    'say': 'decir, afirmar',
    'word': 'palabra, mensaje, asunto',
    'father': 'padre, antepasado',
    'mother': 'madre',
    'son': 'hijo, descendiente',
    'daughter': 'hija',
    'brother': 'hermano',
    'beginning': 'principio, comienzo, primicias',
    'first': 'primero, principal',
    'chief': 'jefe, principal, cumbre',
    'head': 'cabeza, líder, fuente',
    'light': 'luz, resplandor, amanecer',
    'spirit': 'espíritu, aliento, viento',
    'wind': 'viento, soplo',
    'earth': 'tierra, suelo, territorio',
    'heaven': 'cielo, firmamento',
    'heavens': 'cielos, firmamento celeste',
    'water': 'agua, corriente',
    'waters': 'aguas, mares, corrientes',
    'love': 'amor, afecto benevolente',
    'grace': 'gracia, favor inmerecido',
    'peace': 'paz, plenitud, bienestar (Shalom)',
    'faith': 'fe, fidelidad, confianza',
    'holy': 'santo, consagrado, apartado',
    'king': 'rey, soberano',
    'kingdom': 'reino, reinado, dominio'
  };

  for (const [en, es] of Object.entries(GLOSSARY)) {
    const reg = new RegExp(`\\b${en}\\b`, 'gi');
    text = text.replace(reg, es);
  }

  return text;
}
