import { API_ENDPOINTS } from '@/services/api/endpoints';
import { useAuthStore } from '@/stores/authStore';
import {
  clearAuthTokens,
  extractTokensFromAuthResponse,
  getRefreshToken,
  setAuthTokens,
} from '@/utils/tokenMemory';
import { BASE_URL } from '@/lib/apiConfig';

let refreshInFlight: Promise<string | null> | null = null;

export const logoutSession = (): void => {
  clearAuthTokens();
  useAuthStore.getState().userLogout();
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    // BUG-002 FIX: backend validates `refresh_token` (snake_case)
    body: JSON.stringify({ refresh_token: refreshToken, refreshToken }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const { accessToken, refreshToken: newRefreshToken } = extractTokensFromAuthResponse(data);

  if (!accessToken) return null;

  setAuthTokens(accessToken, newRefreshToken ?? refreshToken);
  return accessToken;
};

export const getRefreshedAccessToken = (): Promise<string | null> => {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
};

export const isRefreshEndpoint = (url: string): boolean =>
  url.includes(API_ENDPOINTS.AUTH.REFRESH);
