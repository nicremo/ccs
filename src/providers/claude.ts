import type { Provider } from './index.js';

export const claudeProvider: Provider = {
  id: 'claude',
  name: 'Anthropic (Claude)',
  description: 'Official Anthropic Claude API',
  regions: [
    {
      id: 'global',
      name: 'Global',
      baseUrl: 'https://api.anthropic.com',
      apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    },
  ],
  models: [
    {
      id: 'claude-opus-4-5-20251120',
      name: 'Claude Opus 4.5',
      default: true,
    },
    {
      id: 'claude-sonnet-4-20250514',
      name: 'Claude Sonnet 4',
    },
    {
      id: 'claude-haiku-3-5-20250620',
      name: 'Claude Haiku 3.5',
    },
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
    },
  ],
  getEnvOverrides(model: string): Record<string, string> {
    return {
      ANTHROPIC_MODEL: model,
    };
  },
  getValidateUrl(_regionId: string): string {
    return 'https://api.anthropic.com/v1/models';
  },
};
