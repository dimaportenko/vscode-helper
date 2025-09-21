# AGENTS.md - Coding Agent Instructions

## Build Commands
```bash
pnpm install               # Install dependencies
pnpm run compile          # Build extension
pnpm run watch            # Watch mode for development
pnpm run lint             # Run ESLint
pnpm run test             # Run all tests
pnpm run test -- --grep "test name"  # Run single test
pnpm run package          # Create VSIX package
```

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, target ES2022, module Node16
- **Imports**: Use `import * as vscode from 'vscode'` for VS Code API, camelCase/PascalCase for imports
- **Formatting**: Semicolons required, use curly braces, strict equality (===)
- **Naming**: Commands use kebab-case (files-quick-pick.commandName), files use kebab-case, classes PascalCase
- **Error Handling**: All async operations must handle errors with user-friendly vscode.window.showErrorMessage()
- **Types**: Define interfaces in types/ directory, use explicit return types for public methods
- **VS Code API**: Use QuickPick for UI, properly dispose resources in deactivate(), manage child processes carefully
- **Testing**: Use VS Code test framework, place tests in src/test/, mock VS Code API where needed
- **Dependencies**: No runtime npm dependencies, only VS Code API. Requires git and ripgrep system tools