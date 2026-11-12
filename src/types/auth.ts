export interface AuthUser {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  emailVerified?: boolean;
  authProvider: 'google' | 'demo';
  lastLoginAt: string;
}

export interface GoogleJwtPayload {
  iss?: string;
  sub: string;
  azp?: string;
  aud?: string;
  iat?: number;
  exp?: number;
  email: string;
  email_verified?: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}
