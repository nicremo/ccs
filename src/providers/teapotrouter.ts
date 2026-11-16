import type { Provider } from './index.js';

export const teapotRouterProvider: Provider = {
  id: 'teapotrouter',
  name: 'TeapotRouter',
  description: 'Claude and GPT model families via one endpoint',
  regions: [
    {
      id: 'global',
      name: 'Global',
      baseUrl: 'https://api.teapotrouter.com',
      apiKeyUrl: 'https://teapotrouter.com/dashboard',
    },
  ],
  models: [
    {
      id: 'claude-sonnet-5-5',
      name: 'Claude Sonnet 5.5',
      thinking: true,
      default: true,
    },
    {
      id: 'claude-opus-5-5',
      name: 'Claude Opus 5.5',
      thinking: true,
    },
    {
      id: 'claude-fable-5-2',
      name: 'Claude Fable 5.2',
      thinking: true,
    },
    {
      id: 'claude-haiku-4-5',
      name: 'Claude Haiku 4.5',
    },
  ],
  getEnvOverrides(model: string): Record<string, string> {
    const fastModel = 'claude-haiku-4-5';
    return {
      ANTHROPIC_MODEL: model,
      ANTHROPIC_SMALL_FAST_MODEL: fastModel,
      ANTHROPIC_DEFAULT_SONNET_MODEL: model,
      ANTHROPIC_DEFAULT_OPUS_MODEL: model,
      ANTHROPIC_DEFAULT_HAIKU_MODEL: fastModel,
      CLAUDE_CODE_SUBAGENT_MODEL: fastModel,
    };
  },
  getValidateHeaders(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
    };
  },
  getValidateUrl(_regionId: string): string {
    return 'https://api.teapotrouter.com/v1/models';
  },
};
