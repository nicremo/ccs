import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

type TranslationMap = Record<string, unknown>;

class I18n {
  private static instance: I18n;
  private currentLocale = 'en_US';
  private translations = new Map<string, TranslationMap>();
  private fallbackLocale = 'en_US';

  private constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const localesDir = join(__dirname, '..', 'locales');
    this.loadAll(localesDir);
    this.detectLocale();
  }

  static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
  }

  private loadAll(dir: string): void {
    if (!existsSync(dir)) return;
    for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
      try {
        const locale = file.replace('.json', '');
        const content = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
        this.translations.set(locale, content);
      } catch {
        // Skip broken locale files
      }
    }
  }

  private detectLocale(): void {
    const envLocale = process.env.LANG || process.env.LC_ALL || '';
    const code = envLocale.split('.')[0];
    if (this.translations.has(code)) {
      this.currentLocale = code;
      return;
    }
    const lang = code.split('_')[0];
    if (lang === 'de') this.currentLocale = 'de_DE';
    else if (lang === 'zh') this.currentLocale = 'zh_CN';
    else this.currentLocale = 'en_US';
  }

  setLocale(locale: string): void {
    if (this.translations.has(locale)) {
      this.currentLocale = locale;
    }
  }

  getLocale(): string {
    return this.currentLocale;
  }

  getAvailableLocales(): string[] {
    return Array.from(this.translations.keys());
  }

  t(key: string, params?: Record<string, string>): string {
    const result = this.resolve(key, this.currentLocale) ?? this.resolve(key, this.fallbackLocale) ?? key;
    if (!params) return result;
    return result.replace(/\{\{(\w+)\}\}/g, (match, param) => params[param] ?? match);
  }

  private resolve(key: string, locale: string): string | undefined {
    let obj: unknown = this.translations.get(locale);
    for (const part of key.split('.')) {
      if (obj && typeof obj === 'object' && part in (obj as Record<string, unknown>)) {
        obj = (obj as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return typeof obj === 'string' ? obj : undefined;
  }

  loadFromConfig(locale: string): void {
    this.setLocale(locale);
  }
}

export const i18n = I18n.getInstance();
