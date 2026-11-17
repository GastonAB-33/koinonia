import React from 'react';

export type MobileNavView = 'menu' | 'bible' | 'study';

interface MobileNavigationBarProps {
  activeView: MobileNavView;
  onViewChange: (view: MobileNavView) => void;
  rightPanelTab?: 'editor' | 'freebook' | 'sketchbook' | 'canvas';
}

interface ScreenIconProps {
  fillColor: string;
  borderColor: string;
  accentColor: string;
  isActive: boolean;
}

const ScreenDeviceIcon: React.FC<ScreenIconProps> = ({
  fillColor,
  borderColor,
  accentColor,
  isActive
}) => {
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
            ? 'scale-110 drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]'
            : 'scale-95 opacity-55 hover:opacity-85'
        }`}
      >
        {/* Rectángulo vertical como una pantalla de celular */}
        <rect
          x="1"
          y="1"
          width="16"
          height="26"
          rx="3.5"
          fill={fillColor}
          stroke={borderColor}
          strokeWidth="1.5"
        />
        {/* Ranura auricular/notch superior */}
        <line
          x1="6.5"
          y1="3.5"
          x2="11.5"
          y2="3.5"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Barra inferior / home indicator */}
        <line
          x1="6"
          y1="24.5"
          x2="12"
          y2="24.5"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      {/* Indicador sutil de sección activa sin texto */}
      <span
        className={`w-1.5 h-1.5 rounded-full mt-1.5 transition-all duration-200 ${
          isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
        style={{ backgroundColor: borderColor }}
      />
    </div>
  );
};

export const MobileNavigationBar: React.FC<MobileNavigationBarProps> = ({
  activeView,
  onViewChange
}) => {
  return (
    <nav
      className="shrink-0 h-14 px-4 flex items-center justify-center gap-12 sm:gap-16 z-30 select-none border-t transition-colors shadow-[0_-3px_12px_rgba(180,100,30,0.07)]"
      style={{
        backgroundColor: '#faefe3',
        borderColor: '#eddccb'
      }}
      aria-label="Navegación de secciones"
    >
      {/* 1. Sección Mis Estudios: Violeta */}
      <button
        type="button"
        onClick={() => onViewChange('menu')}
        className={`p-2 rounded-2xl transition-all duration-200 active:scale-90 focus:outline-none ${
          activeView === 'menu' ? 'bg-black/5' : 'hover:bg-black/5'
        }`}
        title="Mis Estudios"
        aria-label="Mis Estudios"
      >
        <ScreenDeviceIcon
          fillColor="#8b5cf6"
          borderColor="#7c3aed"
          accentColor="#ffffff"
          isActive={activeView === 'menu'}
        />
      </button>

      {/* 2. Sección Lectura: Naranja Fuerte */}
      <button
        type="button"
        onClick={() => onViewChange('bible')}
        className={`p-2 rounded-2xl transition-all duration-200 active:scale-90 focus:outline-none ${
          activeView === 'bible' ? 'bg-black/5' : 'hover:bg-black/5'
        }`}
        title="Lectura"
        aria-label="Lectura"
      >
        <ScreenDeviceIcon
          fillColor="#ea580c"
          borderColor="#c2410c"
          accentColor="#ffffff"
          isActive={activeView === 'bible'}
        />
      </button>

      {/* 3. Sección Estudio: Blanco */}
      <button
        type="button"
        onClick={() => onViewChange('study')}
        className={`p-2 rounded-2xl transition-all duration-200 active:scale-90 focus:outline-none ${
          activeView === 'study' ? 'bg-black/5' : 'hover:bg-black/5'
        }`}
        title="Estudio"
        aria-label="Estudio"
      >
        <ScreenDeviceIcon
          fillColor="#ffffff"
          borderColor="#cbd5e1"
          accentColor="#94a3b8"
          isActive={activeView === 'study'}
        />
      </button>
    </nav>
  );
};
