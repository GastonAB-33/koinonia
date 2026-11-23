import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CloudSyncStatus, FirebaseProjectConfig, CloudStudyPayload, StudyVisibility } from '../types/cloud';
import { Study } from '../types/study';
import { cloudSyncService } from '../services/cloud/cloudSyncService';
import { getFirebaseConfig, setFirebaseConfig, resetFirebaseInstances } from '../services/cloud/firebaseConfig';
import { useAuthStore } from './useAuthStore';
import { useStudyStore } from './useStudyStore';
import { useSketchbookStore } from './useSketchbookStore';
import { useCanvasStore } from './useCanvasStore';

interface CloudState {
  syncStatus: CloudSyncStatus;
  lastSyncTime: string | null;
  firebaseConfig: FirebaseProjectConfig | null;

  // Estados de Modales
  isConfigModalOpen: boolean;
  isShareModalOpen: boolean;
  isImportModalOpen: boolean;
  studyToShare: Study | null;
  sharedStudyToImport: CloudStudyPayload | null;

  // Estudios comunitarios y de amigos
  communityStudies: CloudStudyPayload[];
  isLoadingCommunity: boolean;

  // Acciones
  setIsConfigModalOpen: (open: boolean) => void;
  setIsShareModalOpen: (open: boolean) => void;
  setIsImportModalOpen: (open: boolean) => void;
  setStudyToShare: (study: Study | null) => void;
  setSharedStudyToImport: (study: CloudStudyPayload | null) => void;

  updateFirebaseConfig: (config: FirebaseProjectConfig | null) => Promise<{ success: boolean; message: string }>;
  syncAllToCloud: () => Promise<boolean>;
  pullFromCloud: () => Promise<boolean>;
  shareStudy: (study: Study, visibility: StudyVisibility, allowCopy: boolean) => Promise<{ shareCode: string; shareUrl: string }>;
  importSharedStudy: (payload: CloudStudyPayload) => string;
  loadCommunityStudies: () => Promise<void>;
  checkUrlForSharedStudy: () => Promise<void>;
}

export const useCloudStore = create<CloudState>()(
  persist(
    (set, get) => ({
      syncStatus: getFirebaseConfig() ? 'synced' : 'unconfigured',
      lastSyncTime: null,
      firebaseConfig: getFirebaseConfig(),

      isConfigModalOpen: false,
      isShareModalOpen: false,
      isImportModalOpen: false,
      studyToShare: null,
      sharedStudyToImport: null,

      communityStudies: [],
      isLoadingCommunity: false,

      setIsConfigModalOpen: (open) => set({ isConfigModalOpen: open }),
      setIsShareModalOpen: (open) => set({ isShareModalOpen: open }),
      setIsImportModalOpen: (open) => set({ isImportModalOpen: open }),
      setStudyToShare: (study) => set({ studyToShare: study, isShareModalOpen: Boolean(study) }),
      setSharedStudyToImport: (study) => set({ sharedStudyToImport: study, isImportModalOpen: Boolean(study) }),

      updateFirebaseConfig: async (config) => {
        setFirebaseConfig(config);
        resetFirebaseInstances();
        set({ firebaseConfig: config });

        if (!config) {
          set({ syncStatus: 'unconfigured' });
          return { success: true, message: 'Configuración de Firebase eliminada.' };
        }

        set({ syncStatus: 'syncing' });
        const testRes = await cloudSyncService.testConnection();
        if (testRes.success) {
          set({ syncStatus: 'synced', lastSyncTime: new Date().toISOString() });
          // Iniciar sincronización inicial
          get().syncAllToCloud();
          return testRes;
        } else {
          set({ syncStatus: 'error' });
          return testRes;
        }
      },

      syncAllToCloud: async () => {
        const { getActiveUser } = useAuthStore.getState();
        const activeUser = getActiveUser();
        const userId = activeUser?.id || 'invitado_local';

        set({ syncStatus: 'syncing' });

        try {
          const { studies } = useStudyStore.getState();
          const { getStudyData } = useSketchbookStore.getState();
          const { canvasByStudy } = useCanvasStore.getState();

          for (const study of studies) {
            const sketchbook = getStudyData(study.id);
            const canvas = canvasByStudy[study.id];

            await cloudSyncService.saveStudy(
              study,
              userId,
              {
                name: activeUser?.name || study.author || 'Usuario',
                email: activeUser?.email,
                picture: activeUser?.picture
              },
              {
                sketchbookPages: sketchbook?.pages || [],
                canvasNodes: canvas?.nodes || [],
                canvasEdges: canvas?.edges || []
              }
            );
          }

          set({
            syncStatus: 'synced',
            lastSyncTime: new Date().toISOString()
          });
          return true;
        } catch (err) {
          console.error('[useCloudStore] Error durante sincronización:', err);
          set({ syncStatus: 'error' });
          return false;
        }
      },

      pullFromCloud: async () => {
        const { getActiveUser } = useAuthStore.getState();
        const activeUser = getActiveUser();
        if (!activeUser?.id) return false;

        set({ syncStatus: 'syncing' });

        try {
          const cloudStudies = await cloudSyncService.fetchUserStudies(activeUser.id);
          if (cloudStudies.length > 0) {
            const { studies } = useStudyStore.getState();
            const existingIds = new Set(studies.map((s) => s.id));

            // Agregar o actualizar estudios
            cloudStudies.forEach((cs) => {
              if (!existingIds.has(cs.id)) {
                useStudyStore.setState((prev) => ({
                  studies: [
                    ...prev.studies,
                    {
                      id: cs.id,
                      title: cs.title,
                      description: cs.description,
                      tags: cs.tags || [],
                      createdAt: cs.createdAt,
                      updatedAt: cs.updatedAt,
                      author: cs.author,
                      blocks: cs.blocks || [],
                      visibility: cs.visibility,
                      ownerId: cs.ownerId,
                      shareCode: cs.shareCode,
                      isCloudSynced: true,
                      cloudUpdatedAt: cs.updatedAt
                    }
                  ]
                }));
              }
            });
          }

          set({
            syncStatus: 'synced',
            lastSyncTime: new Date().toISOString()
          });
          return true;
        } catch (err) {
          console.error('[useCloudStore] Error al descargar de la nube:', err);
          set({ syncStatus: 'error' });
          return false;
        }
      },

      shareStudy: async (study, visibility, allowCopy) => {
        const { getActiveUser } = useAuthStore.getState();
        const activeUser = getActiveUser();
        const userId = activeUser?.id || 'invitado_local';

        const { getStudyData } = useSketchbookStore.getState();
        const { canvasByStudy } = useCanvasStore.getState();
        const sketchbook = getStudyData(study.id);
        const canvas = canvasByStudy[study.id];

        const res = await cloudSyncService.generateShareLink(
          study,
          visibility,
          allowCopy,
          userId,
          {
            name: activeUser?.name || study.author,
            email: activeUser?.email,
            picture: activeUser?.picture
          },
          {
            sketchbookPages: sketchbook?.pages || [],
            canvasNodes: canvas?.nodes || [],
            canvasEdges: canvas?.edges || []
          }
        );

        // Actualizar el estudio localmente con el nuevo shareCode y visibilidad
        useStudyStore.setState((prev) => ({
          studies: prev.studies.map((s) =>
            s.id === study.id
              ? {
                  ...s,
                  shareCode: res.shareCode,
                  visibility,
                  allowCopy,
                  isCloudSynced: true,
                  cloudUpdatedAt: new Date().toISOString()
                }
              : s
          )
        }));

        return res;
      },

      importSharedStudy: (payload) => {
        const { getActiveAuthorName } = useAuthStore.getState();
        const myAuthorName = getActiveAuthorName();

        // Generar un ID nuevo para evitar colisiones
        const newStudyId = `study-${Date.now()}`;
        const newTitle = payload.author
          ? `${payload.title} (de ${payload.author})`
          : payload.title;

        const importedStudy: Study = {
          id: newStudyId,
          title: newTitle,
          description: payload.description || `Estudio compartido originalmente por ${payload.author}.`,
          tags: [...(payload.tags || []), 'Compartido', 'Amigos'],
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: 'Recién importado',
          author: myAuthorName,
          blocks: payload.blocks || [],
          visibility: 'private',
          isCloudSynced: false
        };

        // 1. Agregar a Mis Estudios
        useStudyStore.setState((prev) => ({
          studies: [importedStudy, ...prev.studies],
          activeStudyId: newStudyId
        }));

        // 2. Si venía con páginas de cuaderno Cornell, agregarlas a useSketchbookStore
        if (Array.isArray(payload.sketchbookPages) && payload.sketchbookPages.length > 0) {
          useSketchbookStore.setState((prev) => ({
            sketchbookByStudy: {
              ...prev.sketchbookByStudy,
              [newStudyId]: {
                pages: payload.sketchbookPages!.map((p, idx) => ({
                  ...p,
                  id: `page-${newStudyId}-${idx + 1}`
                })),
                activePageIndex: 0
              }
            }
          }));
        }

        // 3. Si venía con nodos de pizarra infinita, agregarlos a useCanvasStore
        if (Array.isArray(payload.canvasNodes) && payload.canvasNodes.length > 0) {
          useCanvasStore.setState((prev) => ({
            canvasByStudy: {
              ...prev.canvasByStudy,
              [newStudyId]: {
                nodes: payload.canvasNodes!,
                edges: payload.canvasEdges || []
              }
            }
          }));
        }

        return newStudyId;
      },

      loadCommunityStudies: async () => {
        set({ isLoadingCommunity: true });
        try {
          const list = await cloudSyncService.fetchCommunityStudies();
          set({ communityStudies: list, isLoadingCommunity: false });
        } catch {
          set({ isLoadingCommunity: false });
        }
      },

      checkUrlForSharedStudy: async () => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const shareCode = params.get('study') || params.get('shared_study');

        if (shareCode) {
          const found = await cloudSyncService.fetchSharedStudyByCode(shareCode);
          if (found) {
            set({ sharedStudyToImport: found, isImportModalOpen: true });
          }
        }
      }
    }),
    {
      name: 'koinonia-cloud-store',
      partialize: (state) => ({
        lastSyncTime: state.lastSyncTime,
        firebaseConfig: state.firebaseConfig
      })
    }
  )
);
