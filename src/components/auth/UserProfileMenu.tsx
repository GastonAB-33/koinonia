import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { GoogleLogo } from './GoogleLogo';
import {
  LogOut,
  ChevronDown,
  Heart,
  UserCheck,
  UserPlus
} from 'lucide-react';

export const UserProfileMenu: React.FC = () => {
  const {
    user,
    partnerUser,
    activeRole,
    setIsAuthModalOpen,
    switchActiveProfile,
    setPartnerProfile,
    logout,
    getActiveUser
  } = useAuthStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [isOpen, setIsOpen] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [partnerNameInput, setPartnerNameInput] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const activeUser = getActiveUser();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Si no hay usuario logueado: Botón de Iniciar Sesión con Google
  if (!user) {
    return (
      <button
        onClick={() => setIsAuthModalOpen(true)}
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
          isDark
            ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-600'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
        }`}
        title="Iniciar sesión con Google para sincronizar tus estudios"
      >
        <GoogleLogo className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Iniciar Sesión</span>
      </button>
    );
  }

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerNameInput.trim()) return;
    setPartnerProfile({
      name: partnerNameInput.trim(),
      email: `${partnerNameInput.toLowerCase().replace(/\s+/g, '')}@koinonia.app`
    });
    setPartnerNameInput('');
    setShowAddPartner(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón de Perfil con Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-1 sm:pr-2.5 rounded-2xl border transition-all cursor-pointer ${
          isDark
            ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
        }`}
        title={`Conectado como ${activeUser?.name || user.name}`}
      >
        <div className="relative">
          {activeUser?.picture ? (
            <img
              src={activeUser.picture}
              alt={activeUser.name}
              className="w-7 h-7 rounded-xl object-cover ring-1 ring-emerald-500/40"
            />
          ) : (
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                activeRole === 'partner'
                  ? 'bg-gradient-to-tr from-purple-600 to-purple-500'
                  : 'bg-gradient-to-tr from-amber-600 to-amber-500'
              }`}
            >
              {(activeUser?.name || user.name).charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>

        <span className="hidden md:inline font-bold text-xs max-w-[100px] truncate">
          {activeUser?.givenName || activeUser?.name || user.name}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-72 rounded-3xl border shadow-2xl p-3 space-y-3 z-[110] animate-in fade-in duration-150 ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white shadow-black/80'
              : 'bg-white border-slate-200 text-slate-800 shadow-xl'
          }`}
        >
          {/* Cabecera del usuario */}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs truncate block">{user.name}</span>
                <GoogleLogo className="w-3 h-3 shrink-0" />
              </div>
              <span className="text-[11px] text-slate-400 truncate block">{user.email}</span>
            </div>
          </div>

          {/* Sección de Modo Pareja (Koinonía Familiar) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500" />
                <span>Modo Pareja</span>
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold lowercase">
                activo: {activeRole === 'partner' ? partnerUser?.name || 'Esposa' : user.givenName || user.name}
              </span>
            </div>

            {partnerUser ? (
              <button
                onClick={() => {
                  switchActiveProfile();
                }}
                className={`w-full p-2.5 rounded-2xl border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
                title="Cambiar entre autoría de esposo y esposa en los estudios"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${
                      activeRole === 'partner' ? 'bg-purple-600' : 'bg-slate-600'
                    }`}
                  >
                    {partnerUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="font-bold block leading-tight">{partnerUser.name}</span>
                    <span className="text-[10px] text-slate-400">Alternar autor activo</span>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </button>
            ) : (
              <div>
                {!showAddPartner ? (
                  <button
                    onClick={() => setShowAddPartner(true)}
                    className={`w-full py-2 px-3 rounded-2xl border border-dashed text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-700 hover:border-slate-500 text-slate-300'
                        : 'border-slate-300 hover:border-slate-400 text-slate-600'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5 text-rose-400" />
                    <span>Conectar perfil de cónyuge</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddPartner} className="p-2 space-y-2">
                    <input
                      type="text"
                      value={partnerNameInput}
                      onChange={(e) => setPartnerNameInput(e.target.value)}
                      placeholder="Nombre de tu cónyuge..."
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs focus:outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowAddPartner(false)}
                        className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Opciones Generales */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsAuthModalOpen(true);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <GoogleLogo className="w-3.5 h-3.5" />
              <span>Gestionar cuenta de Google</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer text-rose-500 ${
                isDark ? 'hover:bg-rose-950/40' : 'hover:bg-rose-50'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
