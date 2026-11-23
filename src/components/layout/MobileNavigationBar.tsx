import React from 'react';
import { useBibleStore } from '../../store/useBibleStore';

export type MobileNavView = 'menu' | 'bible' | 'bible-parallel' | 'study';

interface MobileNavigationBarProps {
  activeView: MobileNavView;
  onViewChange: (view: MobileNavView) => void;
  rightPanelTab?: 'editor' | 'freebook' | 'sketchbook' | 'canvas';
}

interface ScreenIconProps {
  color: string;
  isActive: boolean;
}

const ScreenDeviceIcon: React.FC<ScreenIconProps> = ({
  color,
  isActive
}) => {
  const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === 'white';

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width="18"
        height="28"
        viewBox="0 0 18 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-200 transform ${
          isActive
            ? 'scale-110 opacity-100'
            : 'scale-95 opacity-40 hover:opacity-75'
        }`}
        style={
          isWhite
            ? { filter: 'drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.35))' }
            : isActive
            ? { filter: `drop-shadow(0 2px 4px ${color}35)` }
            : undefined
        }
      >
        {/* Rectángulo vertical (pantalla): Sin relleno, solo contorno de color */}
        <rect
          x="1"
          y="1"
          width="16"
          height="26"
          rx="3.5"
          fill="none"
          stroke={color}
          strokeWidth={isActive ? '2' : '1.6'}
        />
        {/* Ranura auricular/notch superior */}
        <line
          x1="6.5"
          y1="3.5"
          x2="11.5"
          y2="3.5"
          stroke={color}
          strokeWidth={isActive ? '1.5' : '1.2'}
          strokeLinecap="round"
        />
        {/* Barra inferior / home indicator */}
        <line
          x1="6"
          y1="24.5"
          x2="12"
          y2="24.5"
          stroke={color}
          strokeWidth={isActive ? '1.5' : '1.2'}
          strokeLinecap="round"
        />
      </svg>

      {/* Indicador sutil de sección activa sin texto */}
      <span
        className={`w-1.5 h-1.5 rounded-full mt-1.5 transition-all duration-200 ${
          isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
        style={{
          backgroundColor: color,
          boxShadow: isWhite ? '0 1px 2px rgba(0,0,0,0.3)' : undefined
        }}
      />
    </div>
  );
};

export const MobileNavigationBar: React.FC<MobileNavigationBarProps> = ({
  activeView,
  onViewChange
}) => {
  const { readingMode } = useBibleStore();
  const isSideBySide = readingMode === 'side-by-side';

  return (
    <nav
      className="shrink-0 w-full flex items-center justify-center gap-7 sm:gap-14 z-40 select-none border-t transition-colors shadow-[0_-3px_12px_rgba(180,100,30,0.07)]"
      style={{
        backgroundColor: '#faefe3',
        borderColor: '#eddccb',
        paddingTop: '6px',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)'
      }}
      aria-label="Navegación de secciones"
    >
      {/* 1. Sección Mis Estudios: Violeta (solo contorno) */}
      <button
        type="button"
        onClick={() => onViewChange('menu')}
        className="p-1.5 rounded-xl transition-all duration-200 active:scale-90 focus:outline-none cursor-pointer"
        title="Mis Estudios"
        aria-label="Mis Estudios"
      >
        <ScreenDeviceIcon
          color="#8b5cf6"
          isActive={activeView === 'menu'}
        />
      </button>

      {/* 2. Sección Lectura Principal: Naranja Fuerte (solo contorno) */}
      <button
        type="button"
        onClick={() => onViewChange('bible')}
        className="p-1.5 rounded-xl transition-all duration-200 active:scale-90 focus:outline-none cursor-pointer"
        title="Lectura Principal"
        aria-label="Lectura Principal"
      >
        <ScreenDeviceIcon
          color="#ea580c"
          isActive={activeView === 'bible'}
        />
      </button>

      {/* 3. Sección Comparación (Solo si modo es 'al lado'): Ambos del mismo color naranja (solo contorno) */}
      {isSideBySide && (
        <button
          type="button"
          onClick={() => onViewChange('bible-parallel')}
          className="p-1.5 rounded-xl transition-all duration-200 active:scale-90 focus:outline-none cursor-pointer"
          title="Lectura Comparación"
          aria-label="Lectura Comparación"
        >
          <ScreenDeviceIcon
            color="#ea580c"
            isActive={activeView === 'bible-parallel'}
          />
        </button>
      )}

      {/* 4. Sección Estudio: Blanco (solo contorno) */}
      <button
        type="button"
        onClick={() => onViewChange('study')}
        className="p-1.5 rounded-xl transition-all duration-200 active:scale-90 focus:outline-none cursor-pointer"
        title="Estudio"
        aria-label="Estudio"
      >
        <ScreenDeviceIcon
          color="#ffffff"
          isActive={activeView === 'study'}
        />
      </button>
    </nav>
  );
};
