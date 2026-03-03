# Prompt: Design Review

Use this prompt when you want AI to review an architectural decision or implementation approach.

---

## Prompt Template

```
I'm planning to [IMPLEMENT/CHANGE] [FEATURE/COMPONENT] in m-control.

**Current context:**
@docs/ai/PROJECT-CONTEXT.md

**Proposed approach:**
[Describe your approach in detail]

**Concerns:**
[What you're unsure about]

Please review this design considering:
1. **Constraints:** @docs/architecture/constraints.md - Am I violating any rules?
2. **Architecture:** @ONBOARDING.md - Does this fit the architecture?
3. **Patterns:** @docs/ai/CODING-GUIDELINES.md - Am I following best practices?
4. **Past decisions:** @docs/adr/ - Does this conflict with past ADRs?
5. **Anti-patterns:** @docs/ai/ANTI-PATTERNS.md - Am I repeating past mistakes?

Provide:
- ✅ What's good about this approach
- ⚠️ Potential issues or risks
- 🔄 Alternative approaches (if major issues)
- 📝 Suggestions for improvement
```

---

## Example Usage

### Example 1: Plugin Discovery System

```
I'm planning to IMPLEMENT a plugin discovery system in m-control.

**Proposed approach:**
- Scan `src/plugins/` directory at startup
- Load manifest.json from each subfolder
- Register commands dynamically
- Use fs.readdir() to find plugins
- Cache loaded plugins in memory

**Concerns:**
- Performance - will scanning directory on every startup be slow?
- Security - what if someone adds malicious plugin?
- Testing - how to test dynamic loading?

Please review this design considering:
[... rest of template ...]
```

### Example 2: Config Encryption

```
I'm planning to CHANGE config storage to encrypt sensitive values in m-control.

**Proposed approach:**
- Use OS keychain (Windows Credential Manager, macOS Keychain, Linux Secret Service)
- Store only sensitive values (tokens) in keychain
- Keep non-sensitive config in JSON file
- Library: keytar (Node.js bindings for native keychains)

**Concerns:**
- Cross-platform compatibility - will this work on all platforms?
- Migration - how to migrate existing plaintext configs?
- Fallback - what if keychain unavailable?

Please review this design considering:
[... rest of template ...]
```

---

## What AI Should Deliver

### 1. Validation Against Constraints
```
✅ GOOD: Approach respects constraints
- Uses OS keychain (not plaintext)
- Cross-platform consideration present
- Migration plan mentioned

⚠️ CONCERN: Potential constraint violations
- Library 'keytar' is deprecated - use @electron/keytar or better alternative
- Need fallback for headless environments (CI/CD)
```

### 2. Architectural Fit
```
✅ GOOD: Fits architecture
- Aligns with hybrid local/cloud model
- Maintains plugin isolation

⚠️ CONCERN: Architectural misalignment
- Keychain access from plugins violates service locator pattern
- Should be accessed via context.auth.getToken()
```

### 3. Pattern Compliance
```
✅ GOOD: Follows coding guidelines
- Early validation mentioned
- Error handling considered

⚠️ CONCERN: Pattern deviations
- Synchronous keychain access might block event loop
- Consider async API
```

### 4. Conflict with Past Decisions
```
⚠️ CONCERN: Conflicts with ADR-0001
ADR-0001 chose TypeScript for simplicity
Native keychain bindings add complexity

Suggestion: Document this trade-off in new ADR
```

### 5. Anti-Pattern Check
```
✅ GOOD: Avoids known anti-patterns
- Not hardcoding paths
- Not storing secrets in logs

⚠️ CONCERN: Similar to past mistake
- We tried native bindings before (different library)
- Consider pure-JS implementation first
```

### 6. Recommendations
```
🔄 Alternative: Pure JavaScript encryption
Instead of OS keychain:
- Use node-forge or crypto for AES encryption
- Derive key from master password
- Pros: No native deps, fully cross-platform
- Cons: User must remember password

📝 Improvements:
1. Add ADR for this decision (significant change)
2. Implement feature flag (gradual rollout)
3. Add migration script with backup
4. Test on all platforms before release
```

---

## Checklist

After receiving review, verify:

- [ ] All constraints addressed
- [ ] Architectural fit confirmed
- [ ] Patterns compliance validated
- [ ] No conflicts with past ADRs
- [ ] Anti-patterns avoided
- [ ] Alternatives considered
- [ ] Action items clear

---

## When to Use This Prompt

**Use for:**
- ✅ New major features
- ✅ Architectural changes
- ✅ Breaking changes
- ✅ Security-sensitive changes
- ✅ Performance-critical changes

**Don't use for:**
- ❌ Minor bug fixes
- ❌ Refactoring without behavior change
- ❌ Documentation updates
- ❌ Trivial changes

---

## Follow-up Actions

After design review:

### If Major Issues Found
1. Revise approach
2. Create ADR documenting decision
3. Update anti-patterns if mistake identified
4. Re-review revised approach

### If Minor Issues Found
1. Address suggestions
2. Proceed with implementation
3. Document decision if significant

### If Approved
1. Create ADR if architectural
2. Implement following guidelines
3. Update docs if needed

---

## Related Prompts

- **implement-tool.md** - After design approved, implement
- **write-adr.md** - If decision requires ADR

---

**Last updated:** 2025-02-18
