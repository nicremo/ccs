import type { Provider } from './index.js';

export const zhipuProvider: Provider = {
  id: 'zhipu',
  name: 'Z.AI / GLM',
  description: 'Zhipu AI GLM Coding Plan',
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
      id: 'glm-5',
      name: 'GLM-5',
      default: true,
    },
  ],
  getEnvOverrides(_model: string): Record<string, string> {
    // GLM uses the default Anthropic model routing, no overrides needed
    return {};
  },
  getValidateUrl(regionId: string): string {
    return regionId === 'global'
      ? 'https://api.z.ai/api/coding/paas/v4/models'
      : 'https://open.bigmodel.cn/api/coding/paas/v4/models';
  },
};
