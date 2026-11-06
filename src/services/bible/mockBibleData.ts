import { BibleBook, BibleChapter, BibleVersion } from '../../types/bible';

export const BIBLE_BOOKS: BibleBook[] = [
  // Antiguo Testamento - Pentateuco
  { id: 'GEN', name: 'Génesis', testament: 'OT', chaptersCount: 50, order: 1 },
  { id: 'EXO', name: 'Éxodo', testament: 'OT', chaptersCount: 40, order: 2 },
  { id: 'LEV', name: 'Levítico', testament: 'OT', chaptersCount: 27, order: 3 },
  { id: 'NUM', name: 'Números', testament: 'OT', chaptersCount: 36, order: 4 },
  { id: 'DEU', name: 'Deuteronomio', testament: 'OT', chaptersCount: 34, order: 5 },
  // Históricos
  { id: 'JOS', name: 'Josué', testament: 'OT', chaptersCount: 24, order: 6 },
  { id: 'JDG', name: 'Jueces', testament: 'OT', chaptersCount: 21, order: 7 },
  { id: 'RUT', name: 'Rut', testament: 'OT', chaptersCount: 4, order: 8 },
  { id: '1SA', name: '1 Samuel', testament: 'OT', chaptersCount: 31, order: 9 },
  { id: '2SA', name: '2 Samuel', testament: 'OT', chaptersCount: 24, order: 10 },
  { id: '1KI', name: '1 Reyes', testament: 'OT', chaptersCount: 22, order: 11 },
  { id: '2KI', name: '2 Reyes', testament: 'OT', chaptersCount: 25, order: 12 },
  { id: '1CH', name: '1 Crónicas', testament: 'OT', chaptersCount: 29, order: 13 },
  { id: '2CH', name: '2 Crónicas', testament: 'OT', chaptersCount: 36, order: 14 },
  { id: 'EZR', name: 'Esdras', testament: 'OT', chaptersCount: 10, order: 15 },
  { id: 'NEH', name: 'Nehemías', testament: 'OT', chaptersCount: 13, order: 16 },
  { id: 'EST', name: 'Ester', testament: 'OT', chaptersCount: 10, order: 17 },
  // Poéticos
  { id: 'JOB', name: 'Job', testament: 'OT', chaptersCount: 42, order: 18 },
  { id: 'PSA', name: 'Salmos', testament: 'OT', chaptersCount: 150, order: 19 },
  { id: 'PRO', name: 'Proverbios', testament: 'OT', chaptersCount: 31, order: 20 },
  { id: 'ECC', name: 'Eclesiastés', testament: 'OT', chaptersCount: 12, order: 21 },
  { id: 'SNG', name: 'Cantares', testament: 'OT', chaptersCount: 8, order: 22 },
  // Profetas Mayores
  { id: 'ISA', name: 'Isaías', testament: 'OT', chaptersCount: 66, order: 23 },
  { id: 'JER', name: 'Jeremías', testament: 'OT', chaptersCount: 52, order: 24 },
  { id: 'LAM', name: 'Lamentaciones', testament: 'OT', chaptersCount: 5, order: 25 },
  { id: 'EZK', name: 'Ezequiel', testament: 'OT', chaptersCount: 48, order: 26 },
  { id: 'DAN', name: 'Daniel', testament: 'OT', chaptersCount: 12, order: 27 },
  // Profetas Menores
  { id: 'HOS', name: 'Oseas', testament: 'OT', chaptersCount: 14, order: 28 },
  { id: 'JOL', name: 'Joel', testament: 'OT', chaptersCount: 3, order: 29 },
  { id: 'AMO', name: 'Amós', testament: 'OT', chaptersCount: 9, order: 30 },
  { id: 'OBA', name: 'Abdías', testament: 'OT', chaptersCount: 1, order: 31 },
  { id: 'JON', name: 'Jonás', testament: 'OT', chaptersCount: 4, order: 32 },
  { id: 'MIC', name: 'Miqueas', testament: 'OT', chaptersCount: 7, order: 33 },
  { id: 'NAM', name: 'Nahúm', testament: 'OT', chaptersCount: 3, order: 34 },
  { id: 'HAB', name: 'Habacuc', testament: 'OT', chaptersCount: 3, order: 35 },
  { id: 'ZEP', name: 'Sofonías', testament: 'OT', chaptersCount: 3, order: 36 },
  { id: 'HAG', name: 'Hageo', testament: 'OT', chaptersCount: 2, order: 37 },
  { id: 'ZEC', name: 'Zacarías', testament: 'OT', chaptersCount: 14, order: 38 },
  { id: 'MAL', name: 'Malaquías', testament: 'OT', chaptersCount: 4, order: 39 },

  // Nuevo Testamento - Evangelios
  { id: 'MAT', name: 'Mateo', testament: 'NT', chaptersCount: 28, order: 40 },
  { id: 'MRK', name: 'Marcos', testament: 'NT', chaptersCount: 16, order: 41 },
  { id: 'LUK', name: 'Lucas', testament: 'NT', chaptersCount: 24, order: 42 },
  { id: 'JHN', name: 'Juan', testament: 'NT', chaptersCount: 21, order: 43 },
  // Histórico
  { id: 'ACT', name: 'Hechos', testament: 'NT', chaptersCount: 28, order: 44 },
  // Epístolas Paulinas
  { id: 'ROM', name: 'Romanos', testament: 'NT', chaptersCount: 16, order: 45 },
  { id: '1CO', name: '1 Corintios', testament: 'NT', chaptersCount: 16, order: 46 },
  { id: '2CO', name: '2 Corintios', testament: 'NT', chaptersCount: 13, order: 47 },
  { id: 'GAL', name: 'Gálatas', testament: 'NT', chaptersCount: 6, order: 48 },
  { id: 'EPH', name: 'Efesios', testament: 'NT', chaptersCount: 6, order: 49 },
  { id: 'PHP', name: 'Filipenses', testament: 'NT', chaptersCount: 4, order: 50 },
  { id: 'COL', name: 'Colosenses', testament: 'NT', chaptersCount: 4, order: 51 },
  { id: '1TH', name: '1 Tesalonicenses', testament: 'NT', chaptersCount: 5, order: 52 },
  { id: '2TH', name: '2 Tesalonicenses', testament: 'NT', chaptersCount: 3, order: 53 },
  { id: '1TI', name: '1 Timoteo', testament: 'NT', chaptersCount: 6, order: 54 },
  { id: '2TI', name: '2 Timoteo', testament: 'NT', chaptersCount: 4, order: 55 },
  { id: 'TIT', name: 'Tito', testament: 'NT', chaptersCount: 3, order: 56 },
  { id: 'PHM', name: 'Filemón', testament: 'NT', chaptersCount: 1, order: 57 },
  // Epístolas Generales
  { id: 'HEB', name: 'Hebreos', testament: 'NT', chaptersCount: 13, order: 58 },
  { id: 'JAS', name: 'Santiago', testament: 'NT', chaptersCount: 5, order: 59 },
  { id: '1PE', name: '1 Pedro', testament: 'NT', chaptersCount: 5, order: 60 },
  { id: '2PE', name: '2 Pedro', testament: 'NT', chaptersCount: 3, order: 61 },
  { id: '1JN', name: '1 Juan', testament: 'NT', chaptersCount: 5, order: 62 },
  { id: '2JN', name: '2 Juan', testament: 'NT', chaptersCount: 1, order: 63 },
  { id: '3JN', name: '3 Juan', testament: 'NT', chaptersCount: 1, order: 64 },
  { id: 'JUD', name: 'Judas', testament: 'NT', chaptersCount: 1, order: 65 },
  // Profético
  { id: 'REV', name: 'Apocalipsis', testament: 'NT', chaptersCount: 22, order: 66 },
];

export const MOCK_CHAPTERS: Record<string, Partial<Record<BibleVersion, BibleChapter>>> = {
  // ==================== GÉNESIS 1 ====================
  'GEN_1': {
    RVR1960: {
      bookId: 'GEN',
      bookName: 'Génesis',
      chapter: 1,
      version: 'RVR1960',
      verses: [
        { bookId: 'GEN', chapter: 1, verse: 1, text: 'En el principio creó Dios los cielos y la tierra.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 2, text: 'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 3, text: 'Y dijo Dios: Sea la luz; y fue la luz.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 4, text: 'Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 5, text: 'Y llamó Dios a la luz Día, y a las tinieblas llamó Noche. Y fue la tarde y la mañana un día.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 6, text: 'Luego dijo Dios: Haya expansión en medio de las aguas, y separe las aguas de las aguas.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 7, text: 'E hizo Dios la expansión, y separó las aguas que estaban debajo de la expansión, de las aguas que estaban sobre la expansión. Y fue así.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 8, text: 'Y llamó Dios a la expansión Cielos. Y fue la tarde y la mañana el día segundo.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 9, text: 'Dijo también Dios: Júntense las aguas que están debajo de los cielos en un lugar, y descúbrase lo seco. Y fue así.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 10, text: 'Y llamó Dios a lo seco Tierra, y a la reunión de las aguas llamó Mares. Y vio Dios que era bueno.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 11, text: 'Después dijo Dios: Produzca la tierra hierba verde, hierba que dé semilla; árbol de fruto que dé fruto según su género, que su semilla esté en él, sobre la tierra. Y fue así.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 12, text: 'Produjo, pues, la tierra hierba verde, hierba que da semilla según su naturaleza, y árbol que da fruto, cuya semilla está en él, según su especie. Y vio Dios que era bueno.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 13, text: 'Y fue la tarde y la mañana el día tercero.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 14, text: 'Dijo luego Dios: Haya lumbreras en la expansión de los cielos para separar el día de la noche; y sirvan de señales para las estaciones, para días y años,', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 15, text: 'y sean por lumbreras en la expansión de los cielos para alumbrar sobre la tierra. Y fue así.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 16, text: 'E hizo Dios las dos grandes lumbreras; la lumbrera mayor para que señorease en el día, y la lumbrera menor para que señorease en la noche; hizo también las estrellas.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 26, text: 'Entonces dijo Dios: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza; y señoree en los peces del mar, en las aves de los cielos, en las bestias, en toda la tierra, y en todo animal que se arrastra sobre la tierra.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 27, text: 'Y creó Dios al hombre a su imagen, a imagen de Dios lo creó; varón y hembra los creó.', version: 'RVR1960', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 31, text: 'Y vio Dios todo lo que había hecho, y he aquí que era bueno en gran manera. Y fue la tarde y la mañana el día sexto.', version: 'RVR1960', originalLanguage: 'hebrew' }
      ]
    },
    NVI: {
      bookId: 'GEN',
      bookName: 'Génesis',
      chapter: 1,
      version: 'NVI',
      verses: [
        { bookId: 'GEN', chapter: 1, verse: 1, text: 'Dios, en el principio, creó los cielos y la tierra.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 2, text: 'La tierra era un caos total, las tinieblas cubrían el abismo, y el Espíritu de Dios iba y venía sobre la superficie de las aguas.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 3, text: 'Y dijo Dios: «¡Que exista la luz!» Y la luz llegó a existir.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 4, text: 'Dios consideró que la luz era buena y la separó de las tinieblas.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 5, text: 'A la luz la llamó «día», y a las tinieblas, «noche». Y vino la noche, y llegó la mañana: ese fue el primer día.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 6, text: 'Y dijo Dios: «¡Que haya una expansión en medio de las aguas, y que las separe!»', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 7, text: 'Y así sucedió: Dios hizo la expansión y separó las aguas que estaban debajo de las aguas que estaban arriba.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 8, text: 'A la expansión Dios la llamó «cielo». Y vino la noche, y llegó la mañana: ese fue el segundo día.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 9, text: 'Y dijo Dios: «¡Que las aguas debajo del cielo se junten en un solo lugar, y que aparezca lo seco!» Y así sucedió.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 10, text: 'A lo seco Dios lo llamó «tierra», y al conjunto de aguas lo llamó «mares». Y Dios consideró que esto era bueno.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 11, text: 'Después dijo Dios: «¡Que produzca la tierra vegetación: toda clase de plantas con semilla y árboles con fruto según sus diversas especies!» Y así sucedió.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 12, text: 'La tierra produjo vegetación: plantas que dan semilla según su especie y árboles frutales cuya semilla está en su fruto. Y Dios consideró que esto era bueno.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 13, text: 'Y vino la noche, y llegó la mañana: ese fue el tercer día.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 14, text: 'Y dijo Dios: «¡Que haya luces en el firmamento para separar el día de la noche y servir de señales para las estaciones, los días y los años!»', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 15, text: '«¡Y que brillen en la bóveda celeste para iluminar la tierra!» Y así sucedió.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 16, text: 'Dios hizo las dos grandes lumbreras: la lumbrera mayor para gobernar el día y la menor para gobernar la noche. También hizo las estrellas.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 26, text: 'Y dijo: «Hagamos al ser humano a nuestra imagen y semejanza. Que tenga dominio sobre los peces del mar, las aves del cielo, los animales domésticos y todos los reptiles que se arrastran por el suelo».', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 27, text: 'Y Dios creó al ser humano a su imagen; lo creó a imagen de Dios. Hombre y mujer los creó.', version: 'NVI', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 31, text: 'Dios miró todo lo que había hecho, y vio que era muy bueno. Y vino la noche, y llegó la mañana: ese fue el sexto día.', version: 'NVI', originalLanguage: 'hebrew' }
      ]
    },
    DHH: {
      bookId: 'GEN',
      bookName: 'Génesis',
      chapter: 1,
      version: 'DHH',
      verses: [
        { bookId: 'GEN', chapter: 1, verse: 1, text: 'En el comienzo de todo, Dios creó el cielo y la tierra.', version: 'DHH', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 2, text: 'La tierra no tenía entonces ninguna forma; todo era un mar profundo cubierto de oscuridad, y el espíritu de Dios se movía sobre el agua.', version: 'DHH', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 3, text: 'Entonces Dios dijo: «¡Que haya luz!» Y hubo luz.', version: 'DHH', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 4, text: 'Al ver Dios que la luz era buena, la separó de la oscuridad,', version: 'DHH', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 5, text: 'y a la luz la llamó «día» y a la oscuridad «noche». De este modo se completó el primer día.', version: 'DHH', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 26, text: 'Entonces dijo: «Ahora hagamos al hombre a nuestra imagen. Él tendrá poder sobre los peces, las aves y todos los animales».', version: 'DHH', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 27, text: 'Cuando Dios creó al hombre, lo creó a su imagen; varón y mujer los creó.', version: 'DHH', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 31, text: 'Dios miró todo lo que había hecho, y vio que era muy bueno. Así se completó el sexto día.', version: 'DHH', originalLanguage: 'hebrew' }
      ]
    },
    LBLA: {
      bookId: 'GEN',
      bookName: 'Génesis',
      chapter: 1,
      version: 'LBLA',
      verses: [
        { bookId: 'GEN', chapter: 1, verse: 1, text: 'En el principio creó Dios los cielos y la tierra.', version: 'LBLA', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 2, text: 'Y la tierra estaba sin orden y vacía, y las tinieblas cubrían la superficie del abismo, y el Espíritu de Dios se movía sobre la superficie de las aguas.', version: 'LBLA', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 3, text: 'Entonces dijo Dios: Sea la luz. Y hubo luz.', version: 'LBLA', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 4, text: 'Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.', version: 'LBLA', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 5, text: 'Y llamó Dios a la luz día, y a las tinieblas llamó noche. Y fue la tarde y fue la mañana: un día.', version: 'LBLA', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 26, text: 'Y dijo Dios: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza; y ejerza dominio sobre los peces del mar, sobre las aves del cielo...', version: 'LBLA', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 27, text: 'Creó, pues, Dios al hombre a imagen suya, a imagen de Dios lo creó; varón y hembra los creó.', version: 'LBLA', originalLanguage: 'hebrew' },
        { bookId: 'GEN', chapter: 1, verse: 31, text: 'Y vio Dios todo lo que había hecho, y he aquí que era muy bueno. Y fue la tarde y fue la mañana: el sexto día.', version: 'LBLA', originalLanguage: 'hebrew' }
      ]
    }
  },

  // ==================== JUAN 1 ====================
  'JHN_1': {
    RVR1960: {
      bookId: 'JHN',
      bookName: 'Juan',
      chapter: 1,
      version: 'RVR1960',
      verses: [
        { bookId: 'JHN', chapter: 1, verse: 1, text: 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 2, text: 'Este era en el principio con Dios.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 3, text: 'Todas las cosas por él fueron hechas, y sin él nada de lo que ha sido hecho, fue hecho.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 4, text: 'En él estaba la vida, y la vida era la luz de los hombres.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 5, text: 'La luz en las tinieblas resplandece, y las tinieblas no prevalecieron contra ella.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 6, text: 'Hubo un hombre enviado de Dios, el cual se llamaba Juan.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 7, text: 'Este vino por testimonio, para que diese testimonio de la luz, a fin de que todos creyesen por él.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 8, text: 'No era él la luz, sino para que diese testimonio de la luz.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 9, text: 'Aquella luz verdadera, que alumbra a todo hombre, venía a este mundo.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 10, text: 'En el mundo estaba, y el mundo por él fue hecho; pero el mundo no le conoció.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 11, text: 'A lo suyo vino, y los suyos no le recibieron.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 12, text: 'Mas a todos los que le recibieron, a los que creen en su nombre, les dio potestad de ser hechos hijos de Dios;', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 13, text: 'los cuales no son engendrados de sangre, ni de voluntad de carne, ni de voluntad de varón, sino de Dios.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 14, text: 'Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 16, text: 'Porque de su plenitud tomamos todos, y gracia sobre gracia.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 17, text: 'Pues la ley por medio de Moisés fue dada, pero la gracia y la verdad vinieron por medio de Jesucristo.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 18, text: 'A Dios nadie le vio jamás; el unigénito Hijo, que está en el seno del Padre, él le ha dado a conocer.', version: 'RVR1960', originalLanguage: 'greek' }
      ]
    },
    NVI: {
      bookId: 'JHN',
      bookName: 'Juan',
      chapter: 1,
      version: 'NVI',
      verses: [
        { bookId: 'JHN', chapter: 1, verse: 1, text: 'En el principio ya existía el Verbo, y el Verbo estaba con Dios, y el Verbo era Dios.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 2, text: 'Él estaba con Dios en el principio.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 3, text: 'Por medio de él todas las cosas fueron creadas; sin él, nada de lo creado llegó a existir.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 4, text: 'En él estaba la vida, y la vida era la luz de la humanidad.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 5, text: 'Esta luz resplandece en las tinieblas, y las tinieblas no han podido extinguirla.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 12, text: 'Mas a cuantos lo recibieron, a los que creen en su nombre, les dio el derecho de ser hijos de Dios.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 14, text: 'Y el Verbo se hizo hombre y habitó entre nosotros. Y hemos contemplado su gloria, la gloria que corresponde al Hijo unigénito del Padre, lleno de gracia y de verdad.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 16, text: 'De su plenitud todos hemos recibido gracia sobre gracia.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 17, text: 'De hecho, la ley fue dada por medio de Moisés, pero la gracia y la verdad se hicieron realidad por medio de Jesucristo.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 18, text: 'Nadie ha visto jamás a Dios, pero el Hijo único, que es Dios y que está en el seno del Padre, nos lo ha dado a conocer.', version: 'NVI', originalLanguage: 'greek' }
      ]
    },
    DHH: {
      bookId: 'JHN',
      bookName: 'Juan',
      chapter: 1,
      version: 'DHH',
      verses: [
        { bookId: 'JHN', chapter: 1, verse: 1, text: 'En el principio ya existía la Palabra; y aquel que es la Palabra estaba con Dios y era Dios.', version: 'DHH', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 2, text: 'Él estaba en el principio con Dios.', version: 'DHH', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 3, text: 'Por medio de él, Dios hizo todas las cosas; nada de lo que existe fue hecho sin él.', version: 'DHH', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 4, text: 'En él estaba la vida, y la vida era la luz de los hombres.', version: 'DHH', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 5, text: 'Esta luz brilla en las tinieblas, y las tinieblas no han podido apagarla.', version: 'DHH', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 12, text: 'Pero a quienes lo recibieron y creyeron en él, les concedió el privilegio de llegar a ser hijos de Dios.', version: 'DHH', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 14, text: 'Aquel que es la Palabra se hizo hombre y vivió entre nosotros lleno de amor y verdad. Y vimos su gloria, la gloria que correspondía al Hijo único del Padre.', version: 'DHH', originalLanguage: 'greek' }
      ]
    },
    LBLA: {
      bookId: 'JHN',
      bookName: 'Juan',
      chapter: 1,
      version: 'LBLA',
      verses: [
        { bookId: 'JHN', chapter: 1, verse: 1, text: 'En el principio existía el Verbo, y el Verbo estaba con Dios, y el Verbo era Dios.', version: 'LBLA', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 2, text: 'Él estaba en el principio con Dios.', version: 'LBLA', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 3, text: 'Todas las cosas fueron hechas por medio de Él, y sin Él nada de lo que ha sido hecho, fue hecho.', version: 'LBLA', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 4, text: 'En Él estaba la vida, y la vida era la luz de los hombres.', version: 'LBLA', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 14, text: 'Y el Verbo se hizo carne, y habitó entre nosotros, y vimos su gloria, gloria como del unigénito del Padre, lleno de gracia y de verdad.', version: 'LBLA', originalLanguage: 'greek' },
        { bookId: 'JHN', chapter: 1, verse: 18, text: 'Nadie ha visto jamás a Dios; el unigénito Dios, que está en el seno del Padre, Él le ha dado a conocer.', version: 'LBLA', originalLanguage: 'greek' }
      ]
    }
  },

  // ==================== ROMANOS 8 ====================
  'ROM_8': {
    RVR1960: {
      bookId: 'ROM',
      bookName: 'Romanos',
      chapter: 8,
      version: 'RVR1960',
      verses: [
        { bookId: 'ROM', chapter: 8, verse: 1, text: 'Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús, los que no andan conforme a la carne, sino conforme al Espíritu.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 2, text: 'Porque la ley del Espíritu de vida en Cristo Jesús me ha librado de la ley del pecado y de la muerte.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 14, text: 'Porque todos los que son guiados por el Espíritu de Dios, éstos son hijos de Dios.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 15, text: 'Pues no habéis recibido el espíritu de esclavitud para estar otra vez en temor, sino que habéis recibido el espíritu de adopción, por el cual clamamos: ¡Abba, Padre!', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 16, text: 'El Espíritu mismo da testimonio a nuestro espíritu, de que somos hijos de Dios.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 26, text: 'Y de igual manera el Espíritu nos ayuda en nuestra debilidad; pues qué hemos de pedir como conviene, no lo sabemos, pero el Espíritu mismo intercede por nosotros con gemidos indecibles.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 28, text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 29, text: 'Porque a los que antes conoció, también los predestinó para que fuesen hechos conformes a la imagen de su Hijo, para que él sea el primogénito entre muchos hermanos.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 31, text: '¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 37, text: 'Antes, en todas estas cosas somos más que vencedores por medio de aquel que nos amó.', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 38, text: 'Por lo cual estoy seguro de que ni la muerte, ni la vida, ni ángeles, ni principados, ni potestades, ni lo presente, ni lo por venir,', version: 'RVR1960', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 39, text: 'ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús Señor nuestro.', version: 'RVR1960', originalLanguage: 'greek' }
      ]
    },
    NVI: {
      bookId: 'ROM',
      bookName: 'Romanos',
      chapter: 8,
      version: 'NVI',
      verses: [
        { bookId: 'ROM', chapter: 8, verse: 1, text: 'Por lo tanto, ya no hay ninguna condenación para los que están unidos a Cristo Jesús,', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 2, text: 'pues por medio de él la ley del Espíritu de vida me ha liberado de la ley del pecado y de la muerte.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 14, text: 'Porque todos los que son guiados por el Espíritu de Dios son hijos de Dios.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 15, text: 'Y ustedes no recibieron un espíritu que de nuevo los esclavice al miedo, sino el Espíritu que los adopta como hijos y les permite clamar: «¡Abba! ¡Padre!».', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 26, text: 'Así mismo, en nuestra debilidad el Espíritu acude a ayudarnos. No sabemos qué pedir, pero el Espíritu mismo intercede por nosotros con gemidos que no pueden expresarse con palabras.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 28, text: 'Ahora bien, sabemos que Dios dispone todas las cosas para el bien de quienes lo aman, los que han sido llamados de acuerdo con su propósito.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 31, text: '¿Qué diremos frente a esto? Si Dios está de nuestra parte, ¿quién puede estar en contra nuestra?', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 37, text: 'Sin embargo, en todo esto somos más que vencedores por medio de aquel que nos amó.', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 38, text: 'Pues estoy convencido de que ni la muerte ni la vida, ni los ángeles ni los demonios, ni lo presente ni lo por venir, ni los poderes,', version: 'NVI', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 39, text: 'ni lo alto ni lo profundo, ni cosa alguna en toda la creación podrá apartarnos del amor que Dios nos ha manifestado en Cristo Jesús nuestro Señor.', version: 'NVI', originalLanguage: 'greek' }
      ]
    },
    DHH: {
      bookId: 'ROM',
      bookName: 'Romanos',
      chapter: 8,
      version: 'DHH',
      verses: [
        { bookId: 'ROM', chapter: 8, verse: 1, text: 'Así pues, los que están unidos a Cristo Jesús ya no están condenados.', version: 'DHH', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 15, text: 'Porque ustedes no recibieron un espíritu de esclavitud para volver a caer en el temor, sino el Espíritu que nos hace hijos adoptivos de Dios y nos permite clamar: «¡Abba! ¡Padre!».', version: 'DHH', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 28, text: 'Sabemos que Dios dispone todas las cosas para el bien de quienes lo aman, a los cuales él ha llamado de acuerdo con su propósito.', version: 'DHH', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 37, text: 'Pero en todas estas cosas salimos más que vencedores gracias a aquel que nos amó.', version: 'DHH', originalLanguage: 'greek' }
      ]
    },
    LBLA: {
      bookId: 'ROM',
      bookName: 'Romanos',
      chapter: 8,
      version: 'LBLA',
      verses: [
        { bookId: 'ROM', chapter: 8, verse: 1, text: 'Por consiguiente, no hay ahora condenación para los que están en Cristo Jesús.', version: 'LBLA', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 15, text: 'Pues no habéis recibido un espíritu de esclavitud para volver otra vez al temor, sino que habéis recibido un espíritu de adopción como hijos, por el cual clamamos: ¡Abba, Padre!', version: 'LBLA', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 28, text: 'Y sabemos que para los que aman a Dios, todas las cosas cooperan para bien, esto es, para los que son llamados conforme a su propósito.', version: 'LBLA', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 37, text: 'Pero en todas estas cosas somos más que vencedores por medio de aquel que nos amó.', version: 'LBLA', originalLanguage: 'greek' },
        { bookId: 'ROM', chapter: 8, verse: 39, text: 'ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios que es en Cristo Jesús Señor nuestro.', version: 'LBLA', originalLanguage: 'greek' }
      ]
    }
  }
};
