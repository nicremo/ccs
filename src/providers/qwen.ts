import type { Provider } from './index.js';

export const qwenProvider: Provider = {
  id: 'qwen',
  name: 'Qwen / DashScope',
  description: 'Alibaba Qwen 3.5 / Qwen 3 Models',
  regions: [
    {
      id: 'global',
      name: 'International',
      baseUrl: 'https://dashscope-intl.aliyuncs.com/apps/anthropic',
      apiKeyUrl: 'https://dashscope-intl.console.aliyun.com/apiKey',
    },
    {
      id: 'china',
      name: 'China',
      baseUrl: 'https://dashscope.aliyuncs.com/apps/anthropic',
      apiKeyUrl: 'https://dashscope.console.aliyun.com/apiKey',
    },
  ],
  models: [
    {
      id: 'qwen3.5-plus',
      name: 'Qwen 3.5 Plus (Flagship)',
      default: true,
    },
    {
      id: 'qwen3-coder-plus',
      name: 'Qwen 3 Coder Plus',
    },
    {
      id: 'qwen3-coder-next',
      name: 'Qwen 3 Coder Next (Fast)',
    },
    {
      id: 'qwen3-max',
      name: 'Qwen 3 Max (SOTA)',
      thinking: true,
    },
    {
      id: 'qwen3.5-flash',
      name: 'Qwen 3.5 Flash (Budget)',
    },
  ],
  getEnvOverrides(model: string): Record<string, string> {
    return {
      ANTHROPIC_MODEL: model,
      ANTHROPIC_SMALL_FAST_MODEL: 'qwen3-coder-next',
      ANTHROPIC_DEFAULT_SONNET_MODEL: model,
      ANTHROPIC_DEFAULT_OPUS_MODEL: model,
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'qwen3-coder-next',
    };
  },
  getValidateUrl(regionId: string): string {
    return regionId === 'global'
      ? 'https://dashscope-intl.aliyuncs.com/apps/anthropic/v1/models'
      : 'https://dashscope.aliyuncs.com/apps/anthropic/v1/models';
  },
};
