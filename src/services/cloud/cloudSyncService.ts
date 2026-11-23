import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebaseConfig';
import { Study } from '../../types/study';
import { CloudStudyPayload, StudyVisibility } from '../../types/cloud';

const MOCK_SHARED_STORAGE_KEY = 'koinonia_mock_shared_studies';

function getMockSharedStorage(): Record<string, CloudStudyPayload> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(MOCK_SHARED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMockSharedStorage(data: Record<string, CloudStudyPayload>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_SHARED_STORAGE_KEY, JSON.stringify(data));
}

export class CloudSyncService {
  /**
   * Indica si Firebase está configurado y listo para sincronizar
   */
  isConfigured(): boolean {
    return Boolean(getFirebaseFirestore());
  }

  /**
   * Prueba la conexión a la base de datos de Firebase
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const db = getFirebaseFirestore();
    if (!db) {
      return {
        success: false,
        message: 'No se han configurado credenciales de Firebase todavía.'
      };
    }

    try {
      // Intentar una lectura de prueba a la colección de control
      const testRef = doc(db, '_connection_test', 'ping');
      await setDoc(testRef, { timestamp: new Date().toISOString() }, { merge: true });
      return {
        success: true,
        message: '¡Conexión exitosa con Firebase Cloud Firestore en vivo!'
      };
    } catch (err: any) {
      console.error('[CloudSyncService] Error en testConnection:', err);
      return {
        success: false,
        message: err?.message || 'Error de permisos o conexión con Firebase Firestore.'
      };
    }
  }

  /**
   * Guarda o actualiza un estudio bíblico en la nube
   */
  async saveStudy(
    study: Study,
    userId: string,
    userProfile?: { name: string; email?: string; picture?: string },
    additionalData?: { sketchbookPages?: any[]; canvasNodes?: any[]; canvasEdges?: any[] }
  ): Promise<boolean> {
    const payload: CloudStudyPayload = {
      id: study.id,
      title: study.title,
      description: study.description || '',
      tags: study.tags || [],
      createdAt: study.createdAt,
      updatedAt: new Date().toISOString(),
      author: study.author || userProfile?.name || 'Autor',
      ownerId: userId,
      ownerEmail: userProfile?.email || '',
      ownerPicture: userProfile?.picture || '',
      visibility: study.visibility || 'private',
      shareCode: study.shareCode || '',
      allowCopy: study.allowCopy ?? true,
      collaborators: study.collaborators || [],
      blocks: study.blocks || [],
      sketchbookPages: additionalData?.sketchbookPages || [],
      canvasNodes: additionalData?.canvasNodes || [],
      canvasEdges: additionalData?.canvasEdges || []
    };

    const db = getFirebaseFirestore();
    if (!db) {
      // Modo local / demo: guardar en almacenamiento compartido de respaldo
      const storage = getMockSharedStorage();
      storage[study.id] = payload;
      saveMockSharedStorage(storage);
      return true;
    }

    try {
      const studyRef = doc(db, 'studies', study.id);
      await setDoc(studyRef, payload, { merge: true });

      // Si el estudio tiene código de compartir público, actualizarlo en la colección pública
      if (study.shareCode && (study.visibility === 'public' || study.visibility === 'friends')) {
        const publicRef = doc(db, 'shared_studies', study.shareCode);
        await setDoc(publicRef, payload, { merge: true });
      }

      return true;
    } catch (err) {
      console.error('[CloudSyncService] Error al guardar estudio en la nube:', err);
      throw err;
    }
  }

  /**
   * Elimina un estudio de la nube
   */
  async deleteStudy(studyId: string, shareCode?: string): Promise<boolean> {
    const db = getFirebaseFirestore();
    if (!db) {
      const storage = getMockSharedStorage();
      delete storage[studyId];
      saveMockSharedStorage(storage);
      return true;
    }

    try {
      await deleteDoc(doc(db, 'studies', studyId));
      if (shareCode) {
        await deleteDoc(doc(db, 'shared_studies', shareCode));
      }
      return true;
    } catch (err) {
      console.error('[CloudSyncService] Error al eliminar estudio de la nube:', err);
      return false;
    }
  }

  /**
   * Obtiene todos los estudios del usuario desde la nube
   */
  async fetchUserStudies(userId: string): Promise<CloudStudyPayload[]> {
    const db = getFirebaseFirestore();
    if (!db) {
      const storage = getMockSharedStorage();
      return Object.values(storage).filter((s) => s.ownerId === userId);
    }

    try {
      const q = query(
        collection(db, 'studies'),
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const list: CloudStudyPayload[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as CloudStudyPayload);
      });
      return list;
    } catch (err) {
      console.error('[CloudSyncService] Error al obtener estudios del usuario:', err);
      return [];
    }
  }

  /**
   * Escucha cambios en tiempo real en los estudios del usuario
   */
  subscribeUserStudies(
    userId: string,
    onUpdated: (studies: CloudStudyPayload[]) => void
  ): Unsubscribe {
    const db = getFirebaseFirestore();
    if (!db) {
      // Retornar no-op unsubscribe
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'studies'),
        where('ownerId', '==', userId)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const list: CloudStudyPayload[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as CloudStudyPayload);
          });
          onUpdated(list);
        },
        (err) => {
          console.warn('[CloudSyncService] Error en snapshot de estudios:', err);
        }
      );
    } catch (err) {
      console.error('[CloudSyncService] Error al suscribirse a estudios:', err);
      return () => {};
    }
  }

  /**
   * Publica o actualiza el enlace para compartir un estudio
   */
  async generateShareLink(
    study: Study,
    visibility: StudyVisibility,
    allowCopy: boolean,
    userId: string,
    userProfile?: { name: string; email?: string; picture?: string },
    additionalData?: { sketchbookPages?: any[]; canvasNodes?: any[]; canvasEdges?: any[] }
  ): Promise<{ shareCode: string; shareUrl: string }> {
    // Generar código de compartir único de 8 caracteres alfanuméricos
    const shareCode = study.shareCode || `koinonia-${study.id.slice(-6)}-${Math.random().toString(36).slice(2, 6)}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5180';
    const shareUrl = `${origin}/?study=${shareCode}`;

    const updatedStudy: Study = {
      ...study,
      shareCode,
      visibility,
      allowCopy,
      isCloudSynced: true,
      cloudUpdatedAt: new Date().toISOString()
    };

    await this.saveStudy(updatedStudy, userId, userProfile, additionalData);

    return { shareCode, shareUrl };
  }

  /**
   * Busca y obtiene un estudio compartido usando su código de enlace
   */
  async fetchSharedStudyByCode(shareCode: string): Promise<CloudStudyPayload | null> {
    const cleanCode = shareCode.trim();
    if (!cleanCode) return null;

    const db = getFirebaseFirestore();
    if (!db) {
      const storage = getMockSharedStorage();
      const match = Object.values(storage).find((s) => s.shareCode === cleanCode);
      return match || null;
    }

    try {
      // 1. Buscar en la colección dedicada de estudios compartidos
      const sharedRef = doc(db, 'shared_studies', cleanCode);
      const snap = await getDoc(sharedRef);
      if (snap.exists()) {
        return snap.data() as CloudStudyPayload;
      }

      // 2. Si no, buscar en la colección general por el campo shareCode
      const q = query(collection(db, 'studies'), where('shareCode', '==', cleanCode));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        return querySnap.docs[0].data() as CloudStudyPayload;
      }

      return null;
    } catch (err) {
      console.error('[CloudSyncService] Error al obtener estudio compartido:', err);
      return null;
    }
  }

  /**
   * Obtiene los estudios públicos o de amigos disponibles en la comunidad
   */
  async fetchCommunityStudies(): Promise<CloudStudyPayload[]> {
    const db = getFirebaseFirestore();
    if (!db) {
      const storage = getMockSharedStorage();
      return Object.values(storage).filter((s) => s.visibility === 'public' || s.visibility === 'friends');
    }

    try {
      const q = query(
        collection(db, 'studies'),
        where('visibility', 'in', ['public', 'friends']),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const list: CloudStudyPayload[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as CloudStudyPayload);
      });
      return list;
    } catch (err) {
      console.error('[CloudSyncService] Error al obtener estudios comunitarios:', err);
      return [];
    }
  }
}

export const cloudSyncService = new CloudSyncService();
