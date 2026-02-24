# ADR-XXXX: [Decision Title]

**Status:** [Proposed | Accepted | Deprecated | Superseded by ADR-YYYY]  
**Date:** YYYY-MM-DD  
**Deciders:** [Names or "Michał + Claude"]  
**Tags:** [architecture, plugin, security, performance, etc.]

## Context

What is the issue we're facing? What forces are at play?

Describe:
- The problem or opportunity
- Relevant background
- Current constraints
- Why this decision is needed now

## Decision

What did we decide to do?

Be specific:
- What technology/pattern/approach?
- How will it be implemented?
- What are the key characteristics?

## Consequences

### Positive
What becomes easier or better?
- ✅ Benefit 1
- ✅ Benefit 2
- ✅ Benefit 3

### Negative
What becomes harder or worse?
- ❌ Drawback 1
- ❌ Drawback 2
- ❌ Drawback 3

### Neutral
What changes but is neither good nor bad?
- ⚪ Neutral change 1
- ⚪ Neutral change 2

## Alternatives Considered

What other options did we evaluate and why did we reject them?

### Option A: [Name]
**Description:** Brief description

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1
- Con 2

**Why rejected:** Reason

### Option B: [Name]
**Description:** Brief description

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1
- Con 2

**Why rejected:** Reason

## Implementation Notes

Any specific guidance for implementing this decision?

- Technical details
- Migration path (if applicable)
- Rollout strategy
- Testing approach
- Monitoring considerations

## Related Decisions

- **Supersedes:** ADR-XXXX (if applicable)
- **Related to:** ADR-YYYY
- **Depends on:** ADR-ZZZZ

## References

- Links to relevant documentation
- Research papers
- Blog posts
- GitHub issues

---

## Notes for Using This Template

### Status Guidelines
- **Proposed:** Decision under consideration
- **Accepted:** Decision approved and being implemented
- **Deprecated:** Decision no longer recommended but not replaced
- **Superseded:** Replaced by a newer decision (link to new ADR)

### When to Create an ADR
- ✅ Technology/framework choice
- ✅ Architecture pattern decision
- ✅ Breaking change
- ✅ Trade-off with long-term impact
- ❌ Bug fixes
- ❌ Minor implementation details
- ❌ Routine refactoring

### Tips for Good ADRs
1. **Be concise** - Aim for 1-2 pages
2. **Be specific** - Avoid vague statements
3. **Show your work** - Explain reasoning, not just decision
4. **Consider future** - Think 6-12 months ahead
5. **Be honest** - Acknowledge trade-offs and drawbacks

### Updating Status
If a decision is superseded:
1. Update status to "Superseded by ADR-YYYY"
2. Do NOT delete the old ADR
3. Create new ADR explaining the change
4. Link both ADRs to each other

---

**Copy this template when creating a new ADR:**
```bash
cp docs/adr/TEMPLATE.md docs/adr/XXXX-short-description.md
```

**Number format:** Use 4 digits with leading zeros (0001, 0002, etc.)
