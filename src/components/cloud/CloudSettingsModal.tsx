import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCloudStore } from '../../store/useCloudStore';
import { useThemeStore } from '../../store/useThemeStore';
import { FirebaseProjectConfig } from '../../types/cloud';
import {
  Cloud,
  X,
  CheckCircle2,
  RefreshCw,
  Key,
  AlertCircle,
  HelpCircle,
  Save,
  Trash2,
  Smartphone,
  Laptop
} from 'lucide-react';

interface CloudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSettingsModal: React.FC<CloudSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const {
    syncStatus,
    firebaseConfig,
    updateFirebaseConfig,
    syncAllToCloud,
    pullFromCloud
  } = useCloudStore();

  const [rawJson, setRawJson] = useState('');
  const [apiKey, setApiKey] = useState(firebaseConfig?.apiKey || '');
  const [projectId, setProjectId] = useState(firebaseConfig?.projectId || '');
  const [appId, setAppId] = useState(firebaseConfig?.appId || '');

  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handleParseJson = () => {
    try {
      // Intentar extraer valores si pegó el objeto config completo de Firebase
      const clean = rawJson.replace(/const\s+firebaseConfig\s*=\s*/, '').replace(/;$/, '');
      const parsed = JSON.parse(clean);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.appId) setAppId(parsed.appId);
      setFeedback({ success: true, message: '¡Configuración leída con éxito!' });
    } catch {
      setFeedback({ success: false, message: 'El texto no es un JSON válido de Firebase.' });
    }
  };

  const handleSaveConfig = async () => {
    if (!apiKey.trim() || !projectId.trim()) {
      setFeedback({ success: false, message: 'Ingresa al menos la apiKey y projectId.' });
      return;
    }

    setIsTesting(true);
    setFeedback(null);

    const config: FirebaseProjectConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: `${projectId.trim()}.firebaseapp.com`,
      storageBucket: `${projectId.trim()}.appspot.com`,
      appId: appId.trim() || '1:123456789:web:abcdef'
    };

    const res = await updateFirebaseConfig(config);
    setFeedback(res);
    setIsTesting(false);
  };

  const handleClearConfig = async () => {
    await updateFirebaseConfig(null);
    setApiKey('');
    setProjectId('');
    setAppId('');
    setFeedback({ success: true, message: 'Credenciales eliminadas. Modo local activo.' });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const ok = await syncAllToCloud();
      if (ok) {
        await pullFromCloud();
        setFeedback({ success: true, message: '¡Estudios sincronizados con la nube correctamente!' });
      } else {
        setFeedback({ success: false, message: 'Error durante la sincronización.' });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex flex-col justify-start sm:justify-center sm:items-center sm:p-4 bg-black/95 sm:bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ touchAction: 'none' }}
    >
      <div
        className={`w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-none sm:rounded-3xl border-0 sm:border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-white shadow-black/90'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto' }}
      >
        {/* Cabecera del Modal */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-bold text-sm sm:text-base leading-tight truncate">
                  Sincronización en la Nube
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                  Multi-dispositivo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Accede a tus estudios bíblicos desde cualquier teléfono o PC
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isDark ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Desplazable */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4">
          {/* Estado Actual de Sincronización */}
          <div
            className={`p-4 rounded-2xl border text-xs space-y-3 ${
              syncStatus === 'synced'
                ? isDark
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : syncStatus === 'syncing'
                ? isDark
                  ? 'bg-blue-950/30 border-blue-800/60 text-blue-200'
                  : 'bg-blue-50 border-blue-200 text-blue-950'
                : isDark
                ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-sm">
                  {syncStatus === 'synced'
                    ? 'Nube Conectada y Sincronizada'
                    : syncStatus === 'syncing'
                    ? 'Sincronizando con la Nube...'
                    : syncStatus === 'error'
                    ? 'Error de Conexión a la Nube'
                    : 'Modo Local Activo (Sin Nube Externa)'}
                </span>
              </div>
              {syncStatus === 'synced' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            </div>

            <p className="text-[11px] opacity-90 leading-relaxed">
              {syncStatus === 'synced'
                ? 'Tus notas, estudios y cuadernos Cornell se guardan en Google Cloud Firestore. Puedes verlos y editarlos desde cualquier celular o PC con tu sesión.'
                : 'Tus estudios están protegidos en el almacenamiento local de tu navegador. Configura tu proyecto gratuito de Firebase para sincronizarlos entre dispositivos y compartirlos.'}
            </p>

            {/* Dispositivos vinculados */}
            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-blue-400" /> Computadora
                </span>
                <span>⇄</span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Celular
                </span>
              </div>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="font-bold underline text-blue-500 hover:text-blue-400 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sincronizar Ahora</span>
              </button>
            </div>
          </div>

          {/* Feedback de acciones */}
          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                feedback.success
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Formulario de Credenciales de Firebase */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>Configuración de Firebase (Firestore)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{showGuide ? 'Ocultar Guía' : '¿Cómo obtenerla gratis?'}</span>
              </button>
            </div>

            {/* Guía Rápida Gratuita de Firebase */}
            {showGuide && (
              <div
                className={`p-3.5 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-150 ${
                  isDark ? 'bg-slate-950/90 border-slate-800 text-slate-300' : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}
              >
                <p className="font-bold text-amber-600 dark:text-amber-400">
                  Cómo activar tu Nube Gratuita en Google Firebase (2 min):
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li>Ingresa a <strong>console.firebase.google.com</strong> con tu cuenta de Google.</li>
                  <li>Haz clic en <strong>"Crear un proyecto"</strong> (ej: <em>koinonia-estudios</em>).</li>
                  <li>En el menú izquierdo ve a <strong>Firestore Database</strong> y haz clic en <em>Crear base de datos</em>.</li>
                  <li>En Configuración del proyecto ⚙️, agrega una <strong>App Web (&lt;/&gt;)</strong>.</li>
                  <li>Copia el bloque <code>firebaseConfig</code> y pégalo abajo.</li>
                </ol>
                <p className="text-[10px] text-slate-400 pt-1">
                  * La capa gratuita de Google incluye 50,000 lecturas y 20,000 escrituras al día ($0.00 USD).
                </p>
              </div>
            )}

            {/* Pegar JSON Rápido */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Pegar objeto JSON completo (Opcional):</span>
                {rawJson.trim() && (
                  <button
                    type="button"
                    onClick={handleParseJson}
                    className="text-[10px] font-bold text-indigo-400 hover:underline"
                  >
                    Auto-completar campos
                  </button>
                )}
              </div>
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                placeholder='const firebaseConfig = { apiKey: "AIza...", projectId: "koinonia-..." };'
                rows={2}
                className={`w-full p-2.5 rounded-xl border font-mono text-[11px] focus:outline-none resize-none ${
                  isDark ? 'bg-slate-950/70 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
            </div>

            {/* Campos individuales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400">API Key:</span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400">Project ID:</span>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="ej. koinonia-estudios"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Botones de Guardar / Probar */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isTesting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isTesting ? 'Validando conexión...' : 'Guardar y Conectar Nube'}</span>
              </button>

              {firebaseConfig && (
                <button
                  type="button"
                  onClick={handleClearConfig}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors ${
                    isDark ? 'border-rose-900/50' : 'border-rose-200'
                  }`}
                  title="Eliminar configuración de Firebase"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-end shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-colors ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-white'
                : 'border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Listo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
