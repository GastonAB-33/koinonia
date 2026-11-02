import { LexiconAnalysis } from '../../types/lexicon';

export const MOCK_LEXICON_DATABASE: Record<string, LexiconAnalysis> = {
  // === GÉNESIS (HEBREO) ===
  'principio': {
    wordOrPhrase: 'En el principio',
    originalText: 'בְּרֵאשִׁית',
    transliteration: 'Bərē’šîṯ (Bereshit)',
    language: 'hebrew',
    strongNumber: 'H7225',
    morphology: 'Preposición בְּ (be) + Sustantivo femenino singular constructo רֵאשִׁית (reshit)',
    rootWord: 'רֹאשׁ (rosh - cabeza, primero, fuente)',
    definition: 'El punto de partida temporal primordial; la cabecera del tiempo y el cosmos cósmico.',
    theologicalContext: 'En la teología veterotestamentaria, "Bereshit" no designa solo un instante cronológico, sino la inauguración del cosmos como el templo cósmico de Yahvé. Conecta directamente con Juan 1:1, donde el Apóstol Juan retoma la misma expresión para señalar la preexistencia eterna del Verbo (Logos).',
    occurrencesCount: 51,
    crossReferences: ['Génesis 1:1', 'Juan 1:1', 'Colosenses 1:15-17', 'Hebreos 1:10']
  },
  'creó': {
    wordOrPhrase: 'creó',
    originalText: 'בָּרָא',
    transliteration: 'Bārā’ (Bara)',
    language: 'hebrew',
    strongNumber: 'H1254',
    morphology: 'Verbo Qal, perfecto, 3ra persona masculino singular',
    rootWord: 'בָּרָא (bara)',
    definition: 'Crear, moldear de la nada (creatio ex nihilo); actividad exclusivamente divina en las Escrituras.',
    theologicalContext: 'En la Biblia hebrea, el sujeto del verbo "Bara" es SIEMPRE Dios (Elohim). Ningún ser humano ni criatura puede hacer "bara". Implica traer existencia, orden y propósito allí donde había caos o inexistencia absoluta.',
    occurrencesCount: 48,
    crossReferences: ['Génesis 1:1', 'Isaías 40:26', 'Salmos 51:10', 'Efesios 2:10']
  },
  'espíritu': {
    wordOrPhrase: 'Espíritu de Dios',
    originalText: 'רוּחַ אֱלֹהִים',
    transliteration: 'Rûaḥ ’Ělōhîm (Ruaj Elohim)',
    language: 'hebrew',
    strongNumber: 'H7307',
    morphology: 'Sustantivo común femenino singular en estado constructo',
    rootWord: 'רוּחַ (ruach - viento, aliento, espíritu vital)',
    definition: 'Aliento de vida, fuerza vigorizante divina, la Tercera Persona de la Trinidad en acción vivificante.',
    theologicalContext: 'El Espíritu "se cernía" (meraḥepet) sobre las aguas primordiales, una imagen tierna similar al ave que empolla a sus polluelos (Dt 32:11), prefigurando la nueva creación y la regeneración espiritual que obra el Espíritu Santo en el creyente.',
    occurrencesCount: 378,
    crossReferences: ['Génesis 1:2', 'Salmos 104:30', 'Ezequiel 37:9', 'Hechos 2:2']
  },
  'luz': {
    wordOrPhrase: 'la luz',
    originalText: 'אוֹר',
    transliteration: '’Ôr (Or)',
    language: 'hebrew',
    strongNumber: 'H216',
    morphology: 'Sustantivo común masculino singular',
    rootWord: 'אוֹר (or - alumbrar, amanecer)',
    definition: 'Luz natural, resplandor divino, orden, revelación y verdad.',
    theologicalContext: 'La primera orden creativa es la llegada de la luz antes de la creación de las lumbreras astronómicas (día 4), lo que subraya que Dios mismo es la fuente primordial de luz y vida espiritual.',
    occurrencesCount: 120,
    crossReferences: ['Génesis 1:3', 'Salmos 27:1', 'Isaías 60:1', '1 Juan 1:5']
  },

  // === JUAN (GRIEGO) ===
  'verbo': {
    wordOrPhrase: 'el Verbo (la Palabra)',
    originalText: 'ὁ Λόγος',
    transliteration: 'ho Lógos',
    language: 'greek',
    strongNumber: 'G3056',
    morphology: 'Artículo definido + Sustantivo masculino nominativo singular',
    rootWord: 'λέγω (lego - decir, hablar, razonar)',
    definition: 'La Palabra, el Verbo divino, la expresión y revelación encarnada del pensamiento y corazón de Dios.',
    theologicalContext: 'Juan fusiona magistralmente dos horizontes culturales: la "Memra" o Palabra creadora divina de los targumes judíos (Salmo 33:6: "Por la palabra del Señor fueron hechos los cielos") y el Logos de la filosofía griega (la Razón cósmica). Pero Juan revoluciona ambos conceptos: el Logos no es una fuerza abstracta, es una Persona eterna que se hizo carne (Juan 1:14).',
    occurrencesCount: 330,
    crossReferences: ['Juan 1:1', 'Juan 1:14', '1 Juan 1:1', 'Apocalipsis 19:13']
  },
  'vida': {
    wordOrPhrase: 'la vida',
    originalText: 'ἡ Ζωή',
    transliteration: 'he Zōē',
    language: 'greek',
    strongNumber: 'G2222',
    morphology: 'Sustantivo femenino nominativo singular',
    rootWord: 'ζάω (zao - vivir)',
    definition: 'Vida en sentido absoluto, vida increada y divina; vida eterna que proviene del Padre.',
    theologicalContext: 'El Nuevo Testamento distingue entre "Bios" (la existencia biológica terrenal) y "Zoe" (la vida increada, abundante y eterna que reside en Dios). En Jesús no solo hay sabiduría; en Él está la Zoe misma que imparte vida eterna a quienes creen.',
    occurrencesCount: 135,
    crossReferences: ['Juan 1:4', 'Juan 10:10', 'Juan 14:6', '1 Juan 5:11-12']
  },
  'habitó': {
    wordOrPhrase: 'habitó entre nosotros',
    originalText: 'ἐσκήνωσεν',
    transliteration: 'eskēnōsen',
    language: 'greek',
    strongNumber: 'G4637',
    morphology: 'Verbo aoristo activo indicativo, 3ra persona singular',
    rootWord: 'σκηνόω (skenoo - plantar tabernáculo, habitar en carpa)',
    definition: 'Puso su carpa / tabernaculizó en medio de los seres humanos.',
    theologicalContext: 'Alusión directa al Tabernáculo del Éxodo (Mishkán), donde la presencia de la Gloria de Dios (Shejiná) moraba en el desierto entre su pueblo. En Cristo, la tienda de campaña divina ya no es de telas y bronce, sino de carne y hueso humana.',
    occurrencesCount: 5,
    crossReferences: ['Éxodo 25:8', 'Juan 1:14', 'Apocalipsis 21:3']
  },
  'gracia': {
    wordOrPhrase: 'gracia',
    originalText: 'Χάρις',
    transliteration: 'Cháris (Jaris)',
    language: 'greek',
    strongNumber: 'G5485',
    morphology: 'Sustantivo femenino nominativo singular',
    rootWord: 'χαίρω (chairo - regocijarse, inclinarse con favor)',
    definition: 'Favor inmerecido, benevolencia soberana, deleite libre y amor salvador conferido al pecador.',
    theologicalContext: 'Equivalente al hebreo "Jesed" (amor leal y pactual). En Juan 1:14 y 1:17 se describe a Cristo como lleno de gracia y verdad, superando la administración de la Ley como un manantial inagotable: "gracia sobre gracia".',
    occurrencesCount: 156,
    crossReferences: ['Juan 1:16', 'Romanos 3:24', 'Efesios 2:8-9', 'Tito 2:11']
  },

  // === ROMANOS 8 (GRIEGO) ===
  'condenación': {
    wordOrPhrase: 'ninguna condenación',
    originalText: 'οὐδὲν κατάκριμα',
    transliteration: 'Ouden katákrima',
    language: 'greek',
    strongNumber: 'G2631',
    morphology: 'Adjetivo negativo + Sustantivo neutro acusativo singular',
    rootWord: 'κατά (contra) + κρίνω (juzgar)',
    definition: 'Veredicto adverso con su correspondiente ejecución de pena penal.',
    theologicalContext: 'Término estrictamente forense y judicial. El sufijo "-ma" enfatiza no solo el juicio en sí, sino el castigo derivado. Pablo declara con énfasis absoluto (iniciando la frase en griego con Ouden = ¡Absolutamente nada!) que el creyente en Cristo está libre de todo cargo y de toda penalidad eterna.',
    occurrencesCount: 3,
    crossReferences: ['Romanos 8:1', 'Romanos 5:16', 'Romanos 5:18', 'Juan 5:24']
  },
  'adopción': {
    wordOrPhrase: 'espíritu de adopción',
    originalText: 'υἱοθεσία',
    transliteration: 'Huiothesía',
    language: 'greek',
    strongNumber: 'G5206',
    morphology: 'Sustantivo femenino genitivo singular',
    rootWord: 'υἱός (hijo) + τίθημι (colocar, posicionar legalmente)',
    definition: 'Institución legal que confiere la condición, herencia y derechos plenos de un hijo legítimo.',
    theologicalContext: 'En el derecho romano del siglo I, un hijo adoptado cortaba legalmente todo lazo con sus deudas y condición servil anterior, recibiendo el apellido del nuevo padre y el derecho irrevocable a la herencia total familiar. Pablo usa esto para contrastar el espíritu de esclavitud con la paternidad del Dios vivo.',
    occurrencesCount: 5,
    crossReferences: ['Romanos 8:15', 'Gálatas 4:5', 'Efesios 1:5']
  },
  'ayudan': {
    wordOrPhrase: 'cooperan / ayudan a bien',
    originalText: 'συνεργεῖ',
    transliteration: 'Synergei',
    language: 'greek',
    strongNumber: 'G4903',
    morphology: 'Verbo presente activo indicativo, 3ra persona singular',
    rootWord: 'σύν (junto con) + ἔργον (obra, labor, acción)',
    definition: 'Trabajar en sinergia, orquestar armoniosamente diversos elementos hacia un fin común.',
    theologicalContext: 'En los mejores manuscritos antiguos (Papiro 46, Códice Sinaítico y Vaticano), la lectura más probable es: "Dios hace cooperar todas las cosas para bien". No es un optimismo ingenuo ni karma cósmico; es la mano soberana de Dios tejiendo incluso el sufrimiento terrenal en la conformación a la imagen de Su Hijo.',
    occurrencesCount: 5,
    crossReferences: ['Romanos 8:28', '1 Corintios 16:16', '2 Corintios 6:1', 'Santiago 2:22']
  },
  'vencedores': {
    wordOrPhrase: 'más que vencedores',
    originalText: 'ὑπερνικῶμεν',
    transliteration: 'Hypernikōmen',
    language: 'greek',
    strongNumber: 'G5245',
    morphology: 'Verbo presente activo indicativo, 1ra persona plural',
    rootWord: 'ὑπέρ (por encima de, sobremanera) + νικάω (vencer, conquistar)',
    definition: 'Superconquistadores, victoriosos con creces y gloria inconmovible.',
    theologicalContext: 'Un término exuberante y paulino ("hiper-vencedores"). La victoria no radica en evitar tribulación, angustia o espada (v. 35), sino en que ninguna de esas pruebas puede arrebatar al creyente del amor de Cristo; por el contrario, en medio de ellas, la gloria de Dios triunfa.',
    occurrencesCount: 1,
    crossReferences: ['Romanos 8:37', '1 Juan 5:4', 'Apocalipsis 12:11']
  }
};
