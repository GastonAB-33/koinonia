import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useThemeStore } from '../../store/useThemeStore';
import {
  Download,
  Smartphone,
  Laptop,
  X,
  Check,
  Sparkles,
  WifiOff,
  Zap,
  ShieldCheck,
  Share,
  PlusSquare
} from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Detectar plataforma inicial automáticamente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setActiveTab('ios');
    } else if (/android/i.test(userAgent)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(Boolean(checkStandalone));
  }, [isOpen]);

  // Capturar evento beforeinstallprompt de PWA
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Bloquear scroll de fondo
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          onClose();
        }
      } catch (err) {
        console.warn('Error al activar el instalador PWA:', err);
      } finally {
        setIsInstalling(false);
      }
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[180] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-150"
      style={{ touchAction: 'none' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-h-[92dvh] sm:max-h-[85vh] sm:max-w-xl rounded-t-3xl sm:rounded-3xl border-t sm:border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-white shadow-black/90'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
        }`}
        style={{ touchAction: 'pan-y' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? 'bg-slate-950/90 border-slate-800'
              : 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base">Descargar Koinonía App</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  App Web (PWA)
                </span>
              </div>
              <p className="text-xs text-slate-400">Instala la app en tu celular o PC sin tiendas de descarga</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isDark ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5">
          {/* Banner de Estado Standalone */}
          {isStandalone ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">¡Ya estás usando la App instalada!</p>
                <p className="text-[11px] opacity-85">Koinonía se ejecuta en modo pantalla completa nativo.</p>
              </div>
            </div>
          ) : deferredPrompt ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="space-y-0.5 text-center sm:text-left">
                <h3 className="font-bold text-sm text-blue-300 flex items-center justify-center sm:justify-start gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Instalación Rápida Disponible
                </h3>
                <p className="text-xs text-slate-300">
                  Tu navegador permite instalar Koinonía directamente con 1 solo toque.
                </p>
              </div>

              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalling ? 'Instalando...' : 'Instalar Ahora'}</span>
              </button>
            </div>
          ) : null}

          {/* Ventajas Clave */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 ${
                isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <WifiOff className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs">100% Offline</span>
              <span className="text-[10px] text-slate-400 leading-tight">Lee y estudia sin necesidad de internet</span>
            </div>

            <div
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 ${
                isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs">Súper Rápida</span>
              <span className="text-[10px] text-slate-400 leading-tight">Abre al instante desde tu pantalla de inicio</span>
            </div>

            <div
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 ${
                isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs">Sin Espacio</span>
              <span className="text-[10px] text-slate-400 leading-tight">No ocupa gigas de memoria en tu cel</span>
            </div>
          </div>

          {/* Selector de Plataforma */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Guía de Instalación Paso a Paso:
            </h3>

            <div
              className={`p-1 rounded-2xl border flex items-center gap-1 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'android'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android (Chrome)</span>
              </button>

              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'ios'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad (Safari)</span>
              </button>

              <button
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'desktop'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>PC / Mac</span>
              </button>
            </div>

            {/* Contenido según la pestaña seleccionada */}
            <div
              className={`p-4 rounded-2xl border text-xs space-y-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {activeTab === 'android' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p className="leading-relaxed">
                      En Google Chrome o Samsung Internet, toca los <strong>tres puntos (⋮)</strong> en la esquina superior derecha.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p className="leading-relaxed">
                      Selecciona la opción <strong>«Instalar aplicación»</strong> o <strong>«Añadir a pantalla de inicio»</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p className="leading-relaxed">
                      Presiona <strong>«Instalar»</strong>. Koinonía aparecerá en tu menú de aplicaciones con su icono dorado propio.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'ios' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p className="leading-relaxed">
                      Abre Koinonía en el navegador <strong>Safari</strong> de tu iPhone o iPad.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="leading-relaxed flex items-center gap-1.5 flex-wrap">
                      <span>Toca el botón de <strong>Compartir</strong></span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700 text-white font-mono text-[10px]">
                        <Share className="w-3 h-3" /> Compartir
                      </span>
                      <span>en la barra inferior.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="leading-relaxed flex items-center gap-1.5 flex-wrap">
                      <span>Desliza hacia abajo y presiona</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700 text-white font-semibold text-[10px]">
                        <PlusSquare className="w-3 h-3" /> Añadir a pantalla de inicio
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'desktop' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p className="leading-relaxed">
                      En Chrome, Edge o Brave, busca el <strong>icono de instalar</strong> (pantalla con flecha hacia abajo) ubicado en el extremo derecho de la barra de direcciones URL.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p className="leading-relaxed">
                      O haz clic en el Menú (⋮) de tu navegador → <strong>«Instalar Koinonía Estudio»</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pie de Acciones */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-end shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
