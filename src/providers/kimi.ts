import type { Provider } from './index.js';

export const kimiProvider: Provider = {
  id: 'kimi',
  name: 'Kimi / Moonshot',
  description: 'Moonshot AI Kimi K2 Models',
  regions: [
    {
      id: 'global',
      name: 'Global',
      baseUrl: 'https://api.moonshot.ai/anthropic',
      apiKeyUrl: 'https://platform.moonshot.ai/console/api-keys',
    },
  ],
  models: [
    {
      id: 'kimi-k2.5',
      name: 'Kimi K2.5 (Latest)',
      default: true,
    },
    {
      id: 'kimi-k2-thinking-turbo',
      name: 'Kimi K2 Thinking Turbo',
      thinking: true,
    },
    {
      id: 'kimi-k2-turbo-preview',
      name: 'Kimi K2 Turbo Preview (Fast)',
    },
    {
      id: 'kimi-k2-0905-preview',
      name: 'Kimi K2 0905 Preview (256K)',
    },
  ],
  getEnvOverrides(model: string): Record<string, string> {
    return {
      ANTHROPIC_MODEL: model,
      ANTHROPIC_DEFAULT_SONNET_MODEL: model,
      ANTHROPIC_DEFAULT_OPUS_MODEL: model,
      ANTHROPIC_DEFAULT_HAIKU_MODEL: model,
      CLAUDE_CODE_SUBAGENT_MODEL: model,
    };
  },
  getValidateUrl(_regionId: string): string {
    return 'https://api.moonshot.ai/v1/models';
  },
};
