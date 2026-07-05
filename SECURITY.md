# Security Policy

## Supported Versions

Security fixes are applied to the latest released version.

## Reporting a Vulnerability

Please report security issues privately through GitHub Security Advisories:

https://github.com/nicremo/ccs/security/advisories/new

Do not open a public issue for vulnerabilities involving:

- API key exposure.
- Token handling.
- Unsafe writes to Claude Code settings.
- Backup restore issues.
- Provider endpoint spoofing.
- Dependency vulnerabilities with a working exploit path.

## Security Scope

CCS writes local configuration files:

- `~/.ccs/config.yaml`
- `~/.ccs/backups/`
- `~/.claude/settings.json`
- `~/.claude.json`

Expected behavior:

- Back up Claude Code settings before modifying them.
- Preserve unrelated Claude Code settings.
- Remove only CCS-managed environment keys during unload.
- Avoid logging API keys.

## Out of Scope

- Compromise of a third-party provider account.
- Provider API outages.
- Incorrect model behavior from a configured provider.
- User-committed secrets outside this repository.
