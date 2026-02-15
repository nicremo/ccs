#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configManager } from './lib/config.js';
import { i18n } from './lib/i18n.js';
import { wizard } from './lib/wizard.js';
import { claudeCodeManager } from './managers/claude-code.js';
import { getProvider, getAllProviders } from './providers/index.js';
import { validateApiKey } from './lib/api-validator.js';
import { logger } from './utils/logger.js';
import { execSync } from 'node:child_process';

function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return '1.0.0';
  }
}

function setupProgram(): Command {
  const lang = configManager.getLang();
  i18n.loadFromConfig(lang);

  const program = new Command();

  program
    .name('ccs')
    .description(i18n.t('cli.title'))
    .version(getVersion(), '-v, --version', i18n.t('commands.version'))
    .helpOption('-h, --help', i18n.t('commands.help'));

  // Default action: wizard
  program.action(async () => {
    if (configManager.isFirstRun()) {
      await wizard.runFirstTimeSetup();
    } else {
      await wizard.showMainMenu();
    }
  });

  // init - re-run wizard
  program
    .command('init')
    .description(i18n.t('commands.init'))
    .action(async () => {
      await wizard.runFirstTimeSetup();
    });

  // provider - switch provider interactively
  program
    .command('provider')
    .description(i18n.t('commands.provider'))
    .action(async () => {
      await wizard.configProvider();
    });

  // auth - manage API key
  program
    .command('auth')
    .description(i18n.t('commands.auth'))
    .argument('[action]', 'revoke')
    .action(async (action?: string) => {
      if (action === 'revoke') {
        configManager.update({ api_key: undefined });
        console.log(chalk.green('API key revoked.'));
        return;
      }
      await wizard.configApiKey();
    });

  // apply - apply config to Claude Code
  program
    .command('apply')
    .description(i18n.t('commands.apply'))
    .action(async () => {
      await wizard.applyConfig();
    });

  // unload - remove config from Claude Code
  program
    .command('unload')
    .description(i18n.t('commands.unload'))
    .action(async () => {
      const spinner = ora(i18n.t('wizard.removing_config')).start();
      try {
        claudeCodeManager.unloadProviderConfig();
        spinner.succeed(chalk.green(i18n.t('wizard.config_removed')));
      } catch (error) {
        logger.logError('CLI.unload', error);
        spinner.fail(chalk.red(i18n.t('wizard.config_remove_failed')));
      }
    });

  // status - show current config
  program
    .command('status')
    .description(i18n.t('commands.status'))
    .action(() => {
      const cfg = configManager.get();
      const provider = cfg.provider ? getProvider(cfg.provider) : undefined;
      const detected = claudeCodeManager.detectCurrentConfig();

      console.log(chalk.cyan.bold('\n  Local Config:'));
      console.log('    Provider: ' + (provider ? chalk.green(provider.name) : chalk.red('Not set')));
      console.log('    Region:   ' + (cfg.region ? chalk.green(cfg.region) : chalk.red('Not set')));
      console.log('    Model:    ' + (cfg.model ? chalk.green(cfg.model) : chalk.red('Not set')));
      console.log('    API Key:  ' + (cfg.api_key ? chalk.gray(cfg.api_key.slice(0, 4) + '****') : chalk.red('Not set')));

      console.log(chalk.yellow.bold('\n  Claude Code:'));
      if (detected.provider) {
        console.log('    Provider: ' + chalk.green(detected.provider.name));
        console.log('    Base URL: ' + chalk.white(detected.baseUrl || ''));
        console.log('    Model:    ' + chalk.green(detected.model || 'default'));
      } else {
        console.log('    ' + chalk.gray('Not configured'));
      }
      console.log('');
    });

  // doctor - health check
  program
    .command('doctor')
    .description(i18n.t('commands.doctor'))
    .action(async () => {
      console.log(chalk.cyan.bold('\n  ' + i18n.t('doctor.title') + '\n'));

      const checks: { label: string; ok: boolean; detail?: string }[] = [];

      // Node version
      checks.push({
        label: i18n.t('doctor.node_version'),
        ok: true,
        detail: process.version,
      });

      // Claude Code installed
      let claudeInstalled = false;
      try {
        execSync(process.platform === 'win32' ? 'where claude' : 'which claude', { stdio: 'pipe' });
        claudeInstalled = true;
      } catch {
        // not installed
      }
      checks.push({ label: i18n.t('doctor.claude_installed'), ok: claudeInstalled });

      // Config exists
      checks.push({ label: i18n.t('doctor.config_exists'), ok: !configManager.isFirstRun() });

      // Provider configured
      const cfg = configManager.get();
      checks.push({ label: i18n.t('doctor.provider_configured'), ok: !!cfg.provider });

      // API key set
      checks.push({ label: i18n.t('doctor.api_key_set'), ok: !!cfg.api_key });

      // API key valid
      if (cfg.provider && cfg.api_key && cfg.region) {
        const provider = getProvider(cfg.provider);
        if (provider) {
          const result = await validateApiKey(cfg.api_key, provider, cfg.region);
          checks.push({
            label: i18n.t('doctor.api_key_valid'),
            ok: result.valid,
            detail: result.valid ? undefined : result.message,
          });
        }
      }

      for (const check of checks) {
        const icon = check.ok ? chalk.green('✓') : chalk.red('✗');
        const detail = check.detail ? chalk.gray(' (' + check.detail + ')') : '';
        console.log('  ' + icon + '  ' + check.label + detail);
      }

      const allGood = checks.every(c => c.ok);
      console.log(
        allGood
          ? chalk.green('\n  ' + i18n.t('doctor.all_good'))
          : chalk.yellow('\n  ' + i18n.t('doctor.issues_found')),
      );
      console.log('');
    });

  // lang - change language
  const langCmd = program.command('lang').description(i18n.t('commands.lang'));

  langCmd
    .command('set <locale>')
    .description('Set language (en_US, de_DE, zh_CN)')
    .action((locale: string) => {
      const available = i18n.getAvailableLocales();
      if (!available.includes(locale)) {
        console.log(chalk.red('Unknown locale: ' + locale));
        console.log('Available: ' + available.join(', '));
        return;
      }
      configManager.setLang(locale);
      i18n.setLocale(locale);
      console.log(chalk.green('Language set to: ' + locale));
    });

  langCmd
    .command('show')
    .description('Show current language')
    .action(() => {
      console.log('Current: ' + i18n.getLocale());
      console.log('Available: ' + i18n.getAvailableLocales().join(', '));
    });

  // Help text
  program.addHelpText(
    'after',
    `
${chalk.bold(i18n.t('cli.examples'))}:
  ${chalk.gray('$ ccs                         # Interactive wizard')}
  ${chalk.gray('$ ccs init                   # Re-run setup')}
  ${chalk.gray('$ ccs provider               # Switch provider')}
  ${chalk.gray('$ ccs auth                 # Configure API key')}
  ${chalk.gray('$ ccs auth revoke          # Remove API key')}
  ${chalk.gray('$ ccs apply                # Apply to Claude Code')}
  ${chalk.gray('$ ccs unload               # Remove from Claude Code')}
  ${chalk.gray('$ ccs status               # Show config')}
  ${chalk.gray('$ ccs doctor               # Health check')}
  ${chalk.gray('$ ccs lang set de_DE       # Switch to German')}
`,
  );

  return program;
}

async function main(): Promise<void> {
  try {
    const program = setupProgram();
    await program.parseAsync(process.argv);
  } catch (error) {
    logger.logError('CLI', error);
    console.error(chalk.red(i18n.t('cli.error_general')), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
