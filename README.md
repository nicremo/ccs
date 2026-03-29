# CCS - Claude Code Provider Switcher

A CLI tool to switch between different AI providers for Claude Code.

## Supported Providers

- **MiniMax** - M2.7, M2.7 Highspeed, M2.5 Highspeed, M2.5
- **Kimi / Moonshot** - K2.5, K2 Thinking Turbo, K2 Turbo
- **Z.AI / GLM** - GLM-5.1, GLM-5-Turbo, GLM-5
- **DeepSeek** - Reasoner (V3.2 Thinking), Chat (V3.2)
- **Qwen / DashScope** - Qwen 3.5 Plus, Qwen 3 Coder Plus, Qwen 3 Coder Next, Qwen 3 Max, Qwen 3.5 Flash

## Quick Start

```bash
# Run without installing
npx @nicremo/ccs

# Or install globally
npm install -g @nicremo/ccs
ccs
```

## Features

- Interactive wizard for provider setup
- Support for 3 AI providers (MiniMax, Kimi, GLM)
- Automatic backup before any changes
- Restore to previous configuration
- Reset to default (remove provider config)
- Multi-language (English, German, Chinese)
- Health check with `ccs doctor`

## Commands

| Command | Description |
|---------|-------------|
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

## Requirements

- Node.js 18+
- Claude Code installed

## Configuration

- Config stored in: `~/.ccs/config.yaml`
- Backups stored in: `~/.ccs/backups/`
- Claude Code settings: `~/.claude/settings.json`

## License

MIT
