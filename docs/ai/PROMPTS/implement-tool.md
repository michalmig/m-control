# Prompt: Implement New Tool

Use this prompt template when adding a new tool/plugin to m-control.

---

## Prompt Template

```
I want to add a new tool to m-control:

**Tool Name:** [NAME]
**Category:** [CATEGORY] (e.g., AZDO, K8s, Git, Misc)
**Description:** [WHAT IT DOES]
**Type:** [internal (TypeScript) | external (Python/.NET/etc.)]
**Required Config:** [CONFIG KEYS NEEDED] (e.g., azdo.token, k8s.defaultContext)
**External Dependencies:** [APIS/TOOLS NEEDED] (e.g., Azure DevOps API, kubectl)

Please:
1. Create plugin structure following conventions in @docs/architecture/plugin-contract.md
2. Create manifest.json with proper metadata
3. Implement handler with error handling following @docs/architecture/constraints.md
4. Add to plugin registry (src/commands/index.ts) - unless we have dynamic discovery
5. Follow coding guidelines from @docs/ai/CODING-GUIDELINES.md
6. Provide usage example

Constraints to follow:
- @docs/architecture/constraints.md
- User-friendly error messages
- Validate inputs early
- Handle missing config gracefully
```

---

## Example Usage

### Example 1: Internal TypeScript Tool

```
I want to add a new tool to m-control:

**Tool Name:** Git Smart Commit
**Category:** Git
**Description:** Generate AI-powered commit message based on git diff
**Type:** internal (TypeScript)
**Required Config:** None (uses git binary from PATH)
**External Dependencies:** git CLI, Claude API (via orchestrator)

Please:
[... rest of template ...]
```

### Example 2: External Python Tool

```
I want to add a new tool to m-control:

**Tool Name:** K8s Pod Inspector
**Category:** K8s
**Description:** List pods in namespace with health status
**Type:** external (Python)
**Required Config:** k8s.defaultContext
**External Dependencies:** kubectl, kubernetes Python client

Please:
[... rest of template ...]
```

---

## What AI Should Deliver

### 1. Plugin Structure
```
src/plugins/category/tool-name/
  manifest.json
  index.ts (or main.py, etc.)
  README.md
  test.spec.ts (optional)
```

### 2. Manifest
```json
{
  "id": "tool-id",
  "name": "Display Name",
  "version": "0.1.0",
  "description": "What this tool does",
  "category": "category",
  "type": "internal",
  "requiredConfig": ["some.config.key"]
}
```

### 3. Implementation
Following all constraints from:
- `docs/architecture/constraints.md`
- `docs/ai/CODING-GUIDELINES.md`
- `docs/architecture/plugin-contract.md`

### 4. Registry Entry (if applicable)
```typescript
// src/commands/index.ts
import { execute as toolName } from '../plugins/category/tool-name';

export const commandGroups = [
  {
    name: 'Category',
    commands: [
      {
        id: 'tool-id',
        name: 'Tool Name',
        description: 'What it does',
        handler: toolName
      }
    ]
  }
];
```

### 5. Usage Example
```bash
# Interactive
mctl
> Select: Category
> Select: Tool Name

# Direct
mctl tool-id
```

---

## Checklist

After AI delivers implementation, verify:

- [ ] Follows naming conventions (kebab-case)
- [ ] manifest.json has all required fields
- [ ] Error handling present
- [ ] User-friendly error messages
- [ ] No hardcoded paths or credentials
- [ ] Cross-platform compatible (if applicable)
- [ ] Config validation (if requires config)
- [ ] README.md explains what it does
- [ ] Registered in command registry (if not using dynamic discovery)
- [ ] Works in both interactive and direct mode
- [ ] `npm run format` passes
- [ ] `npm run lint` passes

---

## Common Variations

### "Add External Tool (Python)"
Add to prompt:
```
**Implementation language:** Python
**Python version:** 3.9+
**Dependencies:** List in requirements.txt
**Entry point:** main.py
**Communication:** JSON via temp files
```

### "Add Tool with API Integration"
Add to prompt:
```
**API:** [Azure DevOps | Kubernetes | Claude | etc.]
**Authentication:** [Token in config | OAuth | API key]
**Rate limits:** [If applicable]
**Error scenarios:** [401, 429, 500, timeout]
```

### "Add Tool that Generates Files"
Add to prompt:
```
**Output format:** [.md | .json | .txt]
**Output location:** [temp dir | user specified]
**Overwrite behavior:** [Ask | Overwrite | Append]
```

---

## Related Prompts

- **design-review.md** - For reviewing architecture before implementing
- **write-adr.md** - If tool requires architectural decision

---

**Last updated:** 2025-02-18
