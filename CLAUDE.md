# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Files Quick Pick is a VS Code extension that enhances file navigation with quick access to modified files and powerful search capabilities using ripgrep. It provides special support for JavaScript monorepo environments.

## Common Development Commands

```bash
# Install dependencies
pnpm install

# Build the extension
pnpm run compile

# Watch mode for development
pnpm run watch

# Run linting
pnpm run lint

# Run tests
pnpm run test

# Create VSIX package for distribution
pnpm run package

# Full build pipeline (install, compile, package)
pnpm run assable
```

## Architecture

### Command Structure
The extension provides four main commands, each with dedicated keyboard shortcuts:
- **showModifiedFiles** (Cmd+Shift+G): Lists git-tracked modified files
- **searchFiles** (Cmd+Shift+'): Content search using ripgrep
- **searchInJsWorkspace** (Cmd+E): Context-aware search in JS monorepos
- **searchFilesInWorkspace** (Ctrl+Shift+P): File path search in workspaces

### Core Services
- **git-service.ts**: Handles all git operations, parses git status output
- **ripgrep-service.ts**: Manages ripgrep child processes for fast content search
- **workspace-utils.ts**: Detects and handles JavaScript workspace configurations (npm/yarn workspaces)

### Key Implementation Details
- Uses VS Code's QuickPick API with real-time updates during search
- Streams ripgrep results for performance with large codebases
- Persists search state using VS Code's ExtensionContext
- All async operations properly handle errors with user-friendly messages
- Child processes (git, ripgrep) are carefully managed to prevent resource leaks

### Testing Approach
Tests use VS Code's test framework. Run individual tests with:
```bash
pnpm run test -- --grep "test name"
```

### External Dependencies
- Requires git and ripgrep to be installed on the system
- No runtime npm dependencies, only VS Code API