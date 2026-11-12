import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, GoogleJwtPayload } from '../types/auth';

const STORAGE_KEY_AUTH = 'koinonia_auth_storage';
const STORAGE_KEY_CLIENT_ID = 'koinonia_google_client_id';

/**
 * Decodifica con seguridad un token JWT retornado por Google Identity Services
 */
export function decodeGoogleJwt(token: string): GoogleJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('[useAuthStore] Error al decodificar JWT de Google:', err);
    return null;
  }
}

interface AuthState {
  user: AuthUser | null;
  partnerUser: AuthUser | null;
  activeRole: 'primary' | 'partner';
  googleClientId: string;
  isAuthModalOpen: boolean;

  // Acciones
  setIsAuthModalOpen: (open: boolean) => void;
  setGoogleClientId: (clientId: string) => void;
  loginWithGoogleCredential: (credentialJwt: string) => AuthUser | null;
  loginWithProfile: (profile: Partial<AuthUser>) => AuthUser;
  setPartnerProfile: (partner: Partial<AuthUser> | null) => void;
  switchActiveProfile: () => void;
  logout: () => void;
  getActiveUser: () => AuthUser | null;
  getActiveAuthorName: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      partnerUser: null,
      activeRole: 'primary',
      googleClientId:
        typeof window !== 'undefined'
          ? localStorage.getItem(STORAGE_KEY_CLIENT_ID) ||
            (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
            ''
          : '',
      isAuthModalOpen: false,

      setIsAuthModalOpen: (open: boolean) => {
        set({ isAuthModalOpen: open });
      },

      setGoogleClientId: (clientId: string) => {
        const trimmed = clientId.trim();
        if (typeof window !== 'undefined') {
          if (trimmed) {
            localStorage.setItem(STORAGE_KEY_CLIENT_ID, trimmed);
          } else {
            localStorage.removeItem(STORAGE_KEY_CLIENT_ID);
          }
        }
        set({ googleClientId: trimmed });
      },

      loginWithGoogleCredential: (credentialJwt: string) => {
        const payload = decodeGoogleJwt(credentialJwt);
        if (!payload || !payload.sub || !payload.email) {
          console.error('[useAuthStore] Token de Google inválido.');
          return null;
        }

        const newUser: AuthUser = {
          id: payload.sub,
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          givenName: payload.given_name,
          familyName: payload.family_name,
          picture: payload.picture,
          emailVerified: payload.email_verified,
          authProvider: 'google',
          lastLoginAt: new Date().toISOString()
        };

        set({
          user: newUser,
          activeRole: 'primary',
          isAuthModalOpen: false
        });

        return newUser;
      },

      loginWithProfile: (profile: Partial<AuthUser>) => {
        const id = profile.id || `user-${Date.now()}`;
        const name = profile.name || 'Alejandro';
        const email = profile.email || `${name.toLowerCase()}@koinonia.app`;

        const newUser: AuthUser = {
          id,
          email,
          name,
          givenName: profile.givenName || name,
          familyName: profile.familyName,
          picture: profile.picture,
          emailVerified: true,
          authProvider: profile.authProvider || 'demo',
          lastLoginAt: new Date().toISOString()
        };

        set({
          user: newUser,
          activeRole: 'primary',
          isAuthModalOpen: false
        });

        return newUser;
      },

      setPartnerProfile: (partner: Partial<AuthUser> | null) => {
        if (!partner) {
          set({ partnerUser: null, activeRole: 'primary' });
          return;
        }

        const partnerUser: AuthUser = {
          id: partner.id || `partner-${Date.now()}`,
          email: partner.email || 'esposa@koinonia.app',
          name: partner.name || 'Esposa',
          givenName: partner.givenName || 'Esposa',
          picture: partner.picture,
          emailVerified: true,
          authProvider: partner.authProvider || 'demo',
          lastLoginAt: new Date().toISOString()
        };

        set({ partnerUser });
      },

      switchActiveProfile: () => {
        const { partnerUser, activeRole } = get();
        if (!partnerUser) return;
        set({ activeRole: activeRole === 'primary' ? 'partner' : 'primary' });
      },

      logout: () => {
        set({
          user: null,
          partnerUser: null,
          activeRole: 'primary'
        });
      },

      getActiveUser: () => {
        const { user, partnerUser, activeRole } = get();
        if (activeRole === 'partner' && partnerUser) {
          return partnerUser;
        }
        return user;
      },

      getActiveAuthorName: () => {
        const { user, partnerUser, activeRole } = get();
        if (activeRole === 'partner' && partnerUser) {
          return partnerUser.name;
        }
        if (user && partnerUser) {
          return `${user.givenName || user.name} & ${partnerUser.givenName || partnerUser.name}`;
        }
        if (user) {
          return user.name;
        }
        return 'Alejandro y Esposa';
      }
    }),
    {
      name: STORAGE_KEY_AUTH,
      partialize: (state) => ({
        user: state.user,
        partnerUser: state.partnerUser,
        activeRole: state.activeRole,
        googleClientId: state.googleClientId
      })
    }
  )
);
