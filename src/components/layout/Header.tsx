import React, { useState, useEffect } from 'react';
import { useStudyStore } from '../../store/useStudyStore';
import { useLexiconStore } from '../../store/useLexiconStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useBibleStore } from '../../store/useBibleStore';
import { StudySidebarDrawer } from '../study/StudySidebarDrawer';
import { StudyCameraModal } from '../study/StudyCameraModal';
import { DownloadAppModal } from '../pwa/DownloadAppModal';
import { UploadBookModal } from '../book/UploadBookModal';
import { SmartSearchModal } from '../search/SmartSearchModal';
import { UserProfileMenu } from '../auth/UserProfileMenu';
import { GoogleAuthModal } from '../auth/GoogleAuthModal';
import { ThemeDropdown } from './ThemeDropdown';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useCloudStore } from '../../store/useCloudStore';
import { CloudSyncStatusBadge } from '../cloud/CloudSyncStatusBadge';
import { CloudSettingsModal } from '../cloud/CloudSettingsModal';
import { ShareStudyModal } from '../cloud/ShareStudyModal';
import { ImportStudyModal } from '../cloud/ImportStudyModal';
import {
  BookOpen,
  Menu,
  Sparkles,
  ChevronDown,
  Users,
  Layout,
  Maximize2,
  Minimize2,
  Palette,
  FileText,
  // PenTool, // Oculto temporalmente junto con Cuaderno Libre
  BookMarked,
  Camera,
  Download,
  BookPlus,
  Search
} from 'lucide-react';

interface HeaderProps {
  rightPanelTab: 'editor' | 'freebook' | 'sketchbook' | 'canvas';
  setRightPanelTab: (tab: 'editor' | 'freebook' | 'sketchbook' | 'canvas') => void;
  onLayoutPreset: (preset: 'left-only' | 'split-50' | 'right-only') => void;
}

export const Header: React.FC<HeaderProps> = ({
  rightPanelTab,
  setRightPanelTab,
  onLayoutPreset
}) => {
  const isMobile = useIsMobile();
  const { getActiveStudy, studies, setMobileView } = useStudyStore();
  const { openLexicon } = useLexiconStore();
  const { currentTheme } = useThemeStore();
  const { activeCustomBookId, customBooks } = useBibleStore();
  const [isStudiesDrawerOpen, setIsStudiesDrawerOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isDownloadAppOpen, setIsDownloadAppOpen] = useState(false);
  const [isUploadBookOpen, setIsUploadBookOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const activeCustomBook = customBooks.find((b) => b.id === activeCustomBookId);
  const activeStudy = getActiveStudy();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const {
    isConfigModalOpen,
    setIsConfigModalOpen,
    isShareModalOpen,
    setIsShareModalOpen,
    studyToShare,
    isImportModalOpen,
    setIsImportModalOpen,
    sharedStudyToImport
  } = useCloudStore();

  // Atajos de teclado Ctrl+E (Estudios) y Ctrl+K (Búsqueda inteligente)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsStudiesDrawerOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className={`h-14 backdrop-blur-md px-4 flex items-center justify-between gap-4 shrink-0 z-40 select-none shadow-xs border-b transition-colors ${
        isDark ? 'bg-slate-950/95 border-slate-800 text-white' : 'bg-white/90 border-slate-200/90 text-slate-800'
      }`}
    >
      {/* Sección Izquierda: Botón de Menú de Estudios + Logotipo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* BOTÓN PRINCIPAL PARA ABRIR EL MENÚ LATERAL IZQUIERDO DE ESTUDIOS */}
        <button
          onClick={() => {
            if (isMobile) {
              setMobileView('menu');
            } else {
              setIsStudiesDrawerOpen(true);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isDark
              ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-800/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-amber-50 hover:bg-amber-100/90 border-amber-300 text-amber-950 shadow-2xs'
          }`}
          title="Abrir menú lateral izquierdo: Mis Estudios Bíblicos (Ctrl+E)"
        >
          <Menu className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-bold">Mis Estudios</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
              isDark ? 'bg-amber-800 text-amber-200' : 'bg-amber-200 text-amber-900'
            }`}
          >
            {studies.length}
          </span>
        </button>

        {/* BOTÓN DE BÚSQUEDA INTELIGENTE CON FILTROS (Ctrl+K) */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-700/80 hover:bg-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
          }`}
          title="Búsqueda Inteligente con Filtros (Estudios, Libros, Fechas o Etiquetas) [Ctrl+K]"
        >
          <Search className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline">Buscar...</span>
          <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded border border-slate-600/50 font-mono text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Logotipo y Título de la Aplicación */}
        <div className="hidden lg:flex items-center gap-2.5 pl-1 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`font-serif font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Koinonía
              </h1>
              <span
                className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded ${
                  isDark ? 'bg-amber-950 text-amber-300 border border-amber-800/60' : 'bg-amber-100 text-amber-900'
                }`}
              >
                Estudio
              </span>
            </div>
            <span className={`text-[10px] block -mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
              Lectura bíblica & análisis colaborativo
            </span>
          </div>
        </div>
      </div>

      {/* Selector Central de Estudio Activo (Clic abre el menú lateral izquierdo o Menú Principal) */}
      <div className="hidden md:flex items-center">
        <button
          onClick={() => {
            if (isMobile) {
              setMobileView('menu');
            } else {
              setIsStudiesDrawerOpen(true);
            }
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors shadow-2xs max-w-sm ${
            isDark
              ? 'border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200'
              : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800'
          }`}
          title="Ver o cambiar estudio bíblico actual"
        >
          <span className={`font-normal ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Estudio en curso:</span>
          <span className={`truncate max-w-[200px] font-bold ${isDark ? 'text-amber-400' : 'text-indigo-900'}`}>
            {activeStudy?.title || 'Seleccionar Estudio'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
        </button>
      </div>

      {/* Acciones y Pestañas de la Derecha */}
      <div className="flex items-center gap-2 text-xs">
        {/* Selector de pestañas para el panel derecho (en móvil se gestiona desde el Bottom Sheet) */}
        <div
          className={`hidden md:flex items-center p-0.5 rounded-xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/80'
          }`}
        >
          <button
            onClick={() => setRightPanelTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              rightPanelTab === 'editor'
                ? isDark
                  ? 'bg-slate-800 text-emerald-400 shadow-xs font-bold'
                  : 'bg-white text-indigo-900 shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cuaderno</span>
          </button>
          {/* Cuaderno Libre ocultado temporalmente ya que el Sketchbook funciona mejor */}
          {/* <button
            onClick={() => setRightPanelTab('freebook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              rightPanelTab === 'freebook'
                ? isDark
                  ? 'bg-slate-800 text-red-400 shadow-xs font-bold'
                  : 'bg-white text-red-700 shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Cuaderno libre con anotaciones manuscritas, dibujos y subrayados"
          >
            <PenTool className="w-3.5 h-3.5 text-[#ff3344]" />
            <span>Cuaderno Libre ✍️</span>
          </button> */}
          <button
            onClick={() => setRightPanelTab('sketchbook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              rightPanelTab === 'sketchbook'
                ? isDark
                  ? 'bg-slate-800 text-amber-400 shadow-xs font-bold'
                  : 'bg-white text-[#88804B] shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Sketchbook estilo Cornell: texto editable, gráficos y hojas de estudio"
          >
            <BookMarked className="w-3.5 h-3.5 text-[#C4BC7B]" />
            <span>Sketchbook 📓</span>
          </button>
          <button
            onClick={() => setRightPanelTab('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              rightPanelTab === 'canvas'
                ? isDark
                  ? 'bg-slate-800 text-blue-400 shadow-xs font-bold'
                  : 'bg-white text-indigo-900 shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-blue-500" />
            <span>Pizarra</span>
          </button>
        </div>

        {/* Selector Desplegable de Temas y Paletas de Cuaderno Digital */}
        <ThemeDropdown />

        {/* Indicador de Sincronización en la Nube */}
        <CloudSyncStatusBadge />

        {/* BOTÓN 1 SOLICITADO: SUBIR LIBRO (FOTOS + IA) */}
        <button
          onClick={() => setIsUploadBookOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isDark
              ? 'border-amber-700/80 bg-gradient-to-r from-amber-950/70 to-orange-950/70 hover:from-amber-900/80 hover:to-orange-900/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 shadow-2xs'
          }`}
          title="Subir fotos de libros o cuadernos para transcribirlos con IA y guardarlos en tu biblioteca"
        >
          <BookPlus className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="hidden sm:inline">Subir Libro</span>
          <span className="sm:hidden">Libro</span>
        </button>

        {/* BOTÓN 2 SOLICITADO: DESCARGAR APP (WEBAPP / PWA) */}
        <button
          onClick={() => setIsDownloadAppOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isDark
              ? 'border-blue-700/80 bg-gradient-to-r from-blue-950/70 to-indigo-950/70 hover:from-blue-900/80 hover:to-indigo-900/80 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
              : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-950 shadow-2xs'
          }`}
          title="Descargar e instalar Koinonía App Web (PWA) en tu celular o PC"
        >
          <Download className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="hidden sm:inline">Descargar App</span>
          <span className="sm:hidden">App</span>
        </button>

        {/* Acceso Rápido a la Cámara / Escaneo: Visible únicamente si se está estudiando un libro propio */}
        {activeCustomBook && (
          <button
            onClick={() => setIsCameraModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-medium transition-colors cursor-pointer animate-in fade-in duration-200 ${
              isDark
                ? 'border-amber-800/80 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900'
            }`}
            title={`Tomar foto con la cámara y sumar capítulo a "${activeCustomBook.title}"`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden sm:inline font-semibold">
              + Sumar Cap. {(activeCustomBook.chapters.length || 0) + 1}
            </span>
          </button>
        )}

        {/* Acceso Rápido al Panel Léxico */}
        <button
          onClick={() => openLexicon('Juan 1:1', 'Verbo')}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-medium transition-colors ${
            isDark
              ? 'border-purple-800 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300'
              : 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700'
          }`}
          title="Abrir análisis léxico (Griego/Hebreo)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Léxico Original</span>
        </button>

        {/* Indicador de Colaboración */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 border rounded-full font-medium text-[11px] ${
            isDark
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
          }`}
          title="Modo Colaborativo: Pareja conectada y sincronizada"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Modo Pareja</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Perfil de Usuario / Inicio de Sesión con Google */}
        <UserProfileMenu />

        {/* Presets de tamaño de pantalla dividida */}
        <div className={`hidden lg:flex items-center gap-0.5 border-l pl-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={() => onLayoutPreset('left-only')}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Lector bíblico a pantalla completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onLayoutPreset('split-50')}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Pantalla dividida 50% / 50%"
          >
            <Layout className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onLayoutPreset('right-only')}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Estudio / Pizarra a pantalla completa"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Menú Lateral Izquierdo de Estudios Bíblicos */}
      <StudySidebarDrawer isOpen={isStudiesDrawerOpen} onClose={() => setIsStudiesDrawerOpen(false)} />

      {/* Modal de Transcripción con Cámara */}
      <StudyCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        targetCustomBookId={activeCustomBook?.id}
        mode={activeCustomBook ? 'add-chapter' : 'default'}
      />

      {/* Modal de Inicio de Sesión con Google */}
      <GoogleAuthModal />

      {/* Modal de Descarga de App Web (PWA) */}
      <DownloadAppModal isOpen={isDownloadAppOpen} onClose={() => setIsDownloadAppOpen(false)} />

      {/* Modal para Subir Libro con Fotos & IA */}
      <UploadBookModal isOpen={isUploadBookOpen} onClose={() => setIsUploadBookOpen(false)} />

      {/* Modal de Búsqueda Inteligente con Filtros */}
      <SmartSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      {/* Modales de Sincronización en la Nube y Amigos */}
      <CloudSettingsModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
      <ShareStudyModal study={studyToShare} isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <ImportStudyModal studyPayload={sharedStudyToImport} isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </header>
  );
};
