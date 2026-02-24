# ADR-0001: TypeScript for CLI Orchestrator

**Status:** Accepted  
**Date:** 2025-02-18  
**Deciders:** Michał + Claude  
**Tags:** architecture, technology-choice, mvp

## Context

m-control needs a CLI orchestrator that:
- Coordinates execution of multiple tools (TypeScript, Python, .NET, etc.)
- Provides interactive TUI for command selection
- Is easy to develop and iterate on (AI-assisted development)
- Works cross-platform (Windows primary, Linux secondary)
- Can evolve into desktop app (Electron) if needed

Technology options evaluated:
1. **TypeScript** (Node.js)
2. **.NET** (C#)
3. **Python**
4. **Go**

Project phase: MVP - focus on rapid iteration and validation.

## Decision

Use **TypeScript (Node.js)** for the CLI orchestrator.

**Key characteristics:**
- Runtime: Node.js 18+
- Build: TypeScript compiler + esbuild for bundling
- TUI: `prompts` library (interactive mode)
- Package manager: npm/yarn
- Distribution: npm global install (MVP), potentially Electron later

## Consequences

### Positive
- ✅ **Fast prototyping:** AI assistants (Claude, Cursor, Copilot) excel at TypeScript
- ✅ **Rich ecosystem:** Vast npm library for TUI, CLI utilities, API clients
- ✅ **Familiar technology:** Michał's primary expertise (Angular, NestJS background)
- ✅ **Cross-platform by default:** Node.js runs everywhere
- ✅ **Future Electron path:** Easy migration to desktop app if needed
- ✅ **JSON-native:** Easy tool communication via JSON I/O
- ✅ **Rapid iteration:** Hot reload, no compilation overhead in dev

### Negative
- ❌ **Runtime dependency:** Requires Node.js installation
- ❌ **Performance:** Slower than native (Go, .NET AOT) - acceptable trade-off for CLI
- ❌ **Memory footprint:** Larger than native (~50-70MB bundled)
- ❌ **Distribution size:** Larger than single-file native binaries
- ❌ **Startup time:** Slightly slower than native (milliseconds, not noticeable)

### Neutral
- ⚪ **Packaging:** Can bundle to single file with esbuild/pkg, but still needs Node
- ⚪ **Type safety:** TypeScript provides good safety, but not as strong as .NET/Rust
- ⚪ **Community:** Large but fragmented (many ways to do same thing)

## Alternatives Considered

### Option A: .NET (C#)
**Description:** CLI in C# with `Spectre.Console` for TUI

**Pros:**
- Better performance (native compilation)
- Smaller single-file executable (<20MB)
- Strong type system
- Good for enterprise perception

**Cons:**
- Slower development cycle with AI (less ecosystem familiarity)
- Heavier SDK (requires .NET runtime or large AOT compilation)
- Smaller ecosystem for CLI/TUI utilities compared to npm
- Less AI assistant expertise

**Why rejected:** 
Development speed and AI-assistance more critical than raw performance for MVP. Can use .NET for individual tools if needed (polyglot approach).

### Option B: Python
**Description:** CLI in Python with `prompt_toolkit` or `rich`

**Pros:**
- Great for scripting
- Large AI/data ecosystem
- Familiar to many developers

**Cons:**
- Packaging complexity (PyInstaller, cx_Freeze)
- Slower than TypeScript for I/O-heavy operations
- Less suitable for complex orchestration logic
- AI assistants less effective for Python CLI compared to TypeScript

**Why rejected:** 
TypeScript better suited for orchestration layer. Python excellent for individual tools (can use via polyglot architecture).

### Option C: Go
**Description:** CLI in Go with `bubbletea` for TUI

**Pros:**
- Fast native compilation
- Small single binary
- Excellent for CLI tools
- Cross-compilation built-in

**Cons:**
- Less AI assistant support
- Smaller ecosystem for general utilities
- Not Michał's expertise (learning curve)
- Overkill for orchestrator (main value in tools, not orchestrator)

**Why rejected:** 
Learning curve + AI support weigh against performance benefits. Orchestrator is coordination layer, not performance bottleneck.

## Implementation Notes

### Build Process
```bash
TypeScript → compiled JS → esbuild bundle → single .js file
```

### Distribution Strategy
**MVP:** 
- npm global install: `npm install -g @michal/m-control`
- Wrappers: `mctl.cmd` / `mm.cmd` on Windows

**Future:**
- Electron app (auto-updates, better UX)
- Or single executable via `pkg` / `node-sea` (experimental)

### Dependencies Management
- Keep core dependencies minimal
- Use esbuild to bundle, reducing runtime dependencies
- External tools (Python, .NET) called via `child_process`

### Testing
- Development: `ts-node` for fast iteration
- Build: `tsc` + `esbuild` for production
- Manual testing initially, Jest for unit tests when needed

## Related Decisions

- **Enables:** ADR-0002 (Plugin architecture - to be created)
- **Related to:** Polyglot tools strategy (TypeScript orchestrator + mixed-tech tools)

## References

- TypeScript: https://www.typescriptlang.org/
- esbuild: https://esbuild.github.io/
- prompts: https://github.com/terkelg/prompts
- Node.js SEA: https://nodejs.org/docs/latest/api/single-executable-applications.html

---

**Lessons Learned (see LESSONS-LEARNED.md):**

This decision prioritizes:
1. **Speed of iteration** over raw performance
2. **AI-assisted development** over traditional development efficiency
3. **Time to market** over optimal engineering

For solo developer building MVP with AI assistance, TypeScript is optimal. For enterprise team or performance-critical system, .NET might be better choice.

**Next review:** After MVP completion (3 months) - evaluate if TypeScript scaling well or if migration needed.
