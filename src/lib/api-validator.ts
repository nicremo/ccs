import { logger } from '../utils/logger.js';
import type { Provider } from '../providers/index.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
}

export async function validateApiKey(
  apiKey: string,
  provider: Provider,
  regionId: string,
): Promise<ValidationResult> {
  const url = provider.getValidateUrl(regionId);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'invalid_api_key', message: 'API Key is invalid or expired' };
    }

    if (response.ok) {
      return { valid: true };
    }

    return { valid: false, error: 'unknown_error', message: `HTTP ${response.status}: ${response.statusText}` };
  } catch (error) {
    logger.logError('validateApiKey', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return { valid: false, error: 'network_error', message: 'Request timeout (15s)' };
    }

    return {
      valid: false,
      error: 'network_error',
      message: error instanceof Error ? error.message : 'Network connection failed',
    };
  }
}
