export type CloudSyncStatus =
  | 'synced'       // Todo sincronizado con la nube
  | 'syncing'      // Subiendo o bajando cambios en este momento
  | 'offline'      // Sin conexión a internet (modo local activo)
  | 'unconfigured' // Aún no ha configurado credenciales de Firebase
  | 'error';       // Error de autenticación o cuota

export type StudyVisibility = 'private' | 'friends' | 'public' | 'couple';

export interface StudyCollaborator {
  userId: string;
  name: string;
  email: string;
  role: 'editor' | 'viewer';
  avatarUrl?: string;
  joinedAt: string;
}

export interface SharedStudyMetadata {
  isShared: boolean;
  shareCode: string;
  visibility: StudyVisibility;
  allowCopy: boolean;
  viewCount: number;
  sharedAt: string;
  shareUrl?: string;
}

export interface FriendProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'active' | 'invited';
  sharedStudiesCount: number;
  lastActiveAt?: string;
}

export interface FirebaseProjectConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

export interface CloudStudyPayload {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  ownerId: string;
  ownerEmail?: string;
  ownerPicture?: string;
  visibility: StudyVisibility;
  shareCode?: string;
  allowCopy?: boolean;
  collaborators?: StudyCollaborator[];
  blocks: any[];
  sketchbookPages?: any[];
  canvasNodes?: any[];
  canvasEdges?: any[];
}
