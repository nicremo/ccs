import type { Provider } from './index.js';

export const zhipuProvider: Provider = {
  id: 'zhipu',
  name: 'Z.AI / GLM',
  description: 'Zhipu AI GLM-5.1 / GLM-5 Models',
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
      id: 'glm-5.1',
      name: 'GLM-5.1',
      default: true,
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
      ANTHROPIC_DEFAULT_HAIKU_MODEL: model,
    };
  },
  getValidateUrl(regionId: string): string {
    return regionId === 'global'
      ? 'https://api.z.ai/api/coding/paas/v4/models'
      : 'https://open.bigmodel.cn/api/coding/paas/v4/models';
  },
};
