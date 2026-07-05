import type { Provider } from './index.js';

export const zhipuProvider: Provider = {
  id: 'zhipu',
  name: 'Z.AI / GLM',
  description: 'Z.AI GLM-4.7 / GLM-5 Models',
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
      id: 'GLM-4.7',
      name: 'GLM-4.7',
      default: true,
      thinking: true,
    },
    {
      id: 'GLM-4.5-Air',
      name: 'GLM-4.5-Air',
    },
    {
      id: 'glm-5.2',
      name: 'GLM-5.2',
      thinking: true,
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
      ANTHROPIC_DEFAULT_HAIKU_MODEL: model === 'GLM-4.7' ? 'GLM-4.5-Air' : model,
    };
  },
  getValidateUrl(regionId: string): string {
    return regionId === 'global'
      ? 'https://api.z.ai/api/coding/paas/v4/models'
      : 'https://open.bigmodel.cn/api/coding/paas/v4/models';
  },
};
