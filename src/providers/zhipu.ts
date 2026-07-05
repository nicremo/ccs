import type { Provider } from './index.js';

export const zhipuProvider: Provider = {
  id: 'zhipu',
  name: 'Z.AI / GLM',
  description: 'Z.AI GLM-5.2 / GLM-4.7 Models',
  regions: [
    {
      id: 'global',
      name: 'Global',
      baseUrl: 'https://api.z.ai/api/anthropic',
      apiKeyUrl: 'https://z.ai/manage-apikey/apikey-list',
    },
    {
      id: 'china',
      name: 'China',
      baseUrl: 'https://open.bigmodel.cn/api/anthropic',
      apiKeyUrl: 'https://bigmodel.cn/usercenter/proj-mgmt/apikeys',
    },
  ],
  models: [
    {
      id: 'glm-5.2[1m]',
      name: 'GLM-5.2 (1M Context)',
      default: true,
      thinking: true,
    },
    {
      id: 'glm-5.2',
      name: 'GLM-5.2',
      thinking: true,
    },
    {
      id: 'glm-4.7',
      name: 'GLM-4.7',
      thinking: true,
    },
    {
      id: 'glm-4.5-air',
      name: 'GLM-4.5-Air',
    },
    {
      id: 'glm-5.1',
      name: 'GLM-5.1',
      thinking: true,
    },
    {
      id: 'glm-5-turbo',
      name: 'GLM-5-Turbo (Coding Optimized)',
    },
    {
      id: 'glm-5',
      name: 'GLM-5',
    },
  ],
  getEnvOverrides(model: string): Record<string, string> {
    return {
      ANTHROPIC_MODEL: model,
      ANTHROPIC_DEFAULT_SONNET_MODEL: model,
      ANTHROPIC_DEFAULT_OPUS_MODEL: model,
      ANTHROPIC_DEFAULT_HAIKU_MODEL: model.startsWith('glm-5.2') ? 'glm-4.7' : model,
      CLAUDE_CODE_AUTO_COMPACT_WINDOW: model.includes('[1m]') ? '1000000' : '202752',
    };
  },
  getValidateUrl(regionId: string): string {
    return regionId === 'global'
      ? 'https://api.z.ai/api/coding/paas/v4/models'
      : 'https://open.bigmodel.cn/api/coding/paas/v4/models';
  },
};
