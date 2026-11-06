import React, { useState, useEffect } from 'react';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { BibleSelectorModal } from '../bible/BibleSelectorModal';
import { StudyCameraModal } from '../study/StudyCameraModal';
import {
  BookOpen,
  Search,
  Bookmark,
  ArrowRight,
  Columns,
  Palette,
  CheckCircle2,
  Clock,
  Download,
  Smartphone,
  Share2,
  Camera,
  Sparkles
} from 'lucide-react';

interface MobileMenuViewProps {
  onGoToBible: () => void;
  onGoToStudy: () => void;
}

export const MobileMenuView: React.FC<MobileMenuViewProps> = ({ onGoToBible, onGoToStudy }) => {
  const {
    books,
    currentBookId,
    currentChapterNum,
    highlights,
    isParallelMode,
    toggleParallelMode
  } = useBibleStore();
  const { currentTheme, setTheme } = useThemeStore();
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide((prev) => !prev);
    }
  };

  const currentBook = books.find((b) => b.id === currentBookId);
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  return (
    <div
      className={`h-full flex flex-col overflow-y-auto select-none transition-colors ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Cabecera del Menú */}
      <div
        className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 sticky top-0 z-10 backdrop-blur-md ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base tracking-tight">Koinonía</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                Menú
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-0.5">Exploración & Biblioteca</span>
          </div>
        </div>

        {/* Botón para volver a la Biblia */}
        <button
          onClick={onGoToBible}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors border ${
            isDark
              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
              : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700'
          }`}
          title="Ir al lector bíblico"
        >
          <span>Lectura</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Contenido del Menú */}
      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-20">
        {/* Tarjeta de Instalación PWA para Móvil */}
        <div
          className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-colors ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 to-indigo-950/40 border-indigo-900/60'
              : 'bg-gradient-to-br from-white to-amber-50/50 border-amber-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs">Instalar Koinonía en tu Celular</h3>
                <p className="text-[11px] text-slate-400">Úsala a pantalla completa como una app nativa</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{deferredPrompt ? 'Instalar App Ahora' : '¿Cómo descargarla en tu cel?'}</span>
          </button>

          {showInstallGuide && !deferredPrompt && (
            <div
              className={`p-3 rounded-xl border text-xs space-y-2.5 animate-in fade-in duration-150 ${
                isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-500">
                  <span>📱 En Android (Google Chrome):</span>
                </p>
                <p className="text-[11px] leading-relaxed pl-4">
                  1. Toca los <strong>3 puntos (⋮)</strong> arriba a la derecha de Chrome.<br />
                  2. Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.
                </p>
              </div>

              <div className="space-y-1 pt-1.5 border-t border-slate-700/40">
                <p className="font-bold flex items-center gap-1.5 text-blue-400">
                  <span>🍎 En iPhone / iPad (Safari):</span>
                </p>
                <p className="text-[11px] leading-relaxed pl-4">
                  1. Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba <Share2 className="w-3 h-3 inline" />).<br />
                  2. Desliza hacia abajo y pulsa <strong>"Agregar al inicio"</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tarjeta de Escaneo con Cámara e IA */}
        <div
          className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-colors ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 to-amber-950/40 border-amber-900/60'
              : 'bg-gradient-to-br from-white to-amber-50 border-amber-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs">Escanear Notas o Libros</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> IA Gemini
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Toma una foto a tus notas y digitalízalas al instante</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCameraModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Abrir Cámara / Escáner</span>
          </button>
        </div>
        {/* Banner de En Desarrollo */}
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-3 shadow-xs ${
            isDark
              ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
              : 'bg-amber-50 border-amber-200/80 text-amber-900'
          }`}
        >
          <Clock className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Módulo de Menú en desarrollo</p>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Pronto podrás acceder a planes de lectura, comentarios exegéticos y concordancia completa desde aquí.
            </p>
          </div>
        </div>

        {/* Acceso Rápido al Selector de Libros y Capítulos */}
        <div
          className={`p-4 rounded-2xl border shadow-xs space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Lectura Actual</span>
            </div>
            <span className="text-xs font-bold text-amber-500">
              {currentBook?.name || 'Génesis'} {currentChapterNum}
            </span>
          </div>

          <button
            onClick={() => setIsBookPickerOpen(true)}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-950'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cambiar Libro o Capítulo</span>
          </button>
        </div>

        {/* Búsqueda Bíblica (Mock Próximamente) */}
        <div
          className={`p-4 rounded-2xl border shadow-xs space-y-2.5 opacity-80 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">Búsqueda Bíblica</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
              Próximamente
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs text-slate-400 cursor-not-allowed ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-100/70 border-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar palabra o tema (ej. gracia, pacto, fe)...</span>
          </div>
        </div>

        {/* Marcadores y Versículos Destacados */}
        <div
          className={`p-4 rounded-2xl border shadow-xs space-y-2 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Tus Versículos</span>
            </div>
            <span className="text-xs font-bold text-emerald-500">{highlights.length} destacados</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Todos tus versículos subrayados y notas en el texto bíblico quedan guardados automáticamente.
          </p>
        </div>

        {/* Modo de Comparación Rápido */}
        <div
          className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Columns className="w-4 h-4 text-blue-500" />
            <div>
              <span className="font-bold text-xs block">Comparación Bíblica</span>
              <span className="text-[11px] text-slate-400 block">Mitad superior e inferior</span>
            </div>
          </div>

          <button
            onClick={toggleParallelMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              isParallelMode
                ? isDark
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-blue-600 text-white border-blue-700'
                : isDark
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isParallelMode ? 'Activada' : 'Desactivada'}
          </button>
        </div>

        {/* Selector de Temas Visuales */}
        <div
          className={`p-4 rounded-2xl border shadow-xs space-y-2.5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Apariencia</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setTheme('aesthetic-pastel')}
              className={`p-2 rounded-xl border flex items-center justify-between ${
                currentTheme === 'aesthetic-pastel'
                  ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-transparent'
              }`}
            >
              <span>Aesthetic Pastel</span>
              {currentTheme === 'aesthetic-pastel' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
            </button>
            <button
              onClick={() => setTheme('bullet-journal')}
              className={`p-2 rounded-xl border flex items-center justify-between ${
                currentTheme === 'bullet-journal'
                  ? 'border-amber-500 bg-[#fbf0d9] text-amber-950 font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-transparent'
              }`}
            >
              <span>Bullet Journal</span>
              {currentTheme === 'bullet-journal' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-2 rounded-xl border flex items-center justify-between ${
                currentTheme === 'dark'
                  ? 'border-amber-500 bg-slate-800 text-white font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-transparent'
              }`}
            >
              <span>Oscuro Carbón</span>
              {currentTheme === 'dark' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
            </button>
            <button
              onClick={() => setTheme('dark-blackout')}
              className={`p-2 rounded-xl border flex items-center justify-between ${
                currentTheme === 'dark-blackout'
                  ? 'border-amber-500 bg-black text-white font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-transparent'
              }`}
            >
              <span>Negro Puro (OLED)</span>
              {currentTheme === 'dark-blackout' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Guía de Gestos / Accesos Rápidos */}
        <div
          className={`p-3.5 rounded-2xl border text-xs text-center space-y-1.5 ${
            isDark ? 'bg-slate-900/50 border-slate-800/80 text-slate-400' : 'bg-slate-100/70 border-slate-200/80 text-slate-600'
          }`}
        >
          <p className="font-semibold text-slate-500 dark:text-slate-300">Navegación por deslizamiento:</p>
          <p className="text-[11px]">👈 <strong>Deslizar de derecha a izquierda:</strong> Avanzar a Lectura Bíblica y Herramientas</p>
          <p className="text-[11px]">👉 <strong>Deslizar de izquierda a derecha:</strong> Retroceder a este Menú</p>
        </div>

        {/* Botones de acción directa */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onGoToBible}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm border ${
              isDark
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
            }`}
          >
            <span>Ir a la Biblia</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onGoToStudy}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <span>Herramientas 📓</span>
          </button>
        </div>
      </div>

      {/* Modal Portaleado del selector de Libros y Capítulos */}
      <BibleSelectorModal
        isOpen={isBookPickerOpen}
        onClose={() => setIsBookPickerOpen(false)}
      />

      {/* Modal de Transcripción con Cámara */}
      <StudyCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
      />
    </div>
  );
};
