import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { GoogleLogo } from './GoogleLogo';
import {
  X,
  CheckCircle2,
  Settings,
  Sparkles,
  Cloud,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    user,
    loginWithGoogleCredential,
    loginWithProfile,
    googleClientId,
    setGoogleClientId
  } = useAuthStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [showConfig, setShowConfig] = useState(false);
  const [inputClientId, setInputClientId] = useState(googleClientId);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Detectar si el script de Google Identity Services está disponible en window
  useEffect(() => {
    const checkGis = () => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
      }
    };

    checkGis();
    const interval = setInterval(checkGis, 500);
    return () => clearInterval(interval);
  }, []);

  // Inicializar el botón oficial de Google Identity Services si hay Client ID
  useEffect(() => {
    if (!isAuthModalOpen || !gisLoaded || !googleBtnRef.current) return;

    const clientIdToUse = googleClientId || 'YOUR_GOOGLE_CLIENT_ID';

    try {
      window.google.accounts.id.initialize({
        client_id: clientIdToUse,
        callback: (response: any) => {
          if (response?.credential) {
            loginWithGoogleCredential(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Limpiar contenedor antes de renderizar
      googleBtnRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: isDark ? 'filled_black' : 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 280
      });
    } catch (e) {
      console.warn('[GoogleAuthModal] Error al inicializar Google GIS:', e);
    }
  }, [isAuthModalOpen, gisLoaded, googleClientId, isDark, loginWithGoogleCredential]);

  if (!isAuthModalOpen) return null;

  const handleSaveClientId = () => {
    setGoogleClientId(inputClientId);
    setShowConfig(false);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    loginWithProfile({
      name: customName.trim(),
      email: customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      authProvider: 'google'
    });
  };

  return (
    <div className="fixed inset-0 z-[160] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-150">
      <div
        className={`w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md rounded-none sm:rounded-3xl border-0 sm:border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 sm:border-slate-800 text-white shadow-black/90'
            : 'bg-white sm:border-slate-200 text-slate-800 shadow-2xl'
        }`}
      >
        {/* Cabecera del Modal */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center shrink-0">
              <GoogleLogo className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-tight">Cuenta & Acceso</h2>
              <p className="text-[11px] text-slate-400">Inicio de sesión con Google</p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isDark ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5">
          {/* Si ya hay un usuario logueado */}
          {user ? (
            <div
              className={`p-4 rounded-2xl border text-center space-y-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-emerald-50/60 border-emerald-200'
              }`}
            >
              <div className="relative w-16 h-16 mx-auto">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-500/30 mx-auto"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              <div>
                <h3 className="font-bold text-base">{user.name}</h3>
                <p className="text-xs text-slate-400">{user.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Sesión Activa
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Tarjeta de Inicio de Sesión Oficial Google */}
              <div
                className={`p-5 rounded-2xl border text-center space-y-4 ${
                  isDark
                    ? 'bg-gradient-to-b from-slate-950/80 to-slate-900 border-slate-800'
                    : 'bg-gradient-to-b from-slate-50 to-white border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-base">Inicia sesión en Koinonía</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Guarda tus estudios bíblicos, notas teológicas y sincroniza tu trabajo colaborativo.
                  </p>
                </div>

                {/* Contenedor del Botón Oficial de Google Identity Services */}
                <div className="flex flex-col items-center justify-center min-h-[44px]">
                  {googleClientId ? (
                    <div ref={googleBtnRef} className="flex justify-center" />
                  ) : null}

                  {/* Botón de acceso directo Google */}
                  <button
                    onClick={() => {
                      if (googleClientId && window.google?.accounts?.id) {
                        try {
                          window.google.accounts.id.prompt();
                        } catch {
                          // Fallback si One Tap no está disponible
                        }
                      } else {
                        setShowCustomForm(true);
                      }
                    }}
                    className={`w-full py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white hover:border-slate-600'
                        : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <GoogleLogo className="w-5 h-5 shrink-0" />
                    <span>Continuar con Google</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 justify-center">
                  <Cloud className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sincronización segura de tu perfil y apuntes</span>
                </div>
              </div>

              {/* Acceso Rápido / Perfiles para Modo Pareja */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Acceso Rápido / Modo Pareja
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      loginWithProfile({
                        name: 'Alejandro',
                        email: 'alejandro@koinonia.app',
                        authProvider: 'google'
                      })
                    }
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isDark
                        ? 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-200'
                        : 'bg-white hover:bg-amber-50/60 border-slate-200 text-slate-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center">
                        A
                      </div>
                      <span className="font-bold text-xs">Alejandro</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">alejandro@koinonia.app</span>
                  </button>

                  <button
                    onClick={() =>
                      loginWithProfile({
                        name: 'Esposa',
                        email: 'esposa@koinonia.app',
                        authProvider: 'google'
                      })
                    }
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isDark
                        ? 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-200'
                        : 'bg-white hover:bg-purple-50/60 border-slate-200 text-slate-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center">
                        E
                      </div>
                      <span className="font-bold text-xs">Esposa</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">esposa@koinonia.app</span>
                  </button>
                </div>
              </div>

              {/* Formulario para ingresar nombre y correo personalizado */}
              {showCustomForm && (
                <form
                  onSubmit={handleCustomLogin}
                  className={`p-4 rounded-2xl border text-xs space-y-3 animate-in fade-in duration-150 ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <label className="font-semibold block text-[11px] text-slate-400">Tu Nombre:</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ej. Alejandro Pérez"
                      required
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold block text-[11px] text-slate-400">Tu Correo de Google:</label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="tu-correo@gmail.com"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Entrar con este perfil
                  </button>
                </form>
              )}
            </>
          )}

          {/* Beneficios de la Cuenta */}
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
              isDark ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 text-amber-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ventajas de tu Cuenta Koinonía</span>
            </div>
            <ul className="space-y-1.5 text-[11px] leading-relaxed">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Autoría automática en cada estudio y nota manuscrita</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Modo Pareja: alterna o conecta dos perfiles en el mismo estudio</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Acceso a transcripción por cámara con IA y concordancia léxica</span>
              </li>
            </ul>
          </div>

          {/* Configuración avanzada de Google OAuth Client ID */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="w-full py-1.5 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                <span>Configuración de Google Client ID (Opcional)</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showConfig ? 'rotate-180' : ''}`}
              />
            </button>

            {showConfig && (
              <div
                className={`mt-2 p-3.5 rounded-2xl border text-xs space-y-2.5 animate-in fade-in duration-150 ${
                  isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Si deseas usar tu propio proyecto de Google Cloud para el botón oficial de One Tap, pega aquí tu Client ID:
                </p>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    placeholder="xxxxxxxx.apps.googleusercontent.com"
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Obtener Client ID en Google Cloud</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <button
                      onClick={handleSaveClientId}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie del modal en móviles */}
        <div
          className={`px-4 py-3 sm:hidden border-t flex items-center justify-end shrink-0 ${
            isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className={`w-full py-2.5 rounded-xl border text-xs font-semibold text-center transition-colors ${
              isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
