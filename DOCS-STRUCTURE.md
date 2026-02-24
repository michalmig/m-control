# DOCS-STRUCTURE.md — Documentation System Guide

> Meta-documentation: docs about the docs. Read this to understand *how* the documentation system works, not what it contains.

---

## 🗺️ Complete Structure

```
m-control/
│
├── README.md                    # Project overview & quick links
├── QUICKSTART.md                # Get running in 5 minutes
├── CONTRIBUTING.md              # Workflow: branching, commits, PR, release
├── CHANGELOG.md                 # What changed + WHY it changed
├── LESSONS-LEARNED.md           # Pivots, mistakes, and what we learned
├── DOCS-STRUCTURE.md            # ← You are here
│
├── docs/
│   ├── README.md                # Navigation hub for all docs
│   ├── VISION.md                # Product north star (CLI → SaaS)
│   │
│   ├── adr/                     # Architecture Decision Records
│   │   ├── TEMPLATE.md          # Blank ADR to copy
│   │   └── 0001-typescript-orchestrator.md
│   │
│   ├── architecture/            # How the system works (technical)
│   │   ├── OVERVIEW.md          # Big picture, component map
│   │   ├── constraints.md       # ⚠️  Hard rules — never violate
│   │   ├── plugin-contract.md   # Plugin interface & lifecycle
│   │   ├── execution-model.md   # How commands are resolved & run
│   │   ├── context-model.md     # Config, state, env context
│   │   └── diagrams/
│   │       └── plugin-flow.mmd  # Mermaid: plugin execution flow
│   │
│   └── ai/                      # AI assistant context & tooling
│       ├── PROJECT-CONTEXT.md   # ⭐ Attach this to every new AI session
│       ├── CODING-GUIDELINES.md # Patterns, naming, error handling
│       ├── ANTI-PATTERNS.md     # What NOT to do (with rationale)
│       └── PROMPTS/             # Reusable prompt templates
│           ├── implement-tool.md
│           ├── design-review.md
│           └── write-adr.md
│
└── templates/
    └── tool-boilerplate/        # Copy this when creating a new plugin
        ├── manifest.json        # Plugin metadata
        ├── index.ts             # Handler with error handling pattern
        ├── README.md            # Plugin-specific docs template
        └── test.spec.ts         # Test structure template
```

---

## 📁 Folder Purposes

### `/` (root)
Human-facing project docs. What GitHub/GitLab shows on the repo landing page. Keep short; link into `docs/` for depth.

### `docs/`
Technical and product documentation. Organized by *audience* (architecture for engineers, ai/ for AI assistants) and *type* (decisions vs. reference vs. vision).

### `docs/adr/`
**Architecture Decision Records** — numbered, immutable log of *why* we made key technical choices. Once written, never delete — mark as "Superseded" instead. This is the project's institutional memory.

### `docs/architecture/`
**Living reference** for how the system works. Updated when the system changes. `constraints.md` is the closest thing to a constitution — it defines hard rules that override convenience.

### `docs/ai/`
**AI-first context layer.** Every file here is designed to be attached to an AI session or referenced in a prompt. `PROJECT-CONTEXT.md` is the single entry point — it links to everything else.

### `docs/ai/PROMPTS/`
**Reusable prompt recipes.** Don't write the same context paragraph for the 10th time — template it here and reference it.

### `templates/tool-boilerplate/`
**Copy-paste foundation** for new plugins. Contains working code patterns, not just stubs. Follow the README for how to rename and customize.

---

## 🧭 "What Do I Read For…?"

| I want to… | Read… |
|------------|-------|
| Start a new AI coding session | `docs/ai/PROJECT-CONTEXT.md` |
| Add a new plugin | `docs/architecture/plugin-contract.md` + `templates/tool-boilerplate/` |
| Make an architectural decision | `docs/adr/TEMPLATE.md` + `docs/ai/PROMPTS/write-adr.md` |
| Understand a hard rule | `docs/architecture/constraints.md` |
| Review code quality | `docs/ai/CODING-GUIDELINES.md` + `docs/ai/ANTI-PATTERNS.md` |
| Understand the product direction | `docs/VISION.md` |
| Know what changed recently | `CHANGELOG.md` |
| Know why something changed | `LESSONS-LEARNED.md` or the relevant ADR |
| Navigate all docs | `docs/README.md` |

---

## 🔄 How to Maintain These Docs

### When adding a feature
1. Does it require an architectural decision? → Write ADR
2. Does it change the plugin contract? → Update `plugin-contract.md`
3. Does it change the execution flow? → Update `execution-model.md`
4. Add entry to `CHANGELOG.md` with *why*, not just *what*

### When something goes wrong / you pivot
1. Add to `LESSONS-LEARNED.md`
2. If it reveals a missing constraint → add to `constraints.md`
3. If it supersedes an ADR → mark old ADR, write new one

### When you add a new AI prompt pattern
1. Add to `docs/ai/PROMPTS/`
2. Update the table in `docs/ai/PROJECT-CONTEXT.md`

### ADR numbering
Sequential: `0001`, `0002`, `0003`... Never reuse numbers. Gap in sequence = deleted ADR (don't do this; use "Deprecated" status instead).

---

## 💡 Rationale: Why This Structure?

### Why separate `ai/` folder?
AI assistants need different information than human developers. A human reading `OVERVIEW.md` builds mental model over time. An AI needs dense, cross-linked context in one place. Mixing them degrades both.

### Why `constraints.md` as "constitution"?
Technical decisions accumulate. Without a canonical "never do this" document, you end up re-relitigating the same debates. Constraints are architectural invariants — they should be referenced, not re-decided.

### Why CHANGELOG includes "why"?
`git log` tells you *what* changed. CHANGELOG tells you *why you should care*. "Refactored plugin loader" is useless. "Refactored plugin loader to support hot-reload — enables faster development loop for external tools" is useful.

### Why boilerplate over scaffolding CLI?
A scaffolding CLI (`mctl new-plugin`) requires maintenance and has its own bugs. A copy-paste template is auditable, versionable, and works offline. When the boilerplate evolves, old plugins aren't force-migrated.

---

## ✏️ Editing These Docs

**Tools:** Any Markdown editor. Diagrams use [Mermaid](https://mermaid.js.org/).

**Line endings:** LF (configured in `.editorconfig`)

**Language:** English only — for AI tooling consistency.

**Style:** Concise. Document *why* and *trade-offs*, not *what* (code is self-documenting). Avoid padding.

---

*Last updated: 2025-02-18 — Initial documentation system*
