# Contributing to CCS

Thanks for considering a contribution.

CCS is a small CLI with a narrow goal: configure Claude Code for Anthropic-compatible provider endpoints safely and reversibly.

## Good First Contributions

- Update stale provider model IDs.
- Add tests for provider-specific environment overrides.
- Improve README examples.
- Improve translations.
- Add a new Anthropic-compatible provider.

## Development Setup

```bash
git clone https://github.com/nicremo/ccs.git
cd ccs
npm install
npm test
npm run build
```

## Pull Request Checklist

Before opening a pull request:

1. Keep the change focused.
2. Add or update tests when provider behavior changes.
3. Run `npm test`.
4. Run `npm run build`.
5. Run `npm audit`.
6. Update `README.md` or `CHANGELOG.md` if user-facing behavior changes.

## Provider Updates

Provider updates should include:

- Official documentation link.
- Exact base URL.
- Exact model IDs.
- Default model choice.
- Fast or fallback model choice.
- API key validation endpoint.
- Required validation headers.
- Claude Code environment overrides.

## Security and Secrets

Never include API keys, tokens, local config files, `.env` files, or Claude Code settings in a pull request.

Do not paste real provider responses if they contain account IDs, quotas, tokens, or billing data.
