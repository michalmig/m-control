# tool-id

> One-line description of what this tool does.

## What it does

TODO: Explain the purpose and use case in 2-3 sentences.

## Usage

```bash
# Interactive
mctl
> Select: Category
> Select: Tool Display Name

# Direct
mctl tool-id

# With options (if applicable)
mctl tool-id --dry-run
```

## Required Config

| Key | Description | Required |
|-----|-------------|----------|
| *(none yet)* | | |

Set config via:
```bash
mctl config
```

Or edit `~/.m-control/config.json` directly.

## External Dependencies

- *(none)* — or list binaries/services required, e.g. `kubectl`, `az` CLI

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--dry-run` | `false` | Preview changes without executing |

## Error Scenarios

| Scenario | Behavior |
|----------|----------|
| Missing config | Clear message: "Run `mctl config` to set X" |
| API unreachable | Timeout after 10s with retry hint |

## Examples

```bash
# Example 1: basic usage
mctl tool-id

# Example 2: with options
mctl tool-id --dry-run
```

## Notes

TODO: Any known limitations, quirks, or future improvements.

---

*Part of [m-control](../../README.md) — personal developer CLI.*
