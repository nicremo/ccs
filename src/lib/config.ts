import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import * as yaml from 'js-yaml';
import { logger } from '../utils/logger.js';

export interface AppConfig {
  lang: string;
  provider?: string;
  region?: string;
  model?: string;
  api_key?: string;
}

const CONFIG_DIR = join(homedir(), '.cchelper');
const CONFIG_PATH = join(CONFIG_DIR, 'config.yaml');

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.load();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private load(): AppConfig {
    try {
      if (existsSync(CONFIG_PATH)) {
        const content = readFileSync(CONFIG_PATH, 'utf-8');
        const parsed = yaml.load(content) as AppConfig | null;
        return parsed || { lang: 'en_US' };
      }
    } catch (error) {
      logger.logError('ConfigManager.load', error);
    }
    return { lang: 'en_US' };
  }

  private save(): void {
    try {
      if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
      }
      writeFileSync(CONFIG_PATH, yaml.dump(this.config), 'utf-8');
    } catch (error) {
      logger.logError('ConfigManager.save', error);
      throw error;
    }
  }

  get(): AppConfig {
    return { ...this.config };
  }

  update(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.save();
  }

  isFirstRun(): boolean {
    return !existsSync(CONFIG_PATH);
  }

  getLang(): string {
    return this.config.lang || 'en_US';
  }

  setLang(lang: string): void {
    this.update({ lang });
  }
}

export const configManager = ConfigManager.getInstance();
