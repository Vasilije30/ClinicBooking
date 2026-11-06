const TOKEN_KEY = "token";

export interface AuthUser{
    id:string;
    email:string;
    roles:string[];
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function userFromToken(token: string): AuthUser | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    if (payload.exp * 1000 < Date.now()) return null;

    const role = payload[ROLE_CLAIM];
    return {
      id: payload.sub,
      email: payload.email,
      roles: role ? (Array.isArray(role) ? role : [role]) : [],
    };
  } catch {
    return null;
  }
}