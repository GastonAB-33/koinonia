import React, { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { THEME_OPTIONS, ThemeId } from '../../types/theme';
import { Palette, Check, ChevronDown, Sparkles } from 'lucide-react';

export const ThemeDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentTheme, setTheme, getThemeInfo } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';
  const activeThemeInfo = getThemeInfo();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectTheme = (id: ThemeId) => {
    setTheme(id);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative select-none">
      {/* Botón Trigger de la Barra Superior */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold shadow-2xs group ${
          isDark
            ? 'border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200'
            : 'border-slate-200/90 bg-white/90 hover:bg-slate-50 text-slate-800'
        }`}
        title="Cambiar modelo de cuaderno digital y paleta de colores"
      >
        <Palette className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform" />
        <span className={`hidden sm:inline font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tema:</span>
        <span className={`font-semibold truncate max-w-[120px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {activeThemeInfo.name}
        </span>

        {/* Muestra de color en miniatura */}
        <div className="flex items-center -space-x-1 ml-0.5">
          {activeThemeInfo.palettePreview.slice(0, 3).map((col, idx) => (
            <span
              key={idx}
              className={`w-2.5 h-2.5 rounded-full border shadow-2xs ${isDark ? 'border-slate-800' : 'border-white'}`}
              style={{ backgroundColor: col }}
            />
          ))}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${
            isOpen ? (isDark ? 'rotate-180 text-white' : 'rotate-180 text-slate-700') : (isDark ? 'text-slate-400' : 'text-slate-400')
          }`}
        />
      </button>

      {/* Menú Desplegable con las 5 Opciones Solicitadas */}
      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-80 border shadow-2xl rounded-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className={`px-2.5 py-2 border-b mb-1.5 flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Modelos de Cuaderno & Paletas
              </h4>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                Elige la estética visual para el lector y cuadernos
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((theme) => {
              const isActive = theme.id === currentTheme;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                    isActive
                      ? isDark
                        ? 'bg-slate-800 border border-amber-500/80 shadow-xs'
                        : 'bg-amber-50/60 border border-amber-300/80 shadow-2xs'
                      : isDark
                      ? 'hover:bg-slate-800/60 border border-transparent hover:border-slate-700'
                      : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {theme.name}
                      </span>
                      {isActive && (
                        <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                          Activo
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {theme.tagline}
                    </p>

                    {/* Muestras de la paleta */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {theme.palettePreview.map((color, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full border shadow-2xs flex items-center justify-center text-[7px] ${
                            isDark ? 'border-slate-700' : 'border-slate-300/80'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 shrink-0">
                    {isActive ? (
                      <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className={`w-5 h-5 rounded-full border ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
