export interface AuthUser {
  name?: unknown;
  displayName?: unknown;
  fullName?: unknown;
  email?: unknown;
  user?: AuthUser;
  id?: string;
}
