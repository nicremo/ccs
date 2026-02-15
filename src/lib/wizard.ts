import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import terminalLink from 'terminal-link';
import { execSync } from 'node:child_process';
import { configManager } from './config.js';
import { i18n } from './i18n.js';
import { validateApiKey } from './api-validator.js';
import { claudeCodeManager } from '../managers/claude-code.js';
import { getAllProviders, getProvider } from '../providers/index.js';
import type { Provider } from '../providers/index.js';
import { logger } from '../utils/logger.js';

// Custom colors - a modern violet/pink gradient theme
const theme = {
  primary: chalk.hex('#A855F7'),      // Purple
  primaryBold: chalk.hex('#A855F7').bold,
  secondary: chalk.hex('#EC4899'),    // Pink
  accent: chalk.hex('#06B6D4'),       // Cyan
  success: chalk.hex('#10B981'),      // Green
  warning: chalk.hex('#F59E0B'),      // Amber
  error: chalk.hex('#EF4444'),        // Red
  dim: chalk.gray,
  light: chalk.white,
};

const BOX_WIDTH = 63;

function borderLine(l: string, r: string, fill: string, w: number): string {
  return l + fill.repeat(w - 2) + r;
}

function contentLine(text: string, l: string, r: string, w: number): string {
  const padding = w - 4 - text.length;
  const padLeft = Math.floor(padding / 2);
  const padRight = padding - padLeft;
  return l + ' ' + ' '.repeat(padLeft) + text + ' '.repeat(padRight) + ' ' + r;
}

export class Wizard {
  private static instance: Wizard;

  static getInstance(): Wizard {
    if (!Wizard.instance) Wizard.instance = new Wizard();
    return Wizard.instance;
  }

  private createBox(title: string): void {
    console.log(theme.primaryBold('\n' + borderLine('╔', '╗', '═', BOX_WIDTH)));
    console.log(theme.primaryBold(contentLine(title, '║', '║', BOX_WIDTH)));
    console.log(theme.primaryBold(borderLine('╚', '╝', '═', BOX_WIDTH)));
    console.log('');
  }

  private showHints(): void {
    console.log(
      chalk.gray('💡 ') +
        chalk.gray(i18n.t('wizard.hint_navigate')) +
        chalk.gray(' | ') +
        chalk.gray(i18n.t('wizard.hint_confirm')) +
        '\n',
    );
  }

  private async prompt<T>(questions: Parameters<typeof inquirer.prompt>[0]): Promise<T> {
    this.showHints();
    return inquirer.prompt(questions) as Promise<T>;
  }

  private printBanner(): void {
    const W = 65;
    // ASCII art banner
    const ascii = [
      ' _____                    _____                    _____          ',
      ' /\\    \\                  /\\    \\                  /\\    \\         ',
      '/::\\    \\                /::\\    \\                /::\\    \\        ',
      '/::::\\    \\              /::::\\    \\              /::::\\    \\       ',
      '/::::::\\    \\            /::::::\\    \\            /::::::\\    \\      ',
      '/:::/\\:::\\    \\          /:::/\\:::\\    \\          /:::/\\:::\\    \\     ',
      '/:::/  \\:::\\    \\        /:::/  \\:::\\    \\        /:::/__\\:::\\    \\    ',
      '/:::/    \\:::\\    \\      /:::/    \\:::\\    \\       \\:::\\   \\:::\\    \\   ',
      '/:::/    / \\:::\\    \\    /:::/    / \\:::\\    \\    __\\:::\\   \\:::\\    \\  ',
      '/:::/    /   \\:::\\    \\  /:::/    /   \\:::\\    \\  /\\   \\:::\\   \\:::\\    \\ ',
      '/:::/____/     \\:::\\____\\/:::/____/     \\:::\\____\\/::\\   \\:::\\   \\:::\\____\\',
      '\\:::\\    \\      \\::/    /\\:::\\    \\      \\::/    /\\:::\\   \\:::\\   \\::/    /',
      ' \\:::\\    \\      \\/____/  \\:::\\    \\      \\/____/  \\:::\\   \\:::\\   \\/____/ ',
      '  \\:::\\    \\               \\:::\\    \\               \\:::\\   \\:::\\    \\     ',
      '   \\:::\\    \\               \\:::\\    \\               \\:::\\   \\:::\\____\\    ',
      '    \\:::\\    \\               \\:::\\    \\               \\:::\\  /:::/    /    ',
      '     \\:::\\    \\               \\:::\\    \\               \\:::\\/:::/    /     ',
      '      \\:::\\    \\               \\:::\\    \\               \\::::::/    /      ',
      '       \\:::\\____\\               \\:::\\____\\               \\::::/    /       ',
      '        \\::/    /                \\::/    /                \\::/    /        ',
      '         \\/____/                  \\/____/                  \\/____/         ',
    ];
    const lines = [
      borderLine('╔', '╗', '═', W),
      contentLine('', '║', '║', W),
      ...ascii.map(a => contentLine(a, '║', '║', W)),
      contentLine('', '║', '║', W),
      contentLine('Claude Code Provider Switcher', '║', '║', W),
      contentLine(i18n.t('wizard.banner_subtitle'), '║', '║', W),
      borderLine('╚', '╝', '═', W),
    ];
    console.log(theme.primaryBold('\n' + lines.join('\n')));
  }

  private resetScreen(): void {
    console.clear();
    this.printBanner();
  }

  // ─── First-time setup ────────────────────────────────────────
  async runFirstTimeSetup(): Promise<void> {
    this.resetScreen();
    console.log(theme.primaryBold('\n' + i18n.t('wizard.welcome')));
    console.log(chalk.gray(i18n.t('wizard.privacy_note') + '\n'));

    await this.configLanguage();
    await this.configProvider();
    await this.configApiKey();
    await this.applyConfig();
  }

  // ─── Main menu ───────────────────────────────────────────────
  async showMainMenu(): Promise<void> {
    const cfg = configManager.get();
    i18n.loadFromConfig(cfg.lang);

    while (true) {
      this.resetScreen();
      this.createBox(i18n.t('wizard.main_menu_title'));

      // Show current status
      const provider = cfg.provider ? getProvider(cfg.provider) : undefined;
      console.log(
        chalk.gray('  ' + i18n.t('wizard.status_provider') + ': ') +
          (provider ? chalk.green(provider.name) : chalk.red(i18n.t('wizard.not_set'))),
      );
      console.log(
        chalk.gray('  ' + i18n.t('wizard.status_model') + ': ') +
          (cfg.model ? chalk.green(cfg.model) : chalk.red(i18n.t('wizard.not_set'))),
      );
      console.log(
        chalk.gray('  ' + i18n.t('wizard.status_api_key') + ': ') +
          (cfg.api_key
            ? chalk.gray(i18n.t('wizard.api_key_set') + ' (' + cfg.api_key.slice(0, 4) + '****)')
            : chalk.red(i18n.t('wizard.not_set'))),
      );

      // Show Claude Code status
      const detected = claudeCodeManager.detectCurrentConfig();
      console.log(
        chalk.gray('  ' + i18n.t('wizard.status_claude_code') + ': ') +
          (detected.provider
            ? chalk.green(i18n.t('wizard.status_active') + ' (' + detected.provider.name + ')')
            : chalk.gray(i18n.t('wizard.status_not_configured'))),
      );
      console.log('');

      const { action } = await this.prompt<{ action: string }>([
        {
          type: 'list',
          name: 'action',
          message: i18n.t('wizard.select_operation'),
          choices: [
            { name: '>   ' + i18n.t('wizard.menu_config_language'), value: 'lang' },
            { name: '>   ' + i18n.t('wizard.menu_select_provider'), value: 'provider' },
            { name: '>   ' + i18n.t('wizard.menu_config_api_key'), value: 'apikey' },
            { name: '>   ' + i18n.t('wizard.menu_apply_config'), value: 'apply' },
            { name: '>   ' + i18n.t('wizard.menu_unload_config'), value: 'unload' },
            { name: '>   ' + i18n.t('wizard.menu_backup_restore'), value: 'backup' },
            { name: '>   ' + i18n.t('wizard.menu_show_status'), value: 'status' },
            new inquirer.Separator(),
            { name: 'x   ' + i18n.t('wizard.menu_exit'), value: 'exit' },
          ],
        },
      ]);

      if (action === 'exit') {
        console.log(chalk.green('\n👋 ' + i18n.t('wizard.goodbye_message')));
        process.exit(0);
      }

      switch (action) {
        case 'lang':
          await this.configLanguage();
          break;
        case 'provider':
          await this.configProvider();
          break;
        case 'apikey':
          await this.configApiKey();
          break;
        case 'apply':
          await this.applyConfig();
          break;
        case 'unload':
          await this.unloadConfig();
          break;
        case 'backup':
          await this.showBackupRestore();
          break;
        case 'status':
          await this.showStatus();
          break;
      }
    }
  }

  // ─── Language ────────────────────────────────────────────────
  async configLanguage(): Promise<void> {
    this.resetScreen();
    this.createBox(i18n.t('wizard.select_language'));

    const current = i18n.getLocale();
    const { language } = await this.prompt<{ language: string }>([
      {
        type: 'list',
        name: 'language',
        message: '✨ ' + i18n.t('wizard.select_language'),
        choices: [
          {
            name: '[EN] English' + (current === 'en_US' ? chalk.green(' ✓') : ''),
            value: 'en_US',
          },
          {
            name: '[DE] Deutsch' + (current === 'de_DE' ? chalk.green(' ✓') : ''),
            value: 'de_DE',
          },
          {
            name: '[CN] 中文' + (current === 'zh_CN' ? chalk.green(' ✓') : ''),
            value: 'zh_CN',
          },
          new inquirer.Separator(),
          { name: '<-  ' + i18n.t('wizard.nav_return'), value: 'back' },
        ],
      },
    ]);

    if (language === 'back') return;
    configManager.setLang(language);
    i18n.setLocale(language);
  }

  // ─── Provider + Region + Model ───────────────────────────────
  async configProvider(): Promise<void> {
    this.resetScreen();
    this.createBox(i18n.t('wizard.select_provider'));

    const providers = getAllProviders();
    const currentId = configManager.get().provider;

    const { providerId } = await this.prompt<{ providerId: string }>([
      {
        type: 'list',
        name: 'providerId',
        message: '🌟 ' + i18n.t('wizard.select_provider'),
        choices: [
          ...providers.map(p => ({
            name:
              '>   ' + p.name + chalk.gray(' - ' + p.description) + (p.id === currentId ? chalk.green(' ✓') : ''),
            value: p.id,
          })),
          new inquirer.Separator(),
          { name: '<-  ' + i18n.t('wizard.nav_return'), value: 'back' },
        ],
      },
    ]);

    if (providerId === 'back') return;

    const provider = getProvider(providerId)!;

    // Region selection
    let regionId: string;
    if (provider.regions.length === 1) {
      regionId = provider.regions[0].id;
      console.log(chalk.gray('\n  ' + i18n.t('wizard.provider_single_region') + ' → ' + provider.regions[0].name));
    } else {
      this.resetScreen();
      this.createBox(i18n.t('wizard.select_region'));

      const result = await this.prompt<{ regionId: string }>([
        {
          type: 'list',
          name: 'regionId',
          message: '🌍 ' + i18n.t('wizard.select_region'),
          choices: [
            ...provider.regions.map(r => ({
              name: '>   ' + r.name + chalk.gray(' (' + r.baseUrl + ')'),
              value: r.id,
            })),
            new inquirer.Separator(),
            { name: '<-  ' + i18n.t('wizard.nav_return'), value: 'back' },
          ],
        },
      ]);
      if (result.regionId === 'back') return;
      regionId = result.regionId;
    }

    // Model selection
    let modelId: string;
    if (provider.models.length === 1) {
      modelId = provider.models[0].id;
    } else {
      this.resetScreen();
      this.createBox(i18n.t('wizard.select_model'));

      const defaultModel = provider.models.find(m => m.default) || provider.models[0];
      const result = await this.prompt<{ modelId: string }>([
        {
          type: 'list',
          name: 'modelId',
          message: '🤖 ' + i18n.t('wizard.select_model'),
          choices: [
            ...provider.models.map(m => ({
              name:
                '>   ' +
                m.name +
                (m.thinking ? chalk.yellow(' [thinking]') : '') +
                (m.default ? chalk.green(' (recommended)') : ''),
              value: m.id,
            })),
            new inquirer.Separator(),
            { name: '<-  ' + i18n.t('wizard.nav_return'), value: 'back' },
          ],
          default: defaultModel.id,
        },
      ]);
      if (result.modelId === 'back') return;
      modelId = result.modelId;
    }

    configManager.update({ provider: providerId, region: regionId, model: modelId });
  }

  // ─── API Key ─────────────────────────────────────────────────
  async configApiKey(): Promise<void> {
    const cfg = configManager.get();
    if (!cfg.provider) {
      console.log(chalk.yellow('\n⚠️  ' + i18n.t('wizard.missing_config')));
      await this.sleep(1500);
      return;
    }

    const provider = getProvider(cfg.provider)!;
    const region = provider.regions.find(r => r.id === cfg.region) || provider.regions[0];

    this.resetScreen();
    this.createBox(i18n.t('wizard.config_api_key'));

    if (cfg.api_key) {
      console.log(
        chalk.gray('  ' + i18n.t('wizard.config_api_key') + ': ') +
          chalk.gray(i18n.t('wizard.api_key_set') + ' (' + cfg.api_key.slice(0, 4) + '****)'),
      );
      console.log('');
    }

    const clickable = terminalLink(region.apiKeyUrl, region.apiKeyUrl, { fallback: () => region.apiKeyUrl });
    console.log(chalk.blue('💡 ' + i18n.t('wizard.api_key_get_hint', { url: clickable })));
    console.log('');

    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        mask: '●',
        message: i18n.t('wizard.input_your_api_key'),
        validate: (input: string) => (input.trim().length > 0 ? true : i18n.t('wizard.api_key_required')),
      },
    ]);

    const spinner = ora({ text: i18n.t('wizard.validating_api_key'), spinner: 'star2' }).start();
    const result = await validateApiKey(apiKey.trim(), provider, cfg.region || 'global');
    await this.sleep(600);

    if (!result.valid) {
      if (result.error === 'invalid_api_key') {
        spinner.fail(chalk.red(i18n.t('wizard.api_key_invalid')));
        await this.sleep(1500);
        return;
      }
      // Network error - save anyway
      spinner.warn(chalk.yellow(i18n.t('wizard.api_key_network_error')));
    } else {
      spinner.succeed('✅ ' + i18n.t('wizard.set_success'));
    }

    configManager.update({ api_key: apiKey.trim() });
    await this.sleep(600);
  }

  // ─── Apply config to Claude Code ─────────────────────────────
  async applyConfig(): Promise<void> {
    const cfg = configManager.get();

    if (!cfg.provider || !cfg.api_key || !cfg.region || !cfg.model) {
      console.log(chalk.yellow('\n⚠️  ' + i18n.t('wizard.missing_config')));
      await this.sleep(1500);
      return;
    }

    const provider = getProvider(cfg.provider)!;

    const spinner = ora({ text: i18n.t('wizard.applying_config'), spinner: 'star2' }).start();
    try {
      claudeCodeManager.loadProviderConfig(provider, cfg.region, cfg.model, cfg.api_key);
      await this.sleep(800);
      spinner.succeed(chalk.green(i18n.t('wizard.config_applied')));
    } catch (error) {
      logger.logError('Wizard.applyConfig', error);
      spinner.fail(chalk.red(i18n.t('wizard.config_apply_failed')));
    }
    await this.sleep(1000);

    // Offer to launch Claude Code
    await this.offerLaunch();
  }

  // ─── Unload config ───────────────────────────────────────────
  async unloadConfig(): Promise<void> {
    const { confirm } = await this.prompt<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: i18n.t('wizard.confirm_remove'),
        default: false,
      },
    ]);

    if (!confirm) return;

    const spinner = ora({ text: i18n.t('wizard.removing_config'), spinner: 'star2' }).start();
    try {
      claudeCodeManager.unloadProviderConfig();
      await this.sleep(800);
      spinner.succeed(chalk.green(i18n.t('wizard.config_removed')));
    } catch (error) {
      logger.logError('Wizard.unloadConfig', error);
      spinner.fail(chalk.red(i18n.t('wizard.config_remove_failed')));
    }
    await this.sleep(1000);
  }

  // ─── Show status ─────────────────────────────────────────────
  async showStatus(): Promise<void> {
    this.resetScreen();
    this.createBox(i18n.t('wizard.status_title'));

    const cfg = configManager.get();
    const provider = cfg.provider ? getProvider(cfg.provider) : undefined;

    console.log(theme.primaryBold('  Local Config (~/.ccs):'));
    console.log(
      chalk.gray('    ' + i18n.t('wizard.status_provider') + ': ') +
        (provider ? chalk.green(provider.name) : chalk.red(i18n.t('wizard.not_set'))),
    );
    console.log(
      chalk.gray('    ' + i18n.t('wizard.status_region') + ': ') +
        (cfg.region ? chalk.green(cfg.region) : chalk.red(i18n.t('wizard.not_set'))),
    );
    console.log(
      chalk.gray('    ' + i18n.t('wizard.status_model') + ': ') +
        (cfg.model ? chalk.green(cfg.model) : chalk.red(i18n.t('wizard.not_set'))),
    );
    console.log(
      chalk.gray('    ' + i18n.t('wizard.status_api_key') + ': ') +
        (cfg.api_key ? chalk.gray(cfg.api_key.slice(0, 4) + '****') : chalk.red(i18n.t('wizard.not_set'))),
    );

    console.log('');
    console.log(theme.warning.bold('  Claude Code (~/.claude/settings.json):'));
    const detected = claudeCodeManager.detectCurrentConfig();
    if (detected.provider) {
      console.log(chalk.gray('    ' + i18n.t('wizard.status_provider') + ': ') + chalk.green(detected.provider.name));
      console.log(chalk.gray('    ' + i18n.t('wizard.status_region') + ': ') + chalk.green(detected.regionId || '?'));
      console.log(chalk.gray('    Base URL: ') + chalk.white(detected.baseUrl || ''));
      console.log(
        chalk.gray('    ' + i18n.t('wizard.status_model') + ': ') + chalk.green(detected.model || 'default'),
      );
      console.log(
        chalk.gray('    ' + i18n.t('wizard.status_api_key') + ': ') +
          chalk.gray(detected.apiKey ? detected.apiKey.slice(0, 4) + '****' : 'N/A'),
      );
    } else {
      console.log(chalk.gray('    ' + i18n.t('wizard.status_not_configured')));
    }

    console.log('');
    await this.prompt<{ action: string }>([
      {
        type: 'list',
        name: 'action',
        message: '',
        choices: [{ name: '<-  ' + i18n.t('wizard.nav_return'), value: 'back' }],
      },
    ]);
  }

  // ─── Backup & Restore ─────────────────────────────────────
  async showBackupRestore(): Promise<void> {
    while (true) {
      this.resetScreen();
      this.createBox(i18n.t('wizard.backup_title'));

      const backups = claudeCodeManager.listBackups();
      if (backups.length > 0) {
        console.log(chalk.gray('  ' + i18n.t('wizard.backup_count', { count: String(backups.length) })));
        console.log('');
      } else {
        console.log(chalk.gray('  ' + i18n.t('wizard.no_backups')));
        console.log('');
      }

      const choices: Array<{ name: string; value: string } | InstanceType<typeof inquirer.Separator>> = [
        { name: '>   ' + i18n.t('wizard.backup_create'), value: 'create' },
      ];

      if (backups.length > 0) {
        choices.push({ name: '>   ' + i18n.t('wizard.backup_restore'), value: 'restore' });
      }

      choices.push(
        { name: '>   ' + i18n.t('wizard.backup_reset'), value: 'reset' },
        new inquirer.Separator(),
        { name: '<-  ' + i18n.t('wizard.nav_return'), value: 'back' },
      );

      const { action } = await this.prompt<{ action: string }>([
        { type: 'list', name: 'action', message: i18n.t('wizard.select_action'), choices },
      ]);

      if (action === 'back') return;

      if (action === 'create') {
        const spinner = ora({ text: i18n.t('wizard.backup_creating'), spinner: 'star2' }).start();
        const path = claudeCodeManager.createBackup();
        await this.sleep(500);
        spinner.succeed(chalk.green(i18n.t('wizard.backup_created', { path })));
        await this.sleep(1500);
      }

      if (action === 'restore') {
        const latestBackups = backups.slice(0, 10);
        const { selected } = await this.prompt<{ selected: string }>([
          {
            type: 'list',
            name: 'selected',
            message: i18n.t('wizard.backup_select'),
            choices: [
              ...latestBackups.map(b => ({
                name: '  ' + b.date.toLocaleString() + chalk.gray(' (' + b.name + ')'),
                value: b.path,
              })),
              new inquirer.Separator(),
              { name: '<-  ' + i18n.t('wizard.nav_return'), value: 'back' },
            ],
          },
        ]);

        if (selected !== 'back') {
          const spinner = ora({ text: i18n.t('wizard.backup_restoring'), spinner: 'star2' }).start();
          try {
            claudeCodeManager.restoreBackup(selected);
            await this.sleep(500);
            spinner.succeed(chalk.green(i18n.t('wizard.backup_restored')));
          } catch (error) {
            logger.logError('Wizard.showBackupRestore', error);
            spinner.fail(chalk.red(i18n.t('wizard.backup_restore_failed')));
          }
          await this.sleep(1500);
        }
      }

      if (action === 'reset') {
        const { confirm } = await this.prompt<{ confirm: boolean }>([
          {
            type: 'confirm',
            name: 'confirm',
            message: i18n.t('wizard.backup_reset_confirm'),
            default: false,
          },
        ]);

        if (confirm) {
          const spinner = ora({ text: i18n.t('wizard.removing_config'), spinner: 'star2' }).start();
          claudeCodeManager.unloadProviderConfig();
          await this.sleep(500);
          spinner.succeed(chalk.green(i18n.t('wizard.backup_reset_done')));
          await this.sleep(1000);
        }
      }
    }
  }

  // ─── Offer to launch Claude Code ─────────────────────────────
  private async offerLaunch(): Promise<void> {
    try {
      execSync(process.platform === 'win32' ? 'where claude' : 'which claude', { stdio: 'pipe' });
    } catch {
      return; // Claude Code not installed
    }

    const { launch } = await this.prompt<{ launch: boolean }>([
      {
        type: 'confirm',
        name: 'launch',
        message: i18n.t('wizard.launch_claude'),
        default: false,
      },
    ]);

    if (!launch) return;

    console.log(chalk.gray('\n$ claude\n'));
    try {
      execSync('claude', { stdio: 'inherit' });
    } catch (error) {
      logger.logError('Wizard.offerLaunch', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const wizard = Wizard.getInstance();
