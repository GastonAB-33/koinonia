import React, { useState } from 'react';
import { useLexiconStore } from '../../store/useLexiconStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getGeminiApiKey } from '../../services/ai/geminiAIService';
import {
  Sparkles,
  X,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  Layers,
  FileText,
  Share2,
  Loader2,
  Key,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Search
} from 'lucide-react';

export const LexiconDrawer: React.FC = () => {
  const {
    isOpen,
    closeLexicon,
    analysis,
    isLoading,
    selectedVerseRef,
    selectedWord,
    hasApiKey,
    saveApiKey,
    testApiKey,
    reanalyze,
    openLexicon
  } = useLexiconStore();

  const { addTextBlockToActiveStudy, activeStudyId } = useStudyStore();
  const { addConceptNodeToCanvas } = useCanvasStore();
  const { currentTheme } = useThemeStore();

  const [copiedStrong, setCopiedStrong] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [activeMode, setActiveMode] = useState<'strong' | 'gemini'>('strong');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputApiKey, setInputApiKey] = useState(() => getGeminiApiKey());
  const [testStatus, setTestStatus] = useState<{ testing: boolean; message: string | null; success?: boolean }>({
    testing: false,
    message: null
  });

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  if (!isOpen) return null;

  const handleCopyStrong = (strong: string) => {
    navigator.clipboard.writeText(strong);
    setCopiedStrong(true);
    setTimeout(() => setCopiedStrong(false), 2000);
  };

  const handleInsertInStudy = () => {
    if (!analysis) return;
    const content = `Análisis Léxico [${analysis.strongNumber}]: "${analysis.originalText}" (${analysis.transliteration}) en ${selectedVerseRef}.\nDefinición: ${analysis.definition}\nContexto: ${analysis.theologicalContext}`;
    addTextBlockToActiveStudy(content, 'theological_insight');
    closeLexicon();
  };

  const handleSendToCanvas = () => {
    if (!analysis) return;
    addConceptNodeToCanvas(activeStudyId, {
      title: `${analysis.originalText} (${analysis.transliteration})`,
      category: 'Doctrina',
      description: `${analysis.strongNumber} - ${analysis.definition}. ${analysis.theologicalContext.slice(0, 140)}...`,
      tags: [analysis.strongNumber, analysis.language === 'hebrew' ? 'Hebreo' : 'Griego']
    });
    closeLexicon();
  };

  const handleSaveAndApply = async () => {
    saveApiKey(inputApiKey);
    setShowConfig(false);
    await reanalyze();
  };

  const handleTestKey = async () => {
    if (!inputApiKey.trim()) {
      setTestStatus({ testing: false, message: 'Ingresa una API Key primero.', success: false });
      return;
    }
    setTestStatus({ testing: true, message: null });
    const res = await testApiKey(inputApiKey.trim());
    setTestStatus({ testing: false, message: res.message, success: res.success });
  };

  const handleClearKey = async () => {
    setInputApiKey('');
    saveApiKey('');
    setTestStatus({ testing: false, message: 'Clave eliminada. Modo simulado reactivado.', success: true });
    await reanalyze();
  };

  return (
    <>
      {/* Fondo oscuro traslúcido para móviles y tablets */}
      <div
        onClick={closeLexicon}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-2xs z-[110] transition-opacity animate-in fade-in duration-200"
      />
      <div
        className={`fixed inset-y-0 right-0 z-[120] w-full max-w-md backdrop-blur-xl border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 transition-colors ${
          isDark ? 'bg-slate-900/98 border-purple-900/60 text-white' : 'bg-white/95 border-purple-200/80 text-slate-800'
        }`}
      >
      {/* Cabecera del Drawer */}
      <div
        className={`p-4 border-b flex items-center justify-between ${
          isDark
            ? 'border-purple-900/50 bg-slate-950/80'
            : 'border-purple-100 bg-gradient-to-r from-purple-50/80 to-indigo-50/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Estudio Léxico & Exegético
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {hasApiKey ? (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Concordancia Strong + Gemini IA
                </span>
              ) : (
                <span className={`text-[11px] font-semibold ${isDark ? 'text-purple-300' : 'text-purple-700'} flex items-center gap-1`}>
                  📖 Concordancia Strong (100% Offline)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Botón para Configurar API Key */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              showConfig
                ? isDark
                  ? 'bg-purple-900 text-white border-purple-700'
                  : 'bg-purple-100 text-purple-900 border-purple-300'
                : hasApiKey
                ? isDark
                  ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-emerald-700 hover:bg-slate-50'
                : isDark
                ? 'bg-amber-950/60 border-amber-800 text-amber-300 hover:bg-amber-900/60'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
            title="Configurar Google Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="text-[11px]">{hasApiKey ? 'Conectado' : 'Conectar'}</span>
          </button>

          <button
            onClick={closeLexicon}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Cerrar panel léxico"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel de Configuración de API Key (Desplegable superior) */}
      {showConfig && (
        <div
          className={`p-4 border-b text-xs space-y-3 transition-colors ${
            isDark ? 'bg-slate-950 border-purple-900/50' : 'bg-purple-50/90 border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-500" />
              <span>Conectar Google Gemini API</span>
            </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Obtener clave gratis</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
            Ingresa tu clave de API de Gemini para analizar en tiempo real cualquier vocablo bíblico en griego o hebreo con inteligencia artificial.
          </p>

          <div className="space-y-1.5">
            <input
              type="password"
              placeholder="Pega tu Gemini API Key aquí (AIzaSy...)"
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-xl border text-xs focus:outline-none transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-purple-500'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-purple-500'
              }`}
            />
          </div>

          {testStatus.message && (
            <div
              className={`p-2 rounded-xl text-[11px] font-medium flex items-center gap-1.5 ${
                testStatus.success
                  ? isDark
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : isDark
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testStatus.success ? (
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{testStatus.message}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleTestKey}
              disabled={testStatus.testing || !inputApiKey.trim()}
              className={`px-3 py-1.5 rounded-xl border font-semibold disabled:opacity-40 transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              {testStatus.testing ? 'Probando...' : 'Probar Clave'}
            </button>

            <button
              onClick={handleSaveAndApply}
              disabled={!inputApiKey.trim()}
              className="flex-1 py-1.5 px-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl font-bold shadow-sm transition-colors text-center"
            >
              Guardar y Analizar
            </button>

            {hasApiKey && (
              <button
                onClick={handleClearKey}
                className={`px-2.5 py-1.5 rounded-xl border font-medium text-[11px] transition-colors ${
                  isDark
                    ? 'border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-900'
                    : 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50'
                }`}
                title="Desconectar clave y volver a modo de prueba"
              >
                Volver a Mock
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contenido con Scroll */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Banner informativo cuando se está en modo simulado */}
        {!hasApiKey && !showConfig && (
          <div
            onClick={() => setShowConfig(true)}
            className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
              isDark
                ? 'bg-amber-950/30 border-amber-800/60 text-amber-200 hover:bg-amber-950/50'
                : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Modo simulado activo.</strong> Toca aquí para conectar tu API Key de Gemini y consultar en vivo.
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </div>
        )}

        {/* Barra de consulta personalizada de palabra */}
        <div
          className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-colors shadow-2xs ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100/90 border-slate-200'
          }`}
        >
          <Search className="w-4 h-4 text-purple-400 ml-1.5 shrink-0" />
          <input
            type="text"
            placeholder={`Consultar palabra (ej. viento, espíritu, nacer)...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                openLexicon(selectedVerseRef || 'Juan 3:8', searchQuery.trim());
              }
            }}
            className={`w-full bg-transparent text-xs focus:outline-none placeholder-slate-400 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}
          />
          <button
            onClick={() => {
              if (searchQuery.trim()) {
                openLexicon(selectedVerseRef || 'Juan 3:8', searchQuery.trim());
              }
            }}
            disabled={!searchQuery.trim() || isLoading}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
          >
            Analizar
          </button>
        </div>

        {/* Pestañas de Selección: e-Sword Directo vs Gemini IA */}
        <div
          className={`grid grid-cols-2 p-1 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveMode('strong')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'strong'
                ? isDark
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-purple-900 shadow-sm border border-purple-200'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Traducción e-Sword</span>
          </button>

          <button
            onClick={() => setActiveMode('gemini')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'gemini'
                ? isDark
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-purple-900 shadow-sm border border-purple-200'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="truncate">Explicación Gemini</span>
          </button>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className={`text-xs font-medium text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {activeMode === 'gemini' && hasApiKey
                ? 'Google Gemini está analizando el término en lengua original y contexto histórico...'
                : 'Consultando léxico en idioma original...'}
            </p>
          </div>
        ) : !analysis ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Selecciona una palabra o versículo en el lector bíblico para analizar su término original.
          </div>
        ) : (
          <>
            {/* Tarjeta de la Palabra Original */}
            <div
              className={`border rounded-2xl p-5 text-center relative overflow-hidden shadow-sm ${
                isDark
                  ? 'bg-slate-800/80 border-purple-900/60 text-white'
                  : 'bg-gradient-to-br from-purple-50/50 via-slate-50 to-indigo-50/40 border-purple-200/70'
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isDark
                    ? 'text-purple-300 bg-purple-950 border border-purple-800/60'
                    : 'text-purple-700 bg-purple-100'
                }`}
              >
                {analysis.language === 'hebrew' ? 'Hebreo Bíblico' : analysis.language === 'greek' ? 'Griego Koiné' : 'Arameo Bíblico'} • Consulta: "{selectedWord}"
              </span>

              {/* Texto original en tamaño prominente */}
              <div className="my-3">
                <span
                  className={`text-4xl font-serif font-bold tracking-wide ${
                    analysis.language === 'hebrew' ? 'font-hebrew text-5xl' : 'font-greek'
                  } ${isDark ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'text-slate-900'}`}
                >
                  {analysis.originalText}
                </span>
              </div>

              {/* Transliteración */}
              <div className={`text-sm font-semibold italic ${isDark ? 'text-purple-200' : 'text-slate-700'}`}>
                {analysis.transliteration}
              </div>

              {/* Badge de Concordancia Strong */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCopyStrong(analysis.strongNumber)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-xl text-xs font-mono font-bold shadow-sm transition-all ${
                    isDark
                      ? 'bg-slate-700/80 hover:bg-slate-700 border-purple-800 text-purple-200'
                      : 'bg-white hover:bg-slate-50 border-purple-200 text-purple-900'
                  }`}
                  title="Copiar número Strong"
                >
                  <span>Strong: {analysis.strongNumber}</span>
                  {copiedStrong ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                  {analysis.occurrencesCount} veces en el texto
                </span>
              </div>
            </div>

            {/* VISTA 1: TRADUCCIÓN DIRECTA DE E-SWORD / STRONG */}
            {activeMode === 'strong' && (
              <div className="space-y-4">
                {/* Definición Literal en Español */}
                <div className="space-y-1.5">
                  <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    Significado y Traducción Literal (Español)
                  </h4>
                  <div
                    className={`text-sm leading-relaxed border p-3.5 rounded-2xl shadow-xs font-semibold ${
                      isDark
                        ? 'bg-slate-800/90 border-purple-900/60 text-emerald-300'
                        : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    « {analysis.definition} »
                  </div>
                </div>

                {/* Ficha Morfológica y Raíz */}
                <div
                  className={`space-y-3 border rounded-2xl p-4 text-xs ${
                    isDark ? 'bg-slate-800/70 border-slate-700/80 text-white' : 'bg-slate-50 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Layers className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className={`font-semibold block ${isDark ? 'text-purple-300' : 'text-slate-700'}`}>
                        Morfología Gramatical:
                      </span>
                      <span className={isDark ? 'text-slate-200' : 'text-slate-600'}>
                        {analysis.morphology}
                      </span>
                    </div>
                  </div>

                  <div className={`flex items-start gap-2 pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-200/60'}`}>
                    <BookOpen className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className={`font-semibold block ${isDark ? 'text-purple-300' : 'text-slate-700'}`}>
                        Palabra Raíz o Lema:
                      </span>
                      <span className={`font-serif font-medium ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
                        {analysis.rootWord}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contexto y Uso en las Escrituras */}
                {analysis.theologicalContext && (
                  <div className="space-y-1.5">
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Uso Bíblico y Trasfondo
                    </h4>
                    <div
                      className={`p-3.5 border rounded-2xl text-xs leading-relaxed space-y-2 whitespace-pre-line ${
                        isDark ? 'bg-slate-800/60 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {analysis.theologicalContext}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VISTA 2: EXPLICACIÓN TEOLÓGICA CON GEMINI IA */}
            {activeMode === 'gemini' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isDark ? 'text-purple-300' : 'text-purple-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Exégesis Doctrinal con Inteligencia Artificial
                  </h4>
                  {hasApiKey && (
                    <button
                      onClick={reanalyze}
                      disabled={isLoading}
                      className="text-[11px] text-purple-500 hover:text-purple-600 font-bold underline"
                    >
                      Reanalizar
                    </button>
                  )}
                </div>

                {hasApiKey ? (
                  <div
                    className={`p-4 border rounded-2xl text-xs leading-relaxed space-y-3 ${
                      isDark
                        ? 'bg-purple-950/40 border-purple-900/60 text-purple-100'
                        : 'bg-purple-50/70 border-purple-200/90 text-slate-700'
                    }`}
                  >
                    <p className="whitespace-pre-line">{analysis.theologicalContext}</p>
                    <div className="pt-2 border-t border-purple-200/50 dark:border-purple-800/50 text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                      <span>✓ Análisis exegético de Google Gemini en español</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-5 border rounded-2xl text-center space-y-3 ${
                      isDark ? 'bg-slate-800/80 border-purple-900/60' : 'bg-purple-50/50 border-purple-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-500 flex items-center justify-center mx-auto">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm">Explicación Teológica con Gemini</h5>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Conecta tu clave gratuita de Google Gemini para recibir explicaciones doctrinales, contexto pastoral y conexiones con Cristo.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowConfig(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      Conectar Gemini Gratis
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pasajes Cruzados */}
            {analysis.crossReferences.length > 0 && (
              <div className="space-y-1.5">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Referencias Cruzadas Clave
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.crossReferences.map((ref) => (
                    <span
                      key={ref}
                      className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1 font-medium ${
                        isDark
                          ? 'bg-slate-800 text-purple-300 border-slate-700'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <ArrowRight className="w-2.5 h-2.5 text-purple-400" />
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Botones de acción al fondo */}
      {analysis && (
        <div
          className={`p-4 border-t flex flex-col gap-2 ${
            isDark ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-slate-50/90'
          }`}
        >
          <button
            onClick={handleInsertInStudy}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Insertar análisis en el cuaderno de estudio</span>
          </button>

          <button
            onClick={handleSendToCanvas}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Añadir concepto a la pizarra infinita</span>
          </button>
        </div>
      )}
    </div>
    </>
  );
};