# m-control Documentation

Welcome to the m-control documentation. This guide will help you navigate the documentation structure and find what you need.

## 📖 Start Here

**New to the project?**
1. Read [VISION.md](VISION.md) - Understand what m-control is and where it's going
2. Read [architecture/OVERVIEW.md](architecture/OVERVIEW.md) - High-level technical overview
3. Read [adr/](adr/) - Understand key decisions made

**Working with AI assistants?**
1. Start with [ai/PROJECT-CONTEXT.md](ai/PROJECT-CONTEXT.md) - Bootstrap context
2. Check [ai/CODING-GUIDELINES.md](ai/CODING-GUIDELINES.md) - Code patterns
3. Review [ai/ANTI-PATTERNS.md](ai/ANTI-PATTERNS.md) - What NOT to do
4. Use [ai/PROMPTS/](ai/PROMPTS/) - Reusable prompt templates

**Making architectural changes?**
1. Review [architecture/constraints.md](architecture/constraints.md) - Non-negotiable rules
2. Check [adr/](adr/) - Past decisions to avoid conflicts
3. Create new ADR using [adr/TEMPLATE.md](adr/TEMPLATE.md)

## 📂 Documentation Structure

```
docs/
├── README.md                    👈 You are here
├── 00-DOCS-STRUCTURE.md         📋 Meta-docs (how docs work)
├── VISION.md                    🎯 Product north star
│
├── adr/                         📝 Architecture Decision Records
│   ├── TEMPLATE.md              
│   └── 0001-*.md                
│
├── architecture/                🏗️ Technical architecture
│   ├── OVERVIEW.md              
│   ├── constraints.md           ⚠️ "Constitution"
│   ├── plugin-contract.md       
│   ├── execution-model.md       
│   ├── context-model.md         
│   └── diagrams/                
│
└── ai/                          🤖 AI assistant context
    ├── PROJECT-CONTEXT.md       🚀 Bootstrap new AI chat
    ├── CODING-GUIDELINES.md     
    ├── ANTI-PATTERNS.md         
    └── PROMPTS/                 
```

## 🎯 Quick Links

### For Developers
- [Getting Started](../CONTRIBUTING.md#getting-started)
- [Adding New Tools](../CONTRIBUTING.md#adding-new-toolsplugins)
- [Code Style](ai/CODING-GUIDELINES.md)
- [Architecture Overview](architecture/OVERVIEW.md)

### For Product Understanding
- [Vision & Roadmap](VISION.md)
- [Architecture Decisions](adr/)
- [Lessons Learned](../LESSONS-LEARNED.md)

### For AI Assistants
- [Project Context](ai/PROJECT-CONTEXT.md) ⭐ START HERE
- [Coding Guidelines](ai/CODING-GUIDELINES.md)
- [Anti-Patterns](ai/ANTI-PATTERNS.md)
- [Prompt Templates](ai/PROMPTS/)

### For Understanding Docs
- [Documentation Structure Guide](00-DOCS-STRUCTURE.md) - Meta-documentation

## 🔍 Finding What You Need

### "I want to understand the project vision"
→ [VISION.md](VISION.md)

### "I want to know why we chose X over Y"
→ [adr/](adr/) - Search for relevant ADR

### "I want to add a new feature"
→ [ai/PROMPTS/implement-tool.md](ai/PROMPTS/implement-tool.md)

### "I want to understand the architecture"
→ [architecture/OVERVIEW.md](architecture/OVERVIEW.md)

### "I made a mistake and want to prevent it in future"
→ Add to [ai/ANTI-PATTERNS.md](ai/ANTI-PATTERNS.md)

### "I'm using AI and need context"
→ [ai/PROJECT-CONTEXT.md](ai/PROJECT-CONTEXT.md)

### "I don't know how the docs are organized"
→ [00-DOCS-STRUCTURE.md](00-DOCS-STRUCTURE.md)

## 📝 Contributing to Docs

### When to Update Docs
- **Always:** Architecture changes → update `architecture/*.md`
- **Always:** New decision → create ADR in `adr/`
- **Often:** New pattern emerges → update `ai/CODING-GUIDELINES.md`
- **Often:** Mistake made → add to `ai/ANTI-PATTERNS.md`
- **Sometimes:** Vision shifts → update `VISION.md`

### Documentation Principles
1. **AI-First:** Write for AI assistants as primary audience
2. **DRY:** One source of truth per topic
3. **Living:** Update when changes happen, not after
4. **Why Over What:** Code shows what, docs explain why

See [00-DOCS-STRUCTURE.md](00-DOCS-STRUCTURE.md#-documentation-principles) for details.

## 🗺️ Documentation Roadmap

### Current State (v1.0)
- ✅ Core structure established
- ✅ AI context bootstrapping
- ✅ Architecture foundation
- ✅ ADR system ready

### Near Future
- [ ] API documentation (when API stabilizes)
- [ ] User guides (when features solidify)
- [ ] Plugin development guide (when plugin system complete)
- [ ] Troubleshooting guide (when common issues emerge)

### Long Term
- [ ] Video tutorials
- [ ] Interactive examples
- [ ] Community contribution guides
- [ ] Internationalization

---

**Questions about documentation?**  
See [00-DOCS-STRUCTURE.md](00-DOCS-STRUCTURE.md) or update this README to answer common questions.

**Last updated:** 2025-02-18
