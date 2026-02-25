import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import type { Provider } from '../providers/index.js';
import { detectProviderByBaseUrl } from '../providers/index.js';

interface ClaudeSettings {
  env?: Record<string, string | number>;
  [key: string]: unknown;
}

interface ClaudeConfig {
  hasCompletedOnboarding?: boolean;
  mcpServers?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BackupEntry {
  path: string;
  name: string;
  date: Date;
}

// All env keys we manage
const MANAGED_ENV_KEYS = [
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_BASE_URL',
  'API_TIMEOUT_MS',
  'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC',
  'ANTHROPIC_MODEL',
  'ANTHROPIC_SMALL_FAST_MODEL',
  'ANTHROPIC_DEFAULT_SONNET_MODEL',
  'ANTHROPIC_DEFAULT_OPUS_MODEL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL',
  'CLAUDE_CODE_SUBAGENT_MODEL',
];

export class ClaudeCodeManager {
  private static instance: ClaudeCodeManager;
  private settingsPath: string;
  private configPath: string;
  private backupDir: string;

  private constructor() {
    this.settingsPath = join(homedir(), '.claude', 'settings.json');
    this.configPath = join(homedir(), '.claude.json');
    this.backupDir = join(homedir(), '.ccs', 'backups');
  }

  static getInstance(): ClaudeCodeManager {
    if (!ClaudeCodeManager.instance) {
      ClaudeCodeManager.instance = new ClaudeCodeManager();
    }
    return ClaudeCodeManager.instance;
  }

  private ensureDir(filePath: string): void {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  getSettings(): ClaudeSettings {
    try {
      if (existsSync(this.settingsPath)) {
        return JSON.parse(readFileSync(this.settingsPath, 'utf-8'));
      }
    } catch {
      // Settings file corrupted or unreadable
    }
    return {};
  }

  saveSettings(settings: ClaudeSettings): void {
    this.ensureDir(this.settingsPath);
    writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
  }

  private getConfig(): ClaudeConfig {
    try {
      if (existsSync(this.configPath)) {
        return JSON.parse(readFileSync(this.configPath, 'utf-8'));
      }
    } catch {
      // Config file corrupted or unreadable
    }
    return {};
  }

  private saveConfig(config: ClaudeConfig): void {
    this.ensureDir(this.configPath);
    writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  // ─── Backup & Restore ──────────────────────────────────────

  createBackup(): string {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(this.backupDir, `settings-${timestamp}.json`);

    if (existsSync(this.settingsPath)) {
      copyFileSync(this.settingsPath, backupPath);
    } else {
      writeFileSync(backupPath, '{}', 'utf-8');
    }

    return backupPath;
  }

  listBackups(): BackupEntry[] {
    if (!existsSync(this.backupDir)) return [];

    try {
      return readdirSync(this.backupDir)
        .filter(f => f.startsWith('settings-') && f.endsWith('.json'))
        .sort()
        .reverse()
        .map(f => {
          // Parse date from filename: settings-2026-02-15T14-30-00-000Z.json
          const dateStr = f.replace('settings-', '').replace('.json', '').replace(/-/g, (m, i) => {
            // Restore ISO format: first 10 chars use -, then T, then : for time
            return m;
          });
          return {
            path: join(this.backupDir, f),
            name: f,
            date: new Date(f.replace('settings-', '').replace('.json', '')
              .replace(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/, '$1-$2-$3T$4:$5:$6')),
          };
        });
    } catch {
      return [];
    }
  }

  restoreBackup(backupPath: string): void {
    if (!existsSync(backupPath)) {
      throw new Error('Backup file not found: ' + backupPath);
    }
    // Validate it's valid JSON
    JSON.parse(readFileSync(backupPath, 'utf-8'));
    this.ensureDir(this.settingsPath);
    copyFileSync(backupPath, this.settingsPath);
  }

  // ─── Onboarding ───────────────────────────────────────────

  ensureOnboarding(): void {
    const config = this.getConfig();
    if (!config.hasCompletedOnboarding) {
      this.saveConfig({ ...config, hasCompletedOnboarding: true });
    }
  }

  // ─── Provider Config ──────────────────────────────────────

  loadProviderConfig(
    provider: Provider,
    regionId: string,
    modelId: string,
    apiKey: string,
  ): void {
    // Auto-backup before modifying
    this.createBackup();
    this.ensureOnboarding();

    const region = provider.regions.find(r => r.id === regionId);
    if (!region) throw new Error(`Unknown region: ${regionId}`);

    const settings = this.getSettings();
    const existingEnv = settings.env || {};

    // Remove all managed keys first
    const cleanedEnv: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(existingEnv)) {
      if (!MANAGED_ENV_KEYS.includes(key)) {
        cleanedEnv[key] = value;
      }
    }

    // Set base config
    const newEnv: Record<string, string | number> = {
      ...cleanedEnv,
      ANTHROPIC_AUTH_TOKEN: apiKey,
      ANTHROPIC_BASE_URL: region.baseUrl,
      API_TIMEOUT_MS: '3000000',
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: 1,
    };

    // Add provider-specific overrides
    const overrides = provider.getEnvOverrides(modelId);
    for (const [key, value] of Object.entries(overrides)) {
      newEnv[key] = value;
    }

    // Also set the model property in settings.json (this is different from ANTHROPIC_MODEL env var)
    // Map model ID to display name for the model setting
    const modelSetting = this.mapModelToSetting(modelId, provider.id);

    this.saveSettings({
      ...settings,
      env: newEnv,
      model: modelSetting,
    });
  }

  private mapModelToSetting(modelId: string, providerId: string): string {
    // Map provider-specific model IDs to Claude Code model settings
    if (providerId === 'claude') {
      // For official Anthropic API, use the model ID directly or map to shorthand
      if (modelId.includes('opus')) return 'opus';
      if (modelId.includes('sonnet')) return 'sonnet';
      if (modelId.includes('haiku')) return 'haiku';
      return modelId;
    }
    // For third-party providers, use the model ID as-is
    return modelId;
  }

  unloadProviderConfig(): void {
    // Auto-backup before modifying
    this.createBackup();

    const settings = this.getSettings();
    if (!settings.env && !settings.model) return;

    // Clean environment variables
    const cleanedEnv: Record<string, string | number> = {};
    if (settings.env) {
      for (const [key, value] of Object.entries(settings.env)) {
        if (!MANAGED_ENV_KEYS.includes(key)) {
          cleanedEnv[key] = value;
        }
      }
    }

    const newSettings: ClaudeSettings = {};
    if (Object.keys(cleanedEnv).length > 0) {
      newSettings.env = cleanedEnv;
    }
    // Remove the model property to use Claude Code default
    // (settings.model is set in settings.json and determines the default model)

    this.saveSettings(newSettings);
  }

  detectCurrentConfig(): {
    provider: Provider | undefined;
    regionId: string | undefined;
    apiKey: string | undefined;
    baseUrl: string | undefined;
    model: string | undefined;
  } {
    const settings = this.getSettings();
    const env = settings.env || {};

    const baseUrl = env.ANTHROPIC_BASE_URL as string | undefined;
    const apiKey = env.ANTHROPIC_AUTH_TOKEN as string | undefined;
    const model = env.ANTHROPIC_MODEL as string | undefined;

    if (!baseUrl || !apiKey) {
      return { provider: undefined, regionId: undefined, apiKey: undefined, baseUrl: undefined, model: undefined };
    }

    const provider = detectProviderByBaseUrl(baseUrl);
    let regionId: string | undefined;

    if (provider) {
      const region = provider.regions.find(r => r.baseUrl === baseUrl);
      regionId = region?.id;
    }

    return { provider, regionId, apiKey, baseUrl, model };
  }
}

export const claudeCodeManager = ClaudeCodeManager.getInstance();
