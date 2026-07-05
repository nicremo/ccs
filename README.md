# CCS - Claude Code Provider Switcher

[![npm version](https://img.shields.io/npm/v/@nicremo/ccs?color=blue)](https://www.npmjs.com/package/@nicremo/ccs)
[![npm downloads](https://img.shields.io/npm/dm/@nicremo/ccs)](https://www.npmjs.com/package/@nicremo/ccs)
[![CI](https://github.com/Nicremo/ccs/actions/workflows/ci.yml/badge.svg)](https://github.com/Nicremo/ccs/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)

**CCS is a Claude Code provider switcher for Anthropic-compatible coding models.**

It configures Claude Code for MiniMax, Kimi, Z.AI GLM, DeepSeek, and Qwen without manually editing `~/.claude/settings.json`.

Keywords: Claude Code provider switcher, Claude Code alternative models, Anthropic-compatible API, MiniMax M3, Kimi K2.7 Code, GLM-5.2, DeepSeek V4, Qwen 3.7, DashScope, terminal CLI.

Provider data last refreshed: 2026-07-05.

## Why CCS

Claude Code reads provider settings from one active environment configuration. Switching providers by hand means editing JSON, remembering provider-specific model IDs, choosing the right endpoint, and avoiding accidental loss of existing settings.

CCS keeps that workflow explicit and reversible:

- Select a provider, region, plan, and model from an interactive wizard.
- Validate API keys with provider-specific headers.
- Back up Claude Code settings before every write.
- Preserve unrelated environment keys in `~/.claude/settings.json`.
- Remove only the environment keys that CCS manages.
- Restore previous Claude Code settings from local backups.

## Supported Providers

| Provider | Default model | Other included models | Anthropic-compatible base URLs |
|---|---|---|---|
| MiniMax | `MiniMax-M3[1m]` | `MiniMax-M3`, `MiniMax-M2.7`, `MiniMax-M2.7-highspeed`, `MiniMax-M2.5-highspeed`, `MiniMax-M2.5` | `api.minimax.io`, `api.minimaxi.com` |
| Kimi / Moonshot | `kimi-k2.7-code` | `kimi-k2.6`, `kimi-k2.5`, `kimi-k2-thinking-turbo`, `kimi-k2-turbo-preview`, `kimi-k2-0905-preview` | `api.moonshot.ai` |
| Z.AI / GLM | `glm-5.2[1m]` | `glm-5.2`, `glm-4.7`, `glm-4.5-air`, `glm-5.1`, `glm-5-turbo`, `glm-5` | `api.z.ai`, `open.bigmodel.cn` |
| DeepSeek | `deepseek-v4-pro[1m]` | `deepseek-v4-flash[1m]`, `deepseek-v4-pro`, `deepseek-v4-flash` | `api.deepseek.com` |
| Qwen / DashScope | `qwen3.7-plus` | `qwen3.6-plus`, `qwen3.7-max`, `qwen3.6-flash`, `qwen3.5-plus`, `qwen3-coder-plus`, `qwen3-coder-next`, `qwen3-max-2026-01-23` | Coding Plan, Token Plan, Pay-as-you-go |

## Install

```bash
npx @nicremo/ccs
```

Or install globally:

```bash
npm install -g @nicremo/ccs
ccs
```

## Usage

Run the wizard:

```bash
ccs
```

Configure a provider:

```bash
ccs provider
ccs auth
ccs apply
```

Check the active configuration:

```bash
ccs status
ccs doctor
```

Remove CCS-managed provider settings from Claude Code:

```bash
ccs unload
```

## Commands

| Command | Description |
|---|---|
| `ccs` | Start the interactive wizard |
| `ccs init` | Re-run setup |
| `ccs provider` | Select provider, region, and model |
| `ccs auth` | Configure or update the API key |
| `ccs auth revoke` | Remove the saved API key from `~/.ccs/config.yaml` |
| `ccs apply` | Apply the selected provider to Claude Code |
| `ccs unload` | Remove CCS-managed provider config from Claude Code |
| `ccs status` | Show local CCS config and active Claude Code config |
| `ccs doctor` | Run a local health check |
| `ccs lang set de_DE` | Switch the UI language |

## What CCS Writes

CCS stores its own config in:

```text
~/.ccs/config.yaml
```

CCS creates backups in:

```text
~/.ccs/backups/
```

When you run `ccs apply`, CCS updates:

```text
~/.claude/settings.json
```

Only the `env` keys managed by CCS are changed. Other keys remain in place.

Managed Claude Code environment keys:

- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_SMALL_FAST_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`
- `CLAUDE_CODE_SUBAGENT_MODEL`
- `CLAUDE_CODE_EFFORT_LEVEL`
- `CLAUDE_CODE_AUTO_COMPACT_WINDOW`
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`
- `ENABLE_TOOL_SEARCH`
- `API_TIMEOUT_MS`

## Safety Model

CCS is intentionally local-first:

- API keys are stored in `~/.ccs/config.yaml`.
- Claude Code settings are backed up before writes.
- Provider unload removes only CCS-managed environment keys.
- Existing unrelated Claude Code settings are preserved.
- The CLI does not phone home.

Do not commit `~/.ccs/config.yaml`, Claude Code settings, API keys, tokens, or local backup files.

## Provider Sources

The provider catalog is based on official provider documentation and provider-maintained tooling:

- [MiniMax Claude Code docs](https://platform.minimax.io/docs/token-plan/claude-code)
- [Kimi K2.7 Code docs](https://platform.kimi.ai/docs/guide/agent-support)
- [Z.AI Claude Code docs](https://docs.z.ai/devpack/tool/claude)
- [DeepSeek Claude Code docs](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code)
- [Alibaba Cloud Model Studio Claude Code docs](https://help.aliyun.com/en/model-studio/claude-code)
- [Qwen Code](https://github.com/QwenLM/qwen-code)
- [Kimi CLI](https://github.com/MoonshotAI/kimi-cli)
- [MiniMax CLI](https://github.com/MiniMax-AI/cli)

## Development

```bash
npm install
npm test
npm run build
npm audit
```

Project layout:

```text
src/cli.ts                  CLI entrypoint
src/lib/config.ts           Local CCS config
src/lib/api-validator.ts    Provider API key validation
src/managers/claude-code.ts Claude Code settings writer
src/providers/              Provider catalog and env overrides
src/locales/                English, German, and Chinese UI strings
tests/                      Node test runner tests
```

## Release Checklist

Before publishing a release:

1. Refresh provider docs and model IDs.
2. Update tests for changed defaults, endpoints, and env overrides.
3. Run `npm test`.
4. Run `npm run build`.
5. Run `npm audit`.
6. Update `CHANGELOG.md`.
7. Publish with `npm publish --access public`.

## Contributing

Contributions are welcome. Good contributions include:

- New provider support.
- Updated model defaults.
- Better provider validation.
- Documentation improvements.
- Tests for provider-specific behavior.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security

Please report security issues privately. See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
