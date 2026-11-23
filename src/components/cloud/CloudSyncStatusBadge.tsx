import React from 'react';
import { useCloudStore } from '../../store/useCloudStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Cloud, RefreshCw, AlertCircle } from 'lucide-react';

interface CloudSyncStatusBadgeProps {
  compact?: boolean;
}

export const CloudSyncStatusBadge: React.FC<CloudSyncStatusBadgeProps> = ({ compact = false }) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const { syncStatus, setIsConfigModalOpen } = useCloudStore();

  return (
    <button
      type="button"
      onClick={() => setIsConfigModalOpen(true)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
        syncStatus === 'synced'
          ? isDark
            ? 'bg-blue-950/40 border-blue-800/60 text-blue-300 hover:bg-blue-900/50'
            : 'bg-blue-50/80 border-blue-200 text-blue-950 hover:bg-blue-100'
          : syncStatus === 'syncing'
          ? isDark
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 animate-pulse'
            : 'bg-amber-50/80 border-amber-200 text-amber-950 animate-pulse'
          : syncStatus === 'error'
          ? isDark
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/50'
            : 'bg-rose-50/80 border-rose-200 text-rose-950 hover:bg-rose-100'
          : isDark
          ? 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
      }`}
      title={
        syncStatus === 'synced'
          ? 'Sincronizado con la nube (haz clic para ver estado o sincronizar)'
          : syncStatus === 'syncing'
          ? 'Sincronizando con la nube...'
          : 'Nube no configurada (haz clic para conectar Firebase)'
      }
    >
      {syncStatus === 'synced' ? (
        <Cloud className="w-3.5 h-3.5 text-blue-500 shrink-0" />
      ) : syncStatus === 'syncing' ? (
        <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
      ) : syncStatus === 'error' ? (
        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
      ) : (
        <Cloud className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      )}

      {!compact && (
        <span className="text-[11px] truncate">
          {syncStatus === 'synced'
            ? 'Nube'
            : syncStatus === 'syncing'
            ? 'Sincronizando'
            : syncStatus === 'error'
            ? 'Revisar Nube'
            : 'Conectar Nube'}
        </span>
      )}
    </button>
  );
};
