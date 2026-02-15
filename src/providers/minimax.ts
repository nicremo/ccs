import type { Provider } from './index.js';

export const minimaxProvider: Provider = {
  id: 'minimax',
  name: 'MiniMax',
  description: 'MiniMax M2.5 AI Model',
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
      id: 'MiniMax-M2.5',
      name: 'MiniMax-M2.5',
      default: true,
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
  getValidateUrl(regionId: string): string {
    // MiniMax uses the base URL itself for validation
    return regionId === 'global'
      ? 'https://api.minimax.io/anthropic/v1/models'
      : 'https://api.minimaxi.com/anthropic/v1/models';
  },
};
