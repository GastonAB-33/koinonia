import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { DatabaseSync } from 'node:sqlite';

const BASE_URL = 'https://raw.githubusercontent.com/develop4God/bible_versions/main/es';
const OUT_DIR = path.resolve('public/data/bibles');
const LEX_DIR = path.resolve('public/data/lexicon');

const VERSIONS = [
  { id: 'RVR1960', file: 'RVR1960_es.SQLite3.gz' },
  { id: 'RVR1909', file: 'RVR1909_es.SQLite3.gz' },
  { id: 'LBLA', file: 'LBLA_es.SQLite3.gz' },
  { id: 'NVI', file: 'NVI_es.SQLite3.gz' }
];

// Mapping standard Protestant canonical order 1..66 to book IDs
const BOOK_ORDER_MAP = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
];

async function downloadAndExtract(url) {
  console.log(`Descargando ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const buf = await res.arrayBuffer();
  return zlib.gunzipSync(Buffer.from(buf));
}

function cleanScriptureText(rawText) {
  if (!rawText) return '';
  // Remover tags HTML y de formato tipo <pb/>, <m>...</m>, <S>...</S>
  return rawText
    .replace(/<pb\s*\/?>/gi, '')
    .replace(/<m>.*?<\/m>/gi, '')
    .replace(/<S>.*?<\/S>/gi, '')
    .replace(/<f>.*?<\/f>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseStrongTokens(rawText) {
  if (!rawText) return [];
  const tokens = [];
  const parts = rawText.split(/(<S>\d+<\/S>)/);
  let currentWords = '';

  for (const part of parts) {
    const strongMatch = part.match(/^<S>(\d+)<\/S>$/);
    if (strongMatch) {
      const strongNum = strongMatch[1];
      const words = currentWords.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean);
      const lastWord = words[words.length - 1]?.replace(/^[«“"'\s.,;:!?¿¡()[\]{}—\-]+|[»”"'\s.,;:!?¿¡()[\]{}—\-]+$/g, '');
      if (lastWord) {
        tokens.push({ word: lastWord, strong: strongNum });
      }
    } else {
      if (part.trim()) {
        currentWords = part;
      }
    }
  }
  return tokens;
}

async function processBibleVersions() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const ver of VERSIONS) {
    const verDir = path.join(OUT_DIR, ver.id);
    fs.mkdirSync(verDir, { recursive: true });
    console.log(`\n--- Procesando versión ${ver.id} ---`);

    const dbBuf = await downloadAndExtract(`${BASE_URL}/${ver.file}`);
    const tempDbPath = path.resolve(`temp_${ver.id}.sqlite3`);
    fs.writeFileSync(tempDbPath, dbBuf);

    const db = new DatabaseSync(tempDbPath);
    const books = db.prepare('SELECT book_number, short_name, long_name FROM books ORDER BY book_number').all();

    for (let i = 0; i < books.length; i++) {
      const b = books[i];
      const bookId = BOOK_ORDER_MAP[i];
      if (!bookId) continue;

      const isOT = i < 39;
      const verses = db.prepare('SELECT chapter, verse, text FROM verses WHERE book_number = ? ORDER BY chapter, verse').all(b.book_number);

      const chaptersMap = {};
      for (const v of verses) {
        if (!chaptersMap[v.chapter]) {
          chaptersMap[v.chapter] = [];
        }
        const cleanText = cleanScriptureText(v.text);
        const strongTokens = parseStrongTokens(v.text);

        chaptersMap[v.chapter].push({
          bookId,
          chapter: v.chapter,
          verse: v.verse,
          version: ver.id,
          originalLanguage: isOT ? 'hebrew' : 'greek',
          text: cleanText,
          ...(strongTokens.length > 0 ? { strongTokens } : {})
        });
      }

      const bookPayload = {
        bookId,
        bookName: b.long_name,
        shortName: b.short_name,
        version: ver.id,
        chaptersCount: Object.keys(chaptersMap).length,
        chapters: chaptersMap
      };

      fs.writeFileSync(
        path.join(verDir, `${bookId}.json`),
        JSON.stringify(bookPayload)
      );
    }

    db.close();
    fs.unlinkSync(tempDbPath);
    console.log(`Versión ${ver.id} procesada exitosamente (66 libros guardados en ${verDir})`);
  }
}

async function processStrongs() {
  fs.mkdirSync(LEX_DIR, { recursive: true });
  console.log('\n--- Descargando Diccionarios Strong (Griego y Hebreo) ---');

  // Griego
  const greekRes = await fetch('https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js');
  const greekText = await greekRes.text();
  const greekFn = new Function('module', 'exports', greekText + '\nreturn (module && module.exports) || strongsGreekDictionary;');
  const greekModule = { exports: {} };
  const greekDict = greekFn(greekModule, greekModule.exports);
  fs.writeFileSync(path.join(LEX_DIR, 'strongs-greek.json'), JSON.stringify(greekDict));
  console.log(`Diccionario Griego guardado: ${Object.keys(greekDict).length} entradas`);

  // Hebreo
  const hebrewRes = await fetch('https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js');
  const hebrewText = await hebrewRes.text();
  const hebrewFn = new Function('module', 'exports', hebrewText + '\nreturn (module && module.exports) || strongsHebrewDictionary;');
  const hebrewModule = { exports: {} };
  const hebrewDict = hebrewFn(hebrewModule, hebrewModule.exports);
  fs.writeFileSync(path.join(LEX_DIR, 'strongs-hebrew.json'), JSON.stringify(hebrewDict));
  console.log(`Diccionario Hebreo guardado: ${Object.keys(hebrewDict).length} entradas`);
}

async function main() {
  const start = Date.now();
  await processBibleVersions();
  await processStrongs();
  console.log(`\n¡Todo completado en ${((Date.now() - start) / 1000).toFixed(1)}s!`);
}

main().catch(console.error);
