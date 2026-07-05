import type { Provider } from './index.js';

export const qwenProvider: Provider = {
  id: 'qwen',
  name: 'Qwen / DashScope',
  description: 'Alibaba Qwen Coding and Token Plan Models',
  regions: [
    {
      id: 'coding-cn',
      name: 'Coding Plan China',
      baseUrl: 'https://coding.dashscope.aliyuncs.com/apps/anthropic',
      apiKeyUrl: 'https://bailian.console.aliyun.com/',
    },
    {
      id: 'coding-intl',
      name: 'Coding Plan International',
      baseUrl: 'https://coding-intl.dashscope.aliyuncs.com/apps/anthropic',
      apiKeyUrl: 'https://dashscope-intl.console.aliyun.com/apiKey',
    },
    {
      id: 'token-plan-cn',
      name: 'Token Plan China',
      baseUrl: 'https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic',
      apiKeyUrl: 'https://bailian.console.aliyun.com/',
    },
    {
      id: 'payg-cn',
      name: 'Pay-as-you-go China',
      baseUrl: 'https://dashscope.aliyuncs.com/apps/anthropic',
      apiKeyUrl: 'https://dashscope.console.aliyun.com/apiKey',
    },
  ],
  models: [
    {
      id: 'qwen3.7-plus',
      name: 'Qwen 3.7 Plus',
      default: true,
      thinking: true,
    },
    {
      id: 'qwen3.6-plus',
      name: 'Qwen 3.6 Plus',
      thinking: true,
    },
    {
      id: 'qwen3.7-max',
      name: 'Qwen 3.7 Max',
      thinking: true,
    },
    {
      id: 'qwen3.6-flash',
      name: 'Qwen 3.6 Flash',
      thinking: true,
    },
    {
      id: 'qwen3.5-plus',
      name: 'Qwen 3.5 Plus',
      thinking: true,
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
      id: 'qwen3-max-2026-01-23',
      name: 'Qwen 3 Max 2026-01-23',
      thinking: true,
    },
  ],
  getEnvOverrides(model: string): Record<string, string> {
    return {
      ANTHROPIC_MODEL: model,
      ANTHROPIC_SMALL_FAST_MODEL: model.startsWith('qwen3.') ? 'qwen3.6-flash' : 'qwen3-coder-next',
      ANTHROPIC_DEFAULT_SONNET_MODEL: model,
      ANTHROPIC_DEFAULT_OPUS_MODEL: model,
      ANTHROPIC_DEFAULT_HAIKU_MODEL: model.startsWith('qwen3.') ? 'qwen3.6-flash' : 'qwen3-coder-next',
    };
  },
  getValidateUrl(regionId: string): string {
    if (regionId === 'coding-intl') {
      return 'https://coding-intl.dashscope.aliyuncs.com/apps/anthropic/v1/models';
    }
    if (regionId === 'token-plan-cn') {
      return 'https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic/v1/models';
    }
    if (regionId === 'payg-cn') {
      return 'https://dashscope.aliyuncs.com/apps/anthropic/v1/models';
    }
    return 'https://coding.dashscope.aliyuncs.com/apps/anthropic/v1/models';
  },
};
