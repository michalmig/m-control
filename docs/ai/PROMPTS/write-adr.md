# Prompt: Write ADR (Architecture Decision Record)

Use this prompt when you've made a significant technical decision and need to document it properly.

---

## When to Write an ADR

Write an ADR when the decision:
- Affects the overall architecture or plugin contract
- Is hard to reverse (high cost of change)
- Involves non-obvious trade-offs
- Others might question later ("why did we do it this way?")

**Don't** write ADRs for: naming conventions, minor refactors, config tweaks.

---

## Prompt Template

```
Write an ADR for m-control using docs/adr/TEMPLATE.md.

**Decision:** [One sentence summary of what was decided]
**Context:** [What problem needed solving? What alternatives existed?]
**Chosen approach:** [What we're doing]
**Rejected alternatives:**
  - [Option A] — why rejected
  - [Option B] — why rejected
**Key trade-offs:** [What are we giving up? What do we gain?]
**Consequences:** [What changes? What becomes easier/harder?]

ADR number: [Next number from docs/adr/ directory]

Reference constraints from @docs/architecture/constraints.md where relevant.
Link to related ADRs if applicable.
```

---

## Example Usage

```
Write an ADR for m-control using docs/adr/TEMPLATE.md.

**Decision:** Use JSON-over-stdin/stdout as the IPC protocol for external plugins
**Context:** External polyglot plugins (Python, .NET) need to communicate with
  the TypeScript orchestrator. Options: shared temp files, named pipes, HTTP, stdio.
**Chosen approach:** JSON via stdin/stdout — write JSON to stdin, read JSON from stdout
**Rejected alternatives:**
  - Temp files — cross-platform path headaches, cleanup burden
  - HTTP — overkill for local CLI, port conflicts
  - Named pipes — OS-specific implementation differences
**Key trade-offs:** Can't stream large payloads efficiently, but fits typical CLI use case
**Consequences:** All external plugins must serialize output as JSON; orchestrator
  must handle subprocess lifecycle and timeout

ADR number: 0002
```

---

## What AI Should Deliver

A complete ADR file following `docs/adr/TEMPLATE.md`:

```markdown
# ADR-XXXX: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-YYYY
**Date:** YYYY-MM-DD
**Context:** ...
**Decision:** ...
**Consequences:** ...
**Alternatives considered:** ...
```

---

## Checklist After AI Delivers

- [ ] Status is correct (usually "Accepted" if already implemented)
- [ ] Date is today
- [ ] "Why" is clear — future-you should understand the reasoning
- [ ] Alternatives actually considered (not just "we didn't think of this")
- [ ] Consequences are honest (include negatives)
- [ ] File saved as `docs/adr/XXXX-kebab-case-title.md`
- [ ] CHANGELOG.md updated if the decision caused visible changes

---

## Related Prompts

- **design-review.md** — Review an architecture decision before committing
- **implement-tool.md** — Implement a tool after architecture is decided

---

**Last updated:** 2025-02-18
