import * as Keychain from 'react-native-keychain';
import axios from 'axios';
import { API_BASE_URL } from '../constants';

const SERVICE = 'id.smashstream.auth';

export type SecureTokens = { accessToken: string; refreshToken?: string };

export async function saveTokens(tokens: SecureTokens): Promise<void> {
  await Keychain.setGenericPassword('smashstream', JSON.stringify(tokens), {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getTokens(): Promise<SecureTokens | null> {
  const credential = await Keychain.getGenericPassword({ service: SERVICE });
  if (!credential) return null;
  try { return JSON.parse(credential.password) as SecureTokens; } catch { return null; }
}

export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}

let refreshInFlight: Promise<string | null> | null = null;
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const tokens = await getTokens();
    if (!tokens?.refreshToken) return null;
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: tokens.refreshToken,
      }, { timeout: 10_000 });
      await saveTokens({
        accessToken: response.data.token,
        refreshToken: response.data.refresh_token,
      });
      return response.data.token as string;
    } catch {
      await clearTokens();
      return null;
    }
  })();
  try { return await refreshInFlight; } finally { refreshInFlight = null; }
}
