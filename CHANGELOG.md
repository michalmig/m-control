# Changelog

All notable changes to m-control will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Plugin architecture implementation
- AZDO PR review tool
- Kubernetes pod inspector
- Stream Deck integration

---

## [0.1.0] - 2025-02-18

### Added
- Initial project setup with TypeScript orchestrator
- Command registry with grouped commands
- Config manager with automatic initialization
- First test command: `hello-world`
- Interactive TUI mode using prompts library
- Direct command execution support
- Help command (`--help`)
- Aliases: `mctl` and `mm`
- ESLint and Prettier configuration
- VS Code / Cursor workspace configuration
- Build system (TypeScript + esbuild)
- Windows PowerShell installer script
- Comprehensive documentation structure:
  - Project vision and architecture docs
  - AI-first documentation (PROJECT-CONTEXT, CODING-GUIDELINES, ANTI-PATTERNS)
  - Architecture Decision Records (ADR) system
  - Code templates and boilerplates
  - Custom AI prompts library

### Changed
- N/A (initial release)

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- Config template created for credentials management
- .gitignore configured to exclude secrets

---

## Version Format

**[MAJOR.MINOR.PATCH]**
- **MAJOR:** Breaking changes (incompatible API changes)
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes (backward compatible)

## Change Categories

- **Added:** New features
- **Changed:** Changes in existing functionality
- **Deprecated:** Soon-to-be removed features
- **Removed:** Now removed features
- **Fixed:** Bug fixes
- **Security:** Vulnerability fixes

---

[Unreleased]: https://github.com/your-repo/m-control/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-repo/m-control/releases/tag/v0.1.0
