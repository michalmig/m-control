# Documentation Structure Guide

This document explains the documentation structure of m-control project. It serves as a meta-documentation (docs about docs) to help understand, maintain, and evolve the documentation system.

## 📋 Complete Structure

```
m-control/
├── CONTRIBUTING.md              # How to contribute to this project
├── CHANGELOG.md                 # What changed and when
├── LESSONS-LEARNED.md           # Why things changed (pivots, decisions)
│
├── docs/
│   ├── 00-DOCS-STRUCTURE.md    # 👈 THIS FILE - meta documentation
│   ├── README.md                # Documentation navigation guide
│   ├── VISION.md                # Product north star and boundaries
│   │
│   ├── adr/                     # Architecture Decision Records
│   │   ├── TEMPLATE.md          # Template for new ADRs
│   │   └── 0001-*.md            # Individual decisions (numbered)
│   │
│   ├── architecture/            # Technical architecture docs
│   │   ├── OVERVIEW.md          # High-level architecture (1-2 pages)
│   │   ├── constraints.md       # "Constitution" - what NOT to do
│   │   ├── plugin-contract.md   # How plugins work
│   │   ├── execution-model.md   # How tools execute
│   │   ├── context-model.md     # How context flows
│   │   └── diagrams/            # Visual diagrams (Mermaid)
│   │       └── plugin-flow.mmd  # Plugin execution flow
│   │
│   └── ai/                      # AI-specific context and guidelines
│       ├── PROJECT-CONTEXT.md   # Bootstrap for new AI chat
│       ├── CODING-GUIDELINES.md # Code style and patterns
│       ├── ANTI-PATTERNS.md     # What NOT to do (lessons learned)
│       └── PROMPTS/             # Reusable prompt templates
│           ├── implement-tool.md
│           ├── design-review.md
│           └── write-adr.md
│
├── templates/                   # Boilerplate code templates
│   └── tool-boilerplate/        # Template for new tool/plugin
│       ├── manifest.json
│       ├── index.ts
│       ├── README.md
│       └── test.spec.ts
│
└── .cursorrules                 # Cursor IDE AI configuration
```

---

## 📂 Folder Descriptions

### Root Level Files

#### `CONTRIBUTING.md`
**Purpose:** Documents how to work with this project  
**Audience:** You (Michał), future contributors, AI assistants  
**Contains:**
- Development setup
- How to add new tools
- Code review process
- Testing guidelines

**Why root?** Standard GitHub convention. Visible immediately.

---

#### `CHANGELOG.md`
**Purpose:** Chronicle of what changed  
**Audience:** Users, developers, product managers  
**Contains:**
- Version history
- Features added
- Bugs fixed
- Breaking changes

**Format:** Keep-a-Changelog standard  
**Why root?** Standard location. GitHub displays it automatically.  
**Update when:** Every release, major feature, breaking change

---

#### `LESSONS-LEARNED.md`
**Purpose:** Chronicle of WHY things changed  
**Audience:** You (future self), AI assistants, team  
**Contains:**
- Strategic pivots
- Architecture changes reasoning
- Failed experiments
- Key insights

**Different from CHANGELOG:** CHANGELOG = facts, LESSONS = reasoning  
**Why root?** Quick access. Not hidden in docs/.  
**Update when:** Significant decisions, pivots, "aha moments"

---

### `docs/` - Main Documentation Folder

Central documentation hub. All long-form docs go here.

---

#### `docs/00-DOCS-STRUCTURE.md` (THIS FILE)
**Purpose:** Meta-documentation about documentation structure  
**Audience:** You, future maintainers, AI when restructuring  
**Contains:**
- Complete structure overview
- Rationale for each file/folder
- How to evolve documentation

**Why numbered?** Ensures it's always first alphabetically.  
**Update when:** Documentation structure changes.

---

#### `docs/README.md`
**Purpose:** Navigation guide for all documentation  
**Audience:** Anyone exploring the docs  
**Contains:**
- Quick links to key documents
- "Start here" guidance
- Documentation categories overview

**Think of it as:** Table of contents for docs/  
**Update when:** New major doc sections added.

---

#### `docs/VISION.md`
**Purpose:** Product north star and scope boundaries  
**Audience:** You, stakeholders, AI assistants  
**Contains:**
- What is m-control (product vision)
- What it IS and what it IS NOT
- Target audience
- Success metrics
- Long-term goals

**Why separate from README?** Vision is strategic, README is tactical.  
**Update when:** Product direction shifts, new insights about market.

---

### `docs/adr/` - Architecture Decision Records

Records of significant architectural decisions.

**Philosophy:** Decision + Context + Consequences  
**Format:** Markdown files numbered sequentially (0001, 0002, ...)  
**Immutable:** Old ADRs never deleted, only superseded

---

#### `docs/adr/TEMPLATE.md`
**Purpose:** Template for creating new ADRs  
**Usage:** Copy this when making new decision  
**Contains:**
- Status (Proposed/Accepted/Deprecated/Superseded)
- Context (what problem?)
- Decision (what we chose)
- Consequences (pros/cons)
- Alternatives considered

**Update when:** ADR format needs improvement.

---

#### `docs/adr/0001-*.md` (and subsequent)
**Purpose:** Individual architectural decisions  
**Naming:** `XXXX-short-description.md` (e.g., `0001-typescript-orchestrator.md`)  
**Create when:**
- Technology choice (language, framework)
- Architecture pattern (plugin system, event model)
- Breaking change decision
- Trade-off with long-term impact

**Don't create ADR for:** Minor implementation details, bug fixes, style changes.

---

### `docs/architecture/` - Technical Architecture

Describes HOW the system works technically.

---

#### `docs/architecture/OVERVIEW.md`
**Purpose:** High-level architecture summary  
**Max length:** 1-2 pages  
**Contains:**
- System components
- Data flow
- Key technologies
- Integration points

**Think of it as:** 30,000 foot view  
**Update when:** Major architectural changes.

---

#### `docs/architecture/constraints.md`
**Purpose:** The "Constitution" - inviolable rules  
**Audience:** AI assistants (MUST READ), developers  
**Contains:**
- What you NEVER do (security, architecture, code quality)
- What you ALWAYS do (patterns, practices)
- Non-negotiable constraints

**Critical for AI:** Prevents repeated mistakes.  
**Update when:** New constraint emerges from painful lesson.

---

#### `docs/architecture/plugin-contract.md`
**Purpose:** How plugins work in m-control  
**Contains:**
- Plugin interface specification
- Manifest format
- Lifecycle (load, execute, unload)
- Communication protocol (JSON I/O)

**Update when:** Plugin system changes.

---

#### `docs/architecture/execution-model.md`
**Purpose:** How tools execute (orchestrator → plugin → external tools)  
**Contains:**
- Execution flow
- Process isolation
- Error handling
- Timeout handling

**Update when:** Execution flow changes.

---

#### `docs/architecture/context-model.md`
**Purpose:** How context (config, auth, telemetry) flows through system  
**Contains:**
- Context passing mechanisms
- State management
- Config propagation

**Update when:** Context handling changes.

---

#### `docs/architecture/diagrams/`
**Purpose:** Visual architecture diagrams  
**Format:** Mermaid (text-based, AI-readable)  
**Why Mermaid?** Version controllable, AI can generate/modify  
**Contains:** Flow diagrams, sequence diagrams, component diagrams

**Create diagram when:** Architecture is hard to explain in text.

---

### `docs/ai/` - AI Assistant Context

**Most important folder for AI-assisted development.**

All files here are optimized for AI consumption (Claude, Cursor, Copilot).

---

#### `docs/ai/PROJECT-CONTEXT.md`
**Purpose:** Bootstrap context for new AI chat  
**Audience:** AI assistants (PRIMARY), you when onboarding  
**Contains:**
- What is this project?
- Current phase (MVP/Beta/Production)
- Tech stack
- Key constraints
- Current focus
- Where to read next

**When to use:** 
- Start of new Claude Code chat: `@docs/ai/PROJECT-CONTEXT.md`
- Opening Cursor on project: AI reads automatically via .cursorrules
- Onboarding new AI tool

**Update when:** Project phase changes, tech stack changes, focus shifts.

---

#### `docs/ai/CODING-GUIDELINES.md`
**Purpose:** How to write code in this project  
**Audience:** AI assistants, developers  
**Contains:**
- Code style (even with Prettier)
- Naming conventions
- File organization
- Import order
- Error handling patterns
- Testing patterns

**Update when:** New patterns emerge, team grows.

---

#### `docs/ai/ANTI-PATTERNS.md`
**Purpose:** What NOT to do (learned the hard way)  
**Audience:** AI assistants (prevents repeated mistakes)  
**Contains:**
- Failed approaches
- Common pitfalls
- "We tried X, it failed because Y"
- Deprecated patterns

**Critical for AI:** Prevents repeating mistakes across chat sessions.  
**Update when:** Something goes wrong and you learn from it.

---

#### `docs/ai/PROMPTS/`
**Purpose:** Reusable prompt templates for common tasks  
**Format:** One file per task type  
**Why separate files?** Easier to @mention specific prompt in AI chat

**Contains:**
- `implement-tool.md` - Template for adding new tool
- `design-review.md` - Template for architecture review
- `write-adr.md` - Template for creating ADR

**Usage example:**
```
User to AI: @docs/ai/PROMPTS/implement-tool.md
I want to add a K8s pod inspector tool
```

**Create new prompt when:** You repeat same task 3+ times.

---

### `templates/` - Code Boilerplates

Ready-to-use code templates. Copy-paste starting points.

---

#### `templates/tool-boilerplate/`
**Purpose:** Starting point for new tool/plugin  
**Contains:**
- `manifest.json` - Plugin metadata template
- `index.ts` - Plugin entry point skeleton
- `README.md` - Plugin documentation template
- `test.spec.ts` - Test file skeleton

**Usage:**
```bash
cp -r templates/tool-boilerplate src/plugins/category/new-tool
# Edit manifest.json, implement index.ts
```

**Update when:** Plugin structure requirements change.

---

### `.cursorrules`

**Purpose:** Cursor IDE AI configuration  
**Audience:** Cursor AI  
**Contains:**
- Links to key docs (PROJECT-CONTEXT, constraints)
- Quick reference for common tasks
- Instructions for AI behavior in this project

**Why root?** Cursor expects it there.  
**Update when:** Documentation structure changes, new patterns emerge.

---

## 🎯 Documentation Principles

### 1. **AI-First, Human-Readable**
- Write for AI assistants as primary audience
- But keep it readable for humans
- Use clear structure, avoid ambiguity

### 2. **DRY (Don't Repeat Yourself)**
- One source of truth per topic
- Cross-reference, don't duplicate
- Example: "See constraints.md" not "Here are the constraints again"

### 3. **Living Documentation**
- Update docs WHEN making changes, not after
- Stale docs worse than no docs
- Delete outdated content

### 4. **Progressive Disclosure**
- Start with README/VISION (high-level)
- Drill down to architecture (mid-level)
- ADRs for deep dives (low-level)

### 5. **Why Over What**
- Code shows WHAT
- Docs explain WHY
- Focus on reasoning, trade-offs, context

---

## 🔄 How to Evolve This Structure

### When to Add New Folder:
- Category has 5+ files
- Clear logical grouping
- Not a subcategory of existing folder

### When to Add New File:
- Topic deserves dedicated treatment
- Not fitting in existing file
- Will be referenced frequently

### When to Merge/Delete:
- Folder has <3 files for 6+ months
- Content no longer relevant
- Duplicate of another doc

### Restructuring Process:
1. Document reasoning in LESSONS-LEARNED.md
2. Update this file (00-DOCS-STRUCTURE.md)
3. Update .cursorrules references
4. Update docs/README.md navigation
5. Create ADR if architectural impact

---

## 📚 Documentation Lifecycle

### Phase 1: Creation
- Use templates (ADR, prompts)
- Fill in all sections
- Link related docs

### Phase 2: Maintenance
- Update when code changes
- Keep in sync with reality
- Add examples as you go

### Phase 3: Evolution
- Refactor when messy
- Split when too large
- Deprecate when obsolete

### Phase 4: Archival
- Move to `docs/archive/` if still valuable but obsolete
- Delete if truly outdated and no historical value

---

## 🎓 Best Practices

### For ADRs:
- Write when decision is made, not after
- Include alternatives considered
- Be honest about trade-offs
- Update status if superseded

### For AI Context:
- Keep PROJECT-CONTEXT.md under 2 pages
- ANTI-PATTERNS.md: specific examples, not vague "don't do X"
- PROMPTS: actual prompt text, not descriptions

### For Architecture:
- Diagrams > walls of text
- Show, don't just tell
- Update diagrams when architecture changes

### For Changelog:
- Group by version
- Format: [Added] [Changed] [Deprecated] [Removed] [Fixed] [Security]
- Link to issues/PRs when available

---

## 🚀 Quick Start for AI

**New AI session? Read in this order:**
1. `docs/ai/PROJECT-CONTEXT.md` - What is this?
2. `docs/architecture/constraints.md` - What NOT to do?
3. `docs/ai/CODING-GUIDELINES.md` - How to code?

**Adding feature? Check:**
1. `docs/ai/PROMPTS/` - Is there a template?
2. `docs/adr/` - Past decisions relevant?
3. `docs/ai/ANTI-PATTERNS.md` - What to avoid?

**Architecture question?**
1. `docs/architecture/OVERVIEW.md` - High-level view
2. `docs/architecture/<specific>.md` - Deep dive
3. `docs/adr/` - Historical context

---

## 📝 This File's Maintenance

**Update 00-DOCS-STRUCTURE.md when:**
- New folder/file added to docs/
- Documentation philosophy changes
- New documentation pattern emerges
- Restructuring happens

**Review frequency:** Monthly or when structure feels messy.

---

## 🎯 Success Metrics

Documentation is working if:
- ✅ AI can bootstrap context in <2 minutes
- ✅ You can switch AI tools without context loss
- ✅ New decisions reference past ADRs
- ✅ Anti-patterns prevent repeated mistakes
- ✅ You rarely re-explain project to AI

---

**Last updated:** 2025-02-18  
**Version:** 1.0  
**Maintainer:** Michał
