import type { Provider } from './index.js';

export const deepseekProvider: Provider = {
  id: 'deepseek',
  name: 'DeepSeek',
  description: 'DeepSeek V4 Pro & Flash',
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
      id: 'deepseek-v4-pro[1m]',
      name: 'DeepSeek V4 Pro (1M Context)',
      thinking: true,
      default: true,
    },
    {
      id: 'deepseek-v4-flash[1m]',
      name: 'DeepSeek V4 Flash (1M Context)',
    },
    {
      id: 'deepseek-v4-pro',
      name: 'DeepSeek V4 Pro',
      thinking: true,
    },
    {
      id: 'deepseek-v4-flash',
      name: 'DeepSeek V4 Flash',
    },
  ],
  getEnvOverrides(model: string): Record<string, string> {
    const fastModel = model.includes('[1m]') ? 'deepseek-v4-flash[1m]' : 'deepseek-v4-flash';
    return {
      ANTHROPIC_MODEL: model,
      ANTHROPIC_SMALL_FAST_MODEL: fastModel,
      ANTHROPIC_DEFAULT_SONNET_MODEL: model,
      ANTHROPIC_DEFAULT_OPUS_MODEL: model,
      ANTHROPIC_DEFAULT_HAIKU_MODEL: fastModel,
      CLAUDE_CODE_EFFORT_LEVEL: 'max',
    };
  },
  getValidateHeaders(apiKey: string): Record<string, string> {
    return {
      'x-api-key': apiKey,
    };
  },
  getValidateUrl(_regionId: string): string {
    return 'https://api.deepseek.com/models';
  },
};
