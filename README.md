# CCS - Claude Code Provider Switcher

A CLI tool to switch Claude Code between Anthropic-compatible coding model providers.

Provider data last refreshed: 2026-07-05.

## Supported Providers

| Provider | Default model | Other included models | Base URLs |
|---|---|---|---|
| MiniMax | `MiniMax-M3[1m]` | `MiniMax-M3`, `MiniMax-M2.7`, `MiniMax-M2.7-highspeed`, `MiniMax-M2.5-highspeed`, `MiniMax-M2.5` | `api.minimax.io`, `api.minimaxi.com` |
| Kimi / Moonshot | `kimi-k2.7-code` | `kimi-k2.6`, `kimi-k2.5`, `kimi-k2-thinking-turbo`, `kimi-k2-turbo-preview`, `kimi-k2-0905-preview` | `api.moonshot.ai` |
| Z.AI / GLM | `GLM-4.7` | `GLM-4.5-Air`, `glm-5.2`, `glm-5.1`, `glm-5-turbo`, `glm-5` | `api.z.ai`, `open.bigmodel.cn` |
| DeepSeek | `deepseek-v4-pro[1m]` | `deepseek-v4-flash[1m]`, `deepseek-v4-pro`, `deepseek-v4-flash` | `api.deepseek.com` |
| Qwen / DashScope | `qwen3.7-plus` | `qwen3.6-plus`, `qwen3.7-max`, `qwen3.6-flash`, `qwen3.5-plus`, `qwen3-coder-plus`, `qwen3-coder-next`, `qwen3-max-2026-01-23` | Coding Plan, Token Plan, Pay-as-you-go |

## Quick Start

```bash
# Run without installing
npx @nicremo/ccs

# Or install globally
npm install -g @nicremo/ccs
ccs
```

## Features

- Interactive provider setup for Claude Code
- Current model presets for MiniMax, Kimi, Z.AI, DeepSeek, and Qwen
- Region and plan selection where providers expose multiple Anthropic-compatible endpoints
- Provider-specific API key validation headers
- Automatic backup before any change to Claude Code settings
- Restore and reset workflow for previous Claude Code settings
- Multi-language interface in English, German, and Chinese
- Health check with `ccs doctor`

## Commands

| Command | Description |
|---|---|
| `ccs` | Start interactive wizard |
| `ccs init` | Re-run setup wizard |
| `ccs provider` | Switch provider |
| `ccs apply` | Apply config to Claude Code |
| `ccs unload` | Remove provider config |
| `ccs status` | Show current configuration |
| `ccs doctor` | Run health check |
| `ccs auth` | Configure API key |
| `ccs auth revoke` | Remove API key |
| `ccs lang set de_DE` | Change language |

## Configuration

CCS stores its own config in `~/.ccs/config.yaml`.

When applying a provider, CCS updates `~/.claude/settings.json` under the `env` key and creates a backup in `~/.ccs/backups/` first.

Managed Claude Code environment keys include:

- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_SMALL_FAST_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`
- `CLAUDE_CODE_SUBAGENT_MODEL`
- `CLAUDE_CODE_EFFORT_LEVEL`
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`
- `API_TIMEOUT_MS`

Other existing environment keys in `~/.claude/settings.json` are preserved.

## Requirements

- Node.js 18+
- Claude Code installed

## Development

```bash
npm test
npm run build
npm audit --omit=dev
```

## License

MIT
