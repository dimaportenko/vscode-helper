# Files Quick Pick

A VS Code extension that allows you to quickly navigate through modified git files in your workspace. Shows a list of all changed files with their git status and allows you to open them with a single click.

## Features

- Shows a quick pick list of all modified git files
- Displays git status for each file (M for modified, A for added, D for deleted, etc.)
- Quick keyboard shortcut access
- Opens selected file directly in the editor
- Search files by content using ripgrep
- Smart JavaScript workspace detection and search
- Search files by path in JavaScript workspaces
- Persistent search state across sessions
- Line number navigation in search results
- **Copy file paths**: Quickly copy relative file paths to clipboard with `Cmd+C` (Mac) or `Ctrl+C` (Windows/Linux)

## Installation

### Option 1: Install from VSIX (Recommended)

1. Download the latest VSIX package from the releases
2. Open VS Code/Cursor
3. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
4. Type "Extensions: Install from VSIX"
5. Select the downloaded VSIX file
6. Reload the editor when prompted

### Option 2: Development Mode Installation

1. Clone this repository
2. Open the project in VS Code/Cursor
3. Press `F5` to start debugging
4. A new editor window will open with the extension loaded
5. The extension will be available in this development window

### Building the VSIX Package

To create a VSIX package for distribution:

1. Make sure all dependencies are installed:
   ```bash
   pnpm install
   ```

2. Compile the TypeScript code:
   ```bash
   pnpm run compile
   ```

3. Create the VSIX package:
   ```bash
   pnpm run package
   ```

The VSIX file will be created in the project root directory.

## Usage

### Keyboard Shortcuts

- Show Modified Files:
  - Mac: `Cmd+Shift+G`
  - Windows/Linux: `Ctrl+Shift+G`

- Search Files by Content:
  - Mac: `Cmd+Shift+'`
  - Windows/Linux: `Ctrl+Shift+'`

- Search in JS Workspace:
  - Mac: `Cmd+E`
  - Windows/Linux: `Ctrl+E`

- Search Files in Workspace:
  - Mac: `Ctrl+Shift+P`
  - Windows/Linux: `Ctrl+Shift+P`

- Copy File Path (when file picker is open):
  - Mac: `Cmd+C`
  - Windows/Linux: `Ctrl+C`

### Copy File Path Feature

When any file picker is open, you can quickly copy the relative file path of the currently highlighted item:

1. Open any file picker command using the keyboard shortcuts above
2. Use arrow keys to navigate and highlight any file in the list
3. Press `Cmd+C` (Mac) or `Ctrl+C` (Windows/Linux) to copy the relative file path
4. The file path is copied to your clipboard and a confirmation appears in the status bar
5. The file picker remains open so you can continue browsing and copy multiple paths

This feature works with all file picker commands:
- Show Modified Files
- Search Files by Content  
- Search in JS Workspace
- Search Files in Workspace

### Command Palette

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type one of the following commands:
   - "Files Quick Pick: Show Modified Files"
   - "Files Quick Pick: Search Files by Content"
   - "Files Quick Pick: Search in JS Workspace"
   - "Files Quick Pick: Search Files in Workspace"
3. Select the command from the list

## Requirements

- [VS Code](https://code.visualstudio.com/) or [Cursor](https://cursor.sh/) editor
- [Git](https://git-scm.com/) installed on your system
- A git repository open in the editor
- [ripgrep](https://github.com/BurntSushi/ripgrep) installed for content search functionality

## Troubleshooting

If the extension doesn't work as expected:

1. Make sure you have a git repository open in your workspace
2. Check that git is properly installed and accessible from the command line
3. Verify that there are modified files in your repository
4. Try reloading the editor window

## Contributing

Feel free to submit issues and enhancement requests!

## License

This extension is licensed under the MIT License.
