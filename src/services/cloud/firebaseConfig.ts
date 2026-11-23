import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { FirebaseProjectConfig } from '../../types/cloud';

const STORAGE_KEY_FIREBASE_CONFIG = 'koinonia_firebase_config';

/**
 * Obtiene la configuración de Firebase desde variables de entorno de Vite o desde el almacenamiento local
 */
export function getFirebaseConfig(): FirebaseProjectConfig | null {
  // 1. Verificar si está guardado en localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.apiKey && parsed?.projectId) {
          return parsed;
        }
      } catch (e) {
        console.warn('[firebaseConfig] Error al parsear configuración guardada:', e);
      }
    }
  }

  // 2. Verificar variables de entorno de Vite (.env)
  const env = (import.meta as any).env || {};
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || ''
    };
  }

  return null;
}

/**
 * Guarda o borra la configuración de Firebase en el almacenamiento local del navegador
 */
export function setFirebaseConfig(config: FirebaseProjectConfig | null): void {
  if (typeof window === 'undefined') return;
  if (!config) {
    localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
  } else {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  }
}

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

/**
 * Inicializa y retorna la instancia de Firestore si hay credenciales válidas
 */
export function getFirebaseFirestore(): Firestore | null {
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (!appInstance) {
      if (getApps().length > 0) {
        appInstance = getApp();
      } else {
        appInstance = initializeApp(config);
      }
    }

    if (!dbInstance && appInstance) {
      dbInstance = getFirestore(appInstance);

      // Activar persistencia local sin conexión en el navegador si está disponible
      if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(dbInstance).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('[Firestore] Persistencia falló: Múltiples pestañas abiertas al mismo tiempo.');
          } else if (err.code === 'unimplemented') {
            console.warn('[Firestore] El navegador actual no soporta persistencia IndexedDB.');
          }
        });
      }
    }

    return dbInstance;
  } catch (err) {
    console.error('[firebaseConfig] Error inicializando Firebase:', err);
    return null;
  }
}

/**
 * Reinicia las instancias en memoria al cambiar la configuración
 */
export function resetFirebaseInstances(): void {
  appInstance = null;
  dbInstance = null;
}
