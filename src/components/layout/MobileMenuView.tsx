import React, { useState, useEffect } from 'react';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCloudStore } from '../../store/useCloudStore';
import { Study } from '../../types/study';
import { cloudSyncService } from '../../services/cloud/cloudSyncService';

import { BibleSelectorModal } from '../bible/BibleSelectorModal';
import { StudyCameraModal } from '../study/StudyCameraModal';
import { DownloadAppModal } from '../pwa/DownloadAppModal';
import { UploadBookModal } from '../book/UploadBookModal';
import { SmartSearchModal } from '../search/SmartSearchModal';
import { CreateStudyModal } from '../study/CreateStudyModal';
import { StudyDetailModal } from '../study/StudyDetailModal';
import { ShareStudyModal } from '../cloud/ShareStudyModal';
import { ImportStudyModal } from '../cloud/ImportStudyModal';
import { CloudSettingsModal } from '../cloud/CloudSettingsModal';
import { CloudSyncStatusBadge } from '../cloud/CloudSyncStatusBadge';
import { GoogleLogo } from '../auth/GoogleLogo';

import {
  BookOpen,
  BookMarked,
  Plus,
  Search,
  Download,
  BookPlus,
  FileText,
  Layers,
  Tag,
  ArrowRight,
  LogOut,
  Heart,
  Palette,
  CheckCircle2,
  ChevronRight,
  Globe,
  Users,
  Share2,
  Cloud,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface MobileMenuViewProps {
  onGoToBible: () => void;
  onGoToStudy: () => void;
}

export const MobileMenuView: React.FC<MobileMenuViewProps> = ({ onGoToBible, onGoToStudy }) => {
  const {
    customBooks,
    selectCustomBook
  } = useBibleStore();

  const {
    studies,
    activeStudyId,
    setActiveStudyId
  } = useStudyStore();

  const { getStudyData } = useSketchbookStore();
  const { canvasByStudy } = useCanvasStore();
  const { currentTheme, setTheme } = useThemeStore();

  const {
    user,
    partnerUser,
    activeRole,
    setIsAuthModalOpen,
    switchActiveProfile,
    logout,
    getActiveUser
  } = useAuthStore();
  const activeUser = getActiveUser();

  const {
    isConfigModalOpen,
    setIsConfigModalOpen,
    isShareModalOpen,
    setIsShareModalOpen,
    studyToShare,
    setStudyToShare,
    isImportModalOpen,
    setIsImportModalOpen,
    sharedStudyToImport,
    setSharedStudyToImport,
    communityStudies,
    loadCommunityStudies,
    isLoadingCommunity
  } = useCloudStore();

  // Pestañas internas de Sección 1: "Mis Estudios" o "Compartidos por Amigos"
  const [studiesTab, setStudiesTab] = useState<'mine' | 'community'>('mine');
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [searchingFriendCode, setSearchingFriendCode] = useState(false);
  const [friendCodeError, setFriendCodeError] = useState<string | null>(null);

  // Modales
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isUploadBookOpen, setIsUploadBookOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCreateStudyOpen, setIsCreateStudyOpen] = useState(false);
  const [selectedStudyForDetail, setSelectedStudyForDetail] = useState<Study | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Cargar estudios comunitarios cuando el usuario abre la pestaña
  useEffect(() => {
    if (studiesTab === 'community') {
      loadCommunityStudies();
    }
  }, [studiesTab, loadCommunityStudies]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setIsDownloadModalOpen(true);
    }
  };

  const handleSearchFriendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCodeInput.trim()) return;
    setSearchingFriendCode(true);
    setFriendCodeError(null);
    try {
      const found = await cloudSyncService.fetchSharedStudyByCode(friendCodeInput.trim());
      if (found) {
        setSharedStudyToImport(found);
        setFriendCodeInput('');
      } else {
        setFriendCodeError('No se encontró ningún estudio con ese enlace o código.');
      }
    } finally {
      setSearchingFriendCode(false);
    }
  };

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  return (
    <div
      className={`h-full flex flex-col overflow-y-auto select-none transition-colors ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* 1. Cabecera Principal de Navegación: Sección 1: Menú Principal (Mis Estudios) */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between shrink-0 sticky top-0 z-20 backdrop-blur-md shadow-xs ${
          isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base tracking-tight">Mis Estudios</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                {studies.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-0.5">Menú Principal de Koinonía</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicador de Nube */}
          <CloudSyncStatusBadge compact />

          {/* Acceso directo a Sección Lectura */}
          <button
            onClick={onGoToBible}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors border ${
              isDark
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700'
            }`}
            title="Ir a la Sección Lectura (Biblia y Libros)"
          >
            <span>Lectura</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Barra Superior de Acciones Rápidas (Descargar App, Subir Libro, Buscar con Filtros) */}
      <div
        className={`p-2.5 px-4 border-b flex items-center gap-2 shrink-0 overflow-x-auto ${
          isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-amber-50/40 border-amber-200/50'
        }`}
      >
        {/* BOTÓN 1: DESCARGAR APP */}
        <button
          onClick={handleInstallClick}
          className={`flex-1 min-w-[105px] py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
            isDark
              ? 'border-blue-800/70 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300'
              : 'border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-950'
          }`}
          title="Instalar Koinonía en pantalla completa en tu dispositivo móvil"
        >
          <Download className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">Descargar App</span>
        </button>

        {/* BOTÓN 2: SUBIR LIBRO (FOTOS + IA) */}
        <button
          onClick={() => setIsUploadBookOpen(true)}
          className={`flex-1 min-w-[105px] py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
            isDark
              ? 'border-amber-700/70 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300'
              : 'border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-950'
          }`}
          title="Fotografiar hojas o libros y transcribirlos con IA"
        >
          <BookPlus className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Subir Libro</span>
        </button>

        {/* BOTÓN 3: BUSCADOR INTELIGENTE CON FILTROS */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className={`flex-1 min-w-[105px] py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
            isDark
              ? 'border-purple-800/70 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300'
              : 'border-purple-200 bg-purple-50/80 hover:bg-purple-100 text-purple-950'
          }`}
          title="Buscador con filtro inteligente por estudios, libros, fechas o etiquetas"
        >
          <Search className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span className="truncate">Buscar...</span>
        </button>
      </div>

      {/* 3. Contenido Principal */}
      <div className="p-4 space-y-5 max-w-lg mx-auto w-full pb-24">
        {/* ========================================================================= */}
        {/* SECCIÓN PRINCIPAL: LISTA DE MIS ESTUDIOS CON BADGES Y MODAL EMERGENTE   */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          {/* Alternador de Pestañas: [Mis Estudios] vs [Compartidos con Amigos] */}
          <div
            className={`p-1 rounded-2xl border flex items-center text-xs font-bold ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setStudiesTab('mine')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                studiesTab === 'mine'
                  ? isDark
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-900 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Mis Estudios ({studies.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStudiesTab('community')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                studiesTab === 'community'
                  ? isDark
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-900 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Amigos & Comunidad</span>
            </button>
          </div>

          {/* VISTA 1: TUS ESTUDIOS PERSONALES */}
          {studiesTab === 'mine' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Tus cuadernos y apuntes exegéticos</span>

                {/* BOTÓN "+ NUEVO ESTUDIO" CON MODAL EMERGENTE */}
                <button
                  onClick={() => setIsCreateStudyOpen(true)}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Estudio</span>
                </button>
              </div>

              {/* Tarjetas de Estudios */}
              <div className="space-y-2.5">
                {studies.map((study) => {
                  const isActive = study.id === activeStudyId;
                  const sketchbookData = getStudyData(study.id);
                  const pageCount = sketchbookData?.pages?.length || 1;
                  const textBlockCount = study.blocks?.length || 0;
                  const nodeCount = canvasByStudy[study.id]?.nodes?.length || 0;
                  const tagsCount = study.tags?.length || 0;

                  return (
                    <div
                      key={study.id}
                      onClick={() => setSelectedStudyForDetail(study)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-2xs ${
                        isActive
                          ? isDark
                            ? 'bg-gradient-to-br from-slate-900 to-amber-950/30 border-amber-600/80 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                            : 'bg-gradient-to-br from-amber-50/90 to-orange-50/40 border-amber-400/90 shadow-xs ring-1 ring-amber-400/40'
                          : isDark
                          ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <h3 className="font-bold text-sm leading-snug line-clamp-2">
                              {study.title}
                            </h3>
                            {isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500 text-slate-950 shadow-2xs shrink-0">
                                En uso
                              </span>
                            )}
                            {study.visibility === 'public' && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-0.5" title="Público en la nube">
                                <Globe className="w-2.5 h-2.5" /> Enlace
                              </span>
                            )}
                            {study.visibility === 'friends' && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-0.5" title="Compartido con amigos">
                                <Users className="w-2.5 h-2.5" /> Amigos
                              </span>
                            )}
                          </div>

                          {study.description && (
                            <p className="text-xs text-slate-400 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                              {study.description}
                            </p>
                          )}

                          {/* Iconitos de métricas solicitados: páginas, notas, nodos y etiquetas */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                              <BookOpen className="w-3 h-3 text-amber-500" />
                              <span>{pageCount} {pageCount === 1 ? 'pág' : 'págs'}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                              <FileText className="w-3 h-3 text-emerald-500" />
                              <span>{textBlockCount} {textBlockCount === 1 ? 'nota' : 'notas'}</span>
                            </span>

                            {nodeCount > 0 && (
                              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                                <Layers className="w-3 h-3 text-blue-500" />
                                <span>{nodeCount} {nodeCount === 1 ? 'nodo' : 'nodos'}</span>
                              </span>
                            )}

                            {tagsCount > 0 && (
                              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                                <Tag className="w-3 h-3 text-purple-500" />
                                <span>{tagsCount} {tagsCount === 1 ? 'tag' : 'tags'}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 self-center">
                          {/* Botón rápido para compartir */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStudyToShare(study);
                            }}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Compartir este estudio"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* VISTA 2: ESTUDIOS COMPARTIDOS POR AMIGOS Y COMUNIDAD */
            <div className="space-y-4">
              {/* Formulario para ingresar un código de enlace de un amigo */}
              <form
                onSubmit={handleSearchFriendCode}
                className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-xs">Cargar Estudio de un Amigo</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  ¿Te enviaron un código o enlace por WhatsApp? Pégalo aquí para verlo y clonarlo:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={friendCodeInput}
                    onChange={(e) => setFriendCodeInput(e.target.value)}
                    placeholder="ej. koinonia-8f9a2b..."
                    className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={searchingFriendCode || !friendCodeInput.trim()}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {searchingFriendCode ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                    <span>Abrir</span>
                  </button>
                </div>
                {friendCodeError && (
                  <p className="text-[11px] text-rose-400 pt-0.5">{friendCodeError}</p>
                )}
              </form>

              {/* Lista de Estudios de la Comunidad / Amigos */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Estudios Disponibles ({communityStudies.length})
                  </span>
                  <button
                    onClick={() => loadCommunityStudies()}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Actualizar
                  </button>
                </div>

                {isLoadingCommunity ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    <span>Cargando estudios de la nube...</span>
                  </div>
                ) : communityStudies.length === 0 ? (
                  <div
                    className={`p-6 rounded-2xl border text-center text-xs space-y-2 ${
                      isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Users className="w-8 h-8 mx-auto text-indigo-400 opacity-60" />
                    <p className="font-semibold">Aún no hay estudios de amigos en tu nube.</p>
                    <p className="text-[11px] opacity-80 max-w-xs mx-auto">
                      Comparte uno de tus estudios usando el botón "Compartir" para que tus amigos puedan conectarse.
                    </p>
                  </div>
                ) : (
                  communityStudies.map((cs) => (
                    <div
                      key={cs.id}
                      onClick={() => setSharedStudyToImport(cs)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/70 hover:bg-slate-850'
                          : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold text-indigo-400">
                              @{cs.author}
                            </span>
                            <span className="text-[10px] text-slate-400">·</span>
                            <span className="text-[10px] text-slate-400">
                              {cs.blocks?.length || 0} notas
                            </span>
                          </div>
                          <h4 className="font-bold text-sm leading-snug">{cs.title}</h4>
                          {cs.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1">{cs.description}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                          Ver / Clonar
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN LIBROS PROPIOS (Subidos con fotos e IA)                           */}
        {/* ========================================================================= */}
        {customBooks.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookPlus className="w-4 h-4 text-orange-500" />
                <h2 className="font-bold text-sm tracking-tight">Tus Libros Digitalizados con IA</h2>
                <span className="text-[11px] font-semibold text-slate-400">({customBooks.length})</span>
              </div>
              <button
                onClick={() => setIsUploadBookOpen(true)}
                className="text-xs font-bold text-amber-500 hover:underline"
              >
                + Subir Otro
              </button>
            </div>

            <div className="space-y-2">
              {customBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => {
                    selectCustomBook(book.id, 1);
                    onGoToBible();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-orange-500/60'
                      : 'bg-white border-slate-200 hover:border-orange-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate">{book.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {book.author} · {book.chapters.length} {book.chapters.length === 1 ? 'capítulo' : 'capítulos'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      Leer
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECCIÓN DE CUENTA / GOOGLE SIGN IN & MODO PAREJA                         */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {user ? (
            <div
              className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-colors ${
                isDark
                  ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800'
                  : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {activeUser?.picture ? (
                      <img
                        src={activeUser.picture}
                        alt={activeUser.name}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/40"
                      />
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base text-white shadow-sm ${
                          activeRole === 'partner'
                            ? 'bg-gradient-to-tr from-purple-600 to-purple-500'
                            : 'bg-gradient-to-tr from-amber-600 to-amber-500'
                        }`}
                      >
                        {(activeUser?.name || user.name).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm truncate">{activeUser?.name || user.name}</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-0.5">
                        <GoogleLogo className="w-2.5 h-2.5" /> Google
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{activeUser?.email || user.email}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className={`p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors ${
                    isDark ? 'hover:bg-rose-950/40' : 'hover:bg-rose-50'
                  }`}
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Botón de configuración de nube */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-blue-400" />
                  <span>Nube Koinonía</span>
                </span>
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer"
                >
                  Gestionar Nube / Firebase
                </button>
              </div>

              {/* Modo Pareja */}
              {partnerUser && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500" />
                    <span>
                      Autor activo: <strong>{activeRole === 'partner' ? partnerUser.name : user.givenName || user.name}</strong>
                    </span>
                  </div>
                  <button
                    onClick={switchActiveProfile}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-purple-300'
                        : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800'
                    }`}
                  >
                    Cambiar autor
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-colors ${
                isDark
                  ? 'bg-gradient-to-br from-slate-900 to-amber-950/30 border-amber-900/50'
                  : 'bg-gradient-to-br from-white to-amber-50/70 border-amber-200/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                  <GoogleLogo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs">Tu Cuenta Koinonía</h3>
                  <p className="text-[11px] text-slate-400">Inicia sesión con Google para sincronizar tus notas y autoría</p>
                </div>
              </div>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <GoogleLogo className="w-4 h-4" />
                <span>Iniciar Sesión con Google</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN APARIENCIA & TEMAS VISUALES                                       */}
        {/* ========================================================================= */}
        <div
          className={`p-4 rounded-2xl border shadow-xs space-y-2.5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Apariencia del Cuaderno</span>
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

        {/* Accesos directos a las otras dos secciones */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onGoToBible}
            className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sección Lectura</span>
          </button>
          <button
            onClick={onGoToStudy}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm border transition-all ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Sección Estudio</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALES PORTALEADOS                                                      */}
      {/* ========================================================================= */}

      {/* 1. Modal para Crear Nuevo Estudio Bíblico */}
      <CreateStudyModal
        isOpen={isCreateStudyOpen}
        onClose={() => setIsCreateStudyOpen(false)}
        onCreated={(newId) => {
          setActiveStudyId(newId);
          setIsCreateStudyOpen(false);
          onGoToStudy();
        }}
      />

      {/* 2. Modal Detalle Emergente de Estudio Bíblico */}
      <StudyDetailModal
        study={selectedStudyForDetail}
        isOpen={Boolean(selectedStudyForDetail)}
        onClose={() => setSelectedStudyForDetail(null)}
        onSelectAndOpen={(studyId) => {
          setActiveStudyId(studyId);
          setSelectedStudyForDetail(null);
          onGoToStudy();
        }}
      />

      {/* 3. Modal de Compartir Estudio en la Nube */}
      <ShareStudyModal
        study={studyToShare}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* 4. Modal para Importar / Ver Estudio Compartido de un Amigo */}
      <ImportStudyModal
        studyPayload={sharedStudyToImport}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={() => {
          onGoToStudy();
        }}
      />

      {/* 5. Modal de Configuración y Estado de la Nube (Firebase) */}
      <CloudSettingsModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />

      {/* 6. Modal de Descarga de App Web (PWA) */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* 7. Modal para Subir Libro con Fotos & IA */}
      <UploadBookModal
        isOpen={isUploadBookOpen}
        onClose={() => setIsUploadBookOpen(false)}
      />

      {/* 8. Modal de Búsqueda Inteligente con Filtros */}
      <SmartSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* 9. Modal Selector de Libros Bíblicos */}
      <BibleSelectorModal
        isOpen={isBookPickerOpen}
        onClose={() => setIsBookPickerOpen(false)}
      />

      {/* 10. Modal de Cámara / Escáner directo */}
      <StudyCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
      />
    </div>
  );
};
