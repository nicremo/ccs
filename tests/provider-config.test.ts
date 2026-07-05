import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildValidationHeaders } from '../src/lib/api-validator.js';
import { getProvider } from '../src/providers/index.js';

test('providers expose current coding defaults', () => {
  assert.equal(getProvider('minimax')?.models.find(model => model.default)?.id, 'MiniMax-M3[1m]');
  assert.equal(getProvider('kimi')?.models.find(model => model.default)?.id, 'kimi-k2.7-code');
  assert.equal(getProvider('zhipu')?.models.find(model => model.default)?.id, 'GLM-4.7');
  assert.equal(getProvider('deepseek')?.models.find(model => model.default)?.id, 'deepseek-v4-pro[1m]');
  assert.equal(getProvider('qwen')?.models.find(model => model.default)?.id, 'qwen3.7-plus');
});

test('providers expose latest fallback and high speed models', () => {
  assert.ok(getProvider('deepseek')?.models.some(model => model.id === 'deepseek-v4-flash[1m]'));
  assert.ok(getProvider('qwen')?.models.some(model => model.id === 'qwen3.6-flash'));
  assert.ok(getProvider('qwen')?.models.some(model => model.id === 'qwen3-coder-plus'));
  assert.ok(getProvider('kimi')?.models.some(model => model.id === 'kimi-k2.6'));
  assert.ok(getProvider('minimax')?.models.some(model => model.id === 'MiniMax-M2.7-highspeed'));
});

test('validation headers match provider model list APIs', () => {
  assert.deepEqual(buildValidationHeaders('sk-test', getProvider('minimax')!), {
    'X-Api-Key': 'sk-test',
    'Content-Type': 'application/json',
  });

  assert.deepEqual(buildValidationHeaders('sk-test', getProvider('deepseek')!), {
    'x-api-key': 'sk-test',
    'Content-Type': 'application/json',
  });

  assert.deepEqual(buildValidationHeaders('sk-test', getProvider('kimi')!), {
    Authorization: 'Bearer sk-test',
    'Content-Type': 'application/json',
  });
});

test('qwen exposes current coding and token plan Anthropic endpoints', () => {
  const qwen = getProvider('qwen');
  assert.ok(qwen?.regions.some(region => region.baseUrl === 'https://coding.dashscope.aliyuncs.com/apps/anthropic'));
  assert.ok(qwen?.regions.some(region => region.baseUrl === 'https://coding-intl.dashscope.aliyuncs.com/apps/anthropic'));
  assert.ok(qwen?.regions.some(region => region.baseUrl === 'https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic'));
});
