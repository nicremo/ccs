import type { Provider } from './index.js';

export const deepseekProvider: Provider = {
  id: 'deepseek',
  name: 'DeepSeek',
  description: 'DeepSeek V3.2 Chat & Reasoner',
  regions: [
    {
      id: 'global',
      name: 'Global',
      baseUrl: 'https://api.deepseek.com/anthropic',
      apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    },
  ],
  models: [
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner (V3.2 Thinking)',
      thinking: true,
      default: true,
    },
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat (V3.2)',
    },
  ],
  getEnvOverrides(model: string): Record<string, string> {
    return {
      ANTHROPIC_MODEL: model,
      ANTHROPIC_SMALL_FAST_MODEL: 'deepseek-chat',
      ANTHROPIC_DEFAULT_SONNET_MODEL: model,
      ANTHROPIC_DEFAULT_OPUS_MODEL: model,
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'deepseek-chat',
    };
  },
  getValidateUrl(_regionId: string): string {
    return 'https://api.deepseek.com/models';
  },
};
