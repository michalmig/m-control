# m-control - Quick Start Guide

## ✅ Co zostało zrobione

Projekt **m-control** (wersja 0.1.0) jest gotowy do użycia!

### Zaimplementowane funkcje:

- ✅ TypeScript orchestrator z TUI (prompts)
- ✅ Command registry z grupowaniem komend
- ✅ Config manager (automatyczna inicjalizacja przy pierwszym uruchomieniu)
- ✅ Pierwsza komenda: `hello-world`
- ✅ Wsparcie dla aliasów: `mctl` i `mm`
- ✅ Help command: `mctl --help`
- ✅ Direct command execution: `mctl hello-world`
- ✅ Interactive mode: wybór kategorii → wybór komendy
- ✅ ESLint + Prettier (code quality)
- ✅ VS Code / Cursor workspace config
- ✅ Build system (TypeScript → esbuild bundle)
- ✅ Windows installer script (PowerShell)
- ✅ Git repository initialized

---

## 🚀 Jak zacząć?

### 1. Rozpakuj projekt

```bash
# Windows (PowerShell)
Expand-Archive -Path m-control.tar.gz -DestinationPath C:\Dev\

# Linux/macOS
tar -xzf m-control.tar.gz -C ~/Dev/
cd ~/Dev/m-control
```

### 2. Zainstaluj dependencies

```bash
npm install
```

### 3. Zbuduj projekt

```bash
npm run build
```

### 4. Test w trybie dev

```bash
# Interactive mode
npm run dev

# Direct command
npm run dev hello-world

# Help
npm run dev -- --help
```

### 5. Instalacja systemowa (Windows)

```powershell
.\scripts\install.ps1
```

To:
- Zbuduje projekt
- Skopiuje do `%USERPROFILE%\.m-control`
- Doda do PATH
- Utworzy aliasy `mctl` i `mm`
- Zainicjalizuje config

**WAŻNE:** Po instalacji **zrestartuj terminal**.

### 6. Pierwsze uruchomienie

```bash
mctl
# lub
mm
```

Przy pierwszym uruchomieniu:
- Zostanie utworzony plik konfiguracyjny w `~/.m-control/config.json`
- Uzupełnij w nim swoje tokeny/credentials

---

## 📂 Struktura projektu

```
m-control/
├── .vscode/              # VS Code/Cursor config
│   ├── settings.json     # Auto-format, lint on save
│   ├── launch.json       # Debug configs
│   └── extensions.json   # Recommended extensions
├── src/
│   ├── index.ts          # Main entry point (router)
│   ├── commands/
│   │   ├── index.ts      # Command registry
│   │   └── misc/
│   │       └── hello-world.ts
│   ├── core/
│   │   ├── config.ts     # Config manager
│   │   ├── tool-runner.ts # External tool executor (future)
│   │   └── types.ts      # Shared types
│   └── ui/
│       └── interactive.ts # TUI (prompts)
├── scripts/
│   ├── bundle.js         # Build script (esbuild)
│   └── install.ps1       # Windows installer
├── config/
│   └── config.template.json # Default config structure
├── .cursorrules          # Cursor AI guidelines
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔧 Development Workflow

### Dodawanie nowej komendy

#### 1. Utwórz handler

```typescript
// src/commands/misc/my-new-command.ts
export async function myNewCommand(): Promise<void> {
  console.log('Doing something cool!');
}
```

#### 2. Dodaj do registry

```typescript
// src/commands/index.ts
import { myNewCommand } from './misc/my-new-command';

export const commandGroups: CommandGroup[] = [
  {
    name: 'Misc',
    commands: [
      // ... existing commands
      {
        id: 'my-new-command',
        name: 'My New Command',
        description: 'Does something cool',
        handler: myNewCommand,
      },
    ],
  },
];
```

#### 3. Test

```bash
npm run dev my-new-command
```

#### 4. Build & deploy

```bash
npm run build
# Następnie zainstaluj ponownie lub skopiuj dist/mctl.js
```

---

## 🎯 Następne kroki

### Gotowe do implementacji:

1. **Azure DevOps PR Review**
   - Kategoria: `AZDO`
   - Handler: pobierz diff → wywołaj Claude API → generuj .md

2. **Kubernetes Helper**
   - Kategoria: `K8s`
   - Możliwe podejścia:
     - TypeScript z `@kubernetes/client-node`
     - Python tool wywołany przez tool-runner

3. **Obsidian Launcher**
   - Kategoria: `Notes`
   - PowerShell/Node do otwierania vault

4. **Git Tools**
   - Kategoria: `Git`
   - TypeScript z `simple-git`

### Architektura dla polyglot tools:

```typescript
// Przykład: Python k8s tool
const manifest: ToolManifest = {
  id: 'k8s-pods',
  name: 'K8s Pod Inspector',
  executable: 'python',
  entryPoint: 'tools/k8s/main.py',
};

await executeTool(manifest, { namespace: 'prod' }, config);
```

---

## 🐛 Debugging

### VS Code / Cursor

1. Otwórz projekt w Cursor
2. Przejdź do Debug panel (Ctrl+Shift+D)
3. Wybierz:
   - "Debug: Interactive Mode" - uruchomi `mctl` w trybie interaktywnym
   - "Debug: Hello World" - uruchomi `mctl hello-world`
4. Ustaw breakpointy w kodzie
5. F5 → debug!

### Manual

```bash
# Uruchom z ts-node bezpośrednio
npx ts-node src/index.ts
npx ts-node src/index.ts hello-world
```

---

## 📋 Available Scripts

```bash
npm run dev              # Run in dev mode (ts-node)
npm run build            # Build (tsc + esbuild)
npm run lint             # Check code quality
npm run format           # Auto-fix formatting
```

---

## ⚙️ Konfiguracja

Plik: `~/.m-control/config.json`

```json
{
  "version": "0.1.0",
  "tools": {
    "azdo": {
      "token": "your-pat-token-here",
      "organization": "your-org"
    },
    "k8s": {
      "defaultContext": "your-k8s-context"
    },
    "obsidian": {
      "vaultPath": "C:\\path\\to\\obsidian\\vault"
    }
  }
}
```

---

## 🎉 Gotowe!

Projekt jest w pełni funkcjonalny. Możesz:

1. ✅ Uruchomić `mctl` / `mm` (interactive mode)
2. ✅ Wywołać `mctl hello-world` (direct command)
3. ✅ Dodawać nowe komendy
4. ✅ Używać w Cursor z AI assistance
5. ✅ Debugować w VS Code
6. ✅ Rozbudowywać o polyglot tools (Python, .NET, etc.)

**Powodzenia w budowaniu swojego command center!** 🚀
