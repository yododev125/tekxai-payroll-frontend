const ACCESS_TOKEN_KEY  = 'tekxai_access_token';
const REFRESH_TOKEN_KEY = 'tekxai_refresh_token';

export const getAccessToken  = (): string | null => sessionStorage.getItem(ACCESS_TOKEN_KEY)  || localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);

export const setAccessToken = (token: string | null): void => {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const setRefreshToken = (token: string | null): void => {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setAuthTokens = (accessToken: string, refreshToken?: string | null): void => {
  setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
};

export const clearAccessToken  = (): void => { localStorage.removeItem(ACCESS_TOKEN_KEY); sessionStorage.removeItem(ACCESS_TOKEN_KEY); };
export const clearRefreshToken = (): void => { localStorage.removeItem(REFRESH_TOKEN_KEY); sessionStorage.removeItem(REFRESH_TOKEN_KEY); };
export const clearAuthTokens   = (): void => { clearAccessToken(); clearRefreshToken(); };

export const parseJwtExpiryMs = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch { return null; }
};

/**
 * BUG-001 FIX: Handle both camelCase (accessToken/refreshToken) 
 * and snake_case (access_token/refresh_token) from backend.
 * Also handles nested .data or .payload wrappers.
 */
export const extractTokensFromAuthResponse = (res: unknown): {
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
} => {
  const data = (res as Record<string, unknown>);
  // Try .data wrapper (our backend returns { success, data: { accessToken, user } })
  const inner = (data?.data ?? data?.payload ?? data) as Record<string, unknown>;
  
  const accessToken = (
    inner?.accessToken ??
    inner?.access_token ??
    data?.accessToken ??
    data?.access_token ??
    data?.token
  ) as string | undefined;

  // BUG-002 FIX: try both camel and snake case for refresh token
  const refreshToken = (
    inner?.refreshToken ??
    inner?.refresh_token ??
    data?.refreshToken ??
    data?.refresh_token
  ) as string | undefined;

  const user = (inner?.user ?? data?.user) as unknown;

  return { accessToken, refreshToken, user };
};
