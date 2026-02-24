# Contributing to m-control

This document describes how to work with the m-control project. It's primarily for Michał (project owner) but also serves as a guide for future contributors and AI assistants.

## 🎯 Project Philosophy

**This is an evolving product, not a finished library.**
- MVP first, optimize later
- Ship fast, iterate based on real usage
- Document decisions (ADRs), not just code
- AI-assisted development is the default

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup
```bash
git clone <repo>
cd m-control
npm install  # or yarn install
npm run build
```

### Development Workflow
```bash
npm run dev              # Run in dev mode (ts-node)
npm run dev hello-world  # Test specific command
npm run lint             # Check code quality
npm run format           # Auto-fix formatting
npm run build            # Build for production
```

## 📝 Adding New Tools/Plugins

### Quick Start
1. **Use the template:**
   ```bash
   cp -r templates/tool-boilerplate src/plugins/category/new-tool
   ```

2. **Edit manifest:**
   ```json
   // src/plugins/category/new-tool/manifest.json
   {
     "id": "new-tool",
     "name": "New Tool",
     "version": "0.1.0",
     "category": "category",
     "description": "What this tool does"
   }
   ```

3. **Implement handler:**
   ```typescript
   // src/plugins/category/new-tool/index.ts
   export async function execute(): Promise<void> {
     // Implementation
   }
   ```

4. **Test:**
   ```bash
   npm run dev new-tool
   ```

### Detailed Guide
See `docs/ai/PROMPTS/implement-tool.md` for step-by-step AI-assisted implementation.

## 🏗️ Architecture Decisions

### When to Create an ADR
Create an Architecture Decision Record (ADR) when:
- Choosing technology/framework
- Defining architecture patterns
- Making trade-offs with long-term impact
- Changing existing architectural decisions

### How to Create an ADR
1. **Copy template:**
   ```bash
   cp docs/adr/TEMPLATE.md docs/adr/000X-short-title.md
   ```

2. **Fill in sections:**
   - Context: What problem are we solving?
   - Decision: What did we decide?
   - Consequences: What are the trade-offs?
   - Alternatives: What else did we consider?

3. **Get review** (from AI or future self)

4. **Update status** if later superseded

See `docs/ai/PROMPTS/write-adr.md` for AI-assisted ADR writing.

## 🧪 Testing

### Current Approach (MVP)
- Manual testing via `npm run dev`
- Build verification via `npm run build`

### Future (when needed)
- Unit tests (Jest)
- Integration tests
- E2E tests (for critical workflows)

## 📚 Documentation

### When to Update Docs
- **Always:** When making architectural changes
- **Always:** When adding new constraints
- **Often:** When discovering anti-patterns
- **Sometimes:** When adding new features (if complex)

### Key Files to Update
- `CHANGELOG.md` - When releasing
- `LESSONS-LEARNED.md` - When pivoting or learning
- `docs/adr/` - When deciding
- `docs/ai/ANTI-PATTERNS.md` - When failing
- `docs/architecture/*.md` - When architecture changes

## 🎨 Code Style

### Enforced by Tools
- **ESLint** - Catches errors and enforces patterns
- **Prettier** - Formats code consistently

Run `npm run format` before committing.

### Manual Guidelines
See `docs/ai/CODING-GUIDELINES.md` for detailed patterns.

**Quick reference:**
- Use TypeScript strict mode
- Prefer `async/await` over callbacks
- Use structured logging (not `console.log`)
- Handle errors gracefully
- Think: local AND cloud modes

## 🚫 What NOT to Do

See `docs/architecture/constraints.md` for the complete "constitution".

**Critical:**
- ❌ Don't hardcode credentials
- ❌ Don't break config compatibility without migration
- ❌ Don't couple plugins to orchestrator internals
- ❌ Don't use `console.log` (use logger service)

## 🔄 Release Process

### Versioning
Follow Semantic Versioning (SemVer):
- **Major (1.0.0):** Breaking changes
- **Minor (0.1.0):** New features, backward compatible
- **Patch (0.0.1):** Bug fixes

### Release Checklist
1. Update `CHANGELOG.md`
2. Bump version in `package.json`
3. Run `npm run build` and test
4. Commit: `git commit -m "Release v0.X.0"`
5. Tag: `git tag v0.X.0`
6. Push: `git push && git push --tags`

## 🤖 Working with AI Assistants

### Best Practices
1. **Start new sessions with context:**
   ```
   @docs/ai/PROJECT-CONTEXT.md
   ```

2. **Reference constraints:**
   ```
   Follow guidelines in docs/architecture/constraints.md
   ```

3. **Use prompt templates:**
   ```
   @docs/ai/PROMPTS/implement-tool.md
   I want to add tool X
   ```

4. **Document learnings:**
   - Update `docs/ai/ANTI-PATTERNS.md` when AI makes mistakes
   - Update `docs/ai/CODING-GUIDELINES.md` when good patterns emerge

### AI Tool Configuration
- **Cursor:** Uses `.cursorrules` (references docs/)
- **Claude Code:** Mention `@docs/ai/PROJECT-CONTEXT.md` manually
- **Copilot:** Uses `.github/copilot-instructions.md` (if created)

## 🐛 Troubleshooting

### Build Issues
```bash
# Clean rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Type Errors
```bash
# Check tsconfig.json
# Ensure @types/* packages installed
npm install -D @types/node @types/prompts
```

### ESLint/Prettier Conflicts
```bash
# Auto-fix most issues
npm run format
npm run lint -- --fix
```

## 📞 Getting Help

### For Michał (Self-Help)
1. Check `docs/ai/ANTI-PATTERNS.md` - Did I try this before?
2. Check `docs/adr/` - What did I decide previously?
3. Check `LESSONS-LEARNED.md` - Why did I change direction?
4. Ask AI with context: `@docs/ai/PROJECT-CONTEXT.md <question>`

### For Future Contributors
- Read `docs/README.md` - Documentation navigation
- Read `docs/VISION.md` - Product direction
- Read `docs/architecture/OVERVIEW.md` - How it works
- Open issue on GitHub (when applicable)

## 🎯 Current Focus (as of 2025-02-18)

**Phase:** MVP  
**Goal:** Build core tools for personal use  
**Next steps:**
1. Implement plugin architecture
2. Add first real tool (AZDO PR review)
3. Test with Stream Deck integration

See `docs/VISION.md` for long-term roadmap.

---

**Remember:** This is YOUR project. Experiment, iterate, learn. Document the important stuff, ship the rest.
