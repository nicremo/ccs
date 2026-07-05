import type { Provider } from './index.js';

export const minimaxProvider: Provider = {
  id: 'minimax',
  name: 'MiniMax',
  description: 'MiniMax M3 / M2.7 AI Models',
  regions: [
    {
      id: 'global',
      name: 'Global',
      baseUrl: 'https://api.minimax.io/anthropic',
      apiKeyUrl: 'https://platform.minimax.io/user-center/basic-information/interface-key',
    },
    {
      id: 'china',
      name: 'China',
      baseUrl: 'https://api.minimaxi.com/anthropic',
      apiKeyUrl: 'https://platform.minimaxi.com/user-center/basic-information/interface-key',
    },
  ],
  models: [
    {
      id: 'MiniMax-M3[1m]',
      name: 'MiniMax M3 (1M Context)',
      default: true,
    },
    {
      id: 'MiniMax-M3',
      name: 'MiniMax M3',
      thinking: true,
    },
    {
      id: 'MiniMax-M2.7',
      name: 'MiniMax M2.7',
    },
    {
      id: 'MiniMax-M2.7-highspeed',
      name: 'MiniMax M2.7 Highspeed (~100 tps)',
    },
    {
      id: 'MiniMax-M2.5-highspeed',
      name: 'MiniMax M2.5 Highspeed (~100 tps)',
    },
    {
      id: 'MiniMax-M2.5',
      name: 'MiniMax M2.5',
    },
  ],
  getEnvOverrides(model: string): Record<string, string> {
    return {
      ANTHROPIC_MODEL: model,
      ANTHROPIC_SMALL_FAST_MODEL: model,
      ANTHROPIC_DEFAULT_SONNET_MODEL: model,
      ANTHROPIC_DEFAULT_OPUS_MODEL: model,
      ANTHROPIC_DEFAULT_HAIKU_MODEL: model,
    };
  },
  getValidateHeaders(apiKey: string): Record<string, string> {
    return {
      'X-Api-Key': apiKey,
    };
  },
  getValidateUrl(regionId: string): string {
    return regionId === 'global'
      ? 'https://api.minimax.io/anthropic/v1/models'
      : 'https://api.minimaxi.com/anthropic/v1/models';
  },
};
