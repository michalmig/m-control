# Lessons Learned

This document captures the "why" behind major decisions and pivots in m-control. While CHANGELOG.md tracks **what** changed, this file explains **why** it changed.

## Purpose

- Record strategic pivots and reasoning
- Document failed experiments and learnings
- Capture insights that aren't obvious from code or ADRs
- Help future self (and AI) understand historical context

## Format

Each entry should include:
- **Date:** When the lesson was learned
- **Context:** What was happening
- **What happened:** The event or decision
- **Lesson:** What we learned
- **Impact:** How it changed the project

---

## 2025-02-18: Project Inception - AI-First Documentation Strategy

**Context:**  
Starting m-control with intention to use AI assistants (Claude Code, Cursor, Copilot) for 80%+ of development. Needed a way to maintain consistency and context across tools.

**What happened:**  
Instead of "code first, docs later", invested upfront in comprehensive documentation structure optimized for AI consumption (PROJECT-CONTEXT, CODING-GUIDELINES, ANTI-PATTERNS, prompts library).

**Lesson:**  
AI-assisted development at scale requires structured knowledge transfer. Without proper docs, each new AI chat session starts from zero, leading to:
- Inconsistent patterns
- Repeated mistakes
- Lost context when switching tools
- Architectural drift

**Impact:**  
- Created docs/ structure before writing significant code
- All major docs reference each other (navigation graph)
- AI can bootstrap project context in <2 minutes
- Can seamlessly switch between Cursor ↔ Claude Code

**Would do differently:** Nothing yet - too early to tell.

---

## 2025-02-18: TypeScript Over .NET for MVP

**Context:**  
Evaluating tech stack for CLI orchestrator. Options: TypeScript, .NET, Python, Go.

**What happened:**  
Chose TypeScript despite .NET being better for performance and native distribution.

**Lesson:**  
For AI-assisted MVP development, speed of iteration > raw performance.
- TypeScript: Fast prototyping, large ecosystem, AI assistants excel at it
- .NET: Better performance, but slower dev cycle with AI

**Impact:**  
- Can add new tools in minutes with AI assistance
- Polyglot approach allows .NET tools later if needed
- Trade-off: Runtime dependency (Node.js), but acceptable for target users

**Related ADR:** docs/adr/0001-typescript-orchestrator.md

**Would do differently:**  
If starting with team >3 people or enterprise customers from day 1, might choose .NET for better "professional" perception. But for solo MVP with AI? TypeScript was correct.

---

## 2026-02-27: CLI Distribution — Monorepo Package Not Resolvable Outside Repo

**Context:**
`mctl` depends on `@m-control/core` as a Yarn workspace package. Yarn symlinks it inside the repo's `node_modules/`, but once `mctl.js` is copied to `~/.m-control/` the symlink is gone and Node.js throws `Cannot find module '@m-control/core'`.

**What happened:**
Tried a simple `Copy-Item dist/ → ~/.m-control/dist/` install approach. It failed at runtime because `@m-control/core` wasn't available on the target path. Introduced ncc bundling to inline all dependencies into a single file before copying.

**Lesson:**
Monorepo workspace packages are a development convenience, not a distribution mechanism. Any tool that ships outside the repo must either:
1. Be published to npm so its dependencies resolve normally, or
2. Be bundled so no external resolution is needed at runtime.

**Impact:**
- Temporary: ncc bundle (`dist/bundle/index.js`) — zero-config, works anywhere Node.js exists
- Installer now copies a single file instead of an entire directory tree
- Accepted tech debt: bundle grows with deps, no partial updates, no native addon support

**Would do differently:**
Go straight to `npm publish` if there were even one external user from day 1. The bundling step is a workaround that buys time without creating blocking debt.

**Related:**
- ADR: `docs/adr/0004-cli-distribution-strategy.md`

**Migration trigger:** First external user → migrate to `npm publish @m-control/mctl`.

---

## Template for Future Entries

```markdown
## YYYY-MM-DD: [Short Title]

**Context:**  
What was the situation?

**What happened:**  
What decision/event/pivot occurred?

**Lesson:**  
What did we learn? What insight emerged?

**Impact:**  
How did this change the project? What became easier/harder?

**Would do differently:**  
In hindsight, what would you change?

**Related:**  
- ADR: docs/adr/XXXX-*.md (if applicable)
- Code: src/path/to/code (if applicable)
```

---

## Guidelines for Adding Entries

**Add entry when:**
- ✅ Strategic pivot (change in product direction)
- ✅ Architecture change with non-obvious reasoning
- ✅ Failed experiment with valuable lesson
- ✅ "Aha moment" that changed understanding
- ✅ Trade-off that future self might question

**Don't add entry for:**
- ❌ Bug fixes (use CHANGELOG)
- ❌ Minor implementation details
- ❌ Obvious decisions
- ❌ Routine refactoring

**Think:** Will future me (or AI) benefit from understanding WHY I did this?

---

**Last updated:** 2025-02-18  
**Maintainer:** Michał
