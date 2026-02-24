export interface ProviderRegion {
  id: string;
  name: string;
  baseUrl: string;
  apiKeyUrl: string;
}

export interface ProviderModel {
  id: string;
  name: string;
  thinking?: boolean;
  default?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  regions: ProviderRegion[];
  models: ProviderModel[];
  // Extra env vars to set for this provider (beyond ANTHROPIC_BASE_URL/AUTH_TOKEN)
  getEnvOverrides(model: string): Record<string, string>;
  // URL to validate the API key
  getValidateUrl(regionId: string): string;
}

import { zhipuProvider } from './zhipu.js';
import { minimaxProvider } from './minimax.js';
import { kimiProvider } from './kimi.js';
import { claudeProvider } from './claude.js';

const providers: Provider[] = [claudeProvider, zhipuProvider, minimaxProvider, kimiProvider];

export function getProvider(id: string): Provider | undefined {
  return providers.find(p => p.id === id);
}

export function getAllProviders(): Provider[] {
  return [...providers];
}

// Detect which provider is active based on ANTHROPIC_BASE_URL
export function detectProviderByBaseUrl(baseUrl: string): Provider | undefined {
  return providers.find(p =>
    p.regions.some(r => baseUrl.startsWith(r.baseUrl.replace(/\/anthropic$/, '')))
  );
}
