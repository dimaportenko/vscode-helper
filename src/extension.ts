// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ShowModifiedFilesCommand } from "./commands/show-modified-files";
import { SearchFilesCommand } from "./commands/search-files";
import { SearchInJsWorkspaceCommand } from "./commands/search-in-js-workspace";
import { SearchFilesInWorkspaceCommand } from "./commands/search-files-in-workspace";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "files-quick-pick" is now active!'
  );

  const showModifiedFilesCommand = new ShowModifiedFilesCommand();
  const searchFilesCommand = new SearchFilesCommand();
  const searchInJsWorkspaceCommand = new SearchInJsWorkspaceCommand(context);
  const searchFilesInWorkspaceCommand = new SearchFilesInWorkspaceCommand(context);

  const modifiedFilesDisposable = vscode.commands.registerCommand(
    "files-quick-pick.showModifiedFiles",
    () => showModifiedFilesCommand.execute()
  );

  const searchFilesDisposable = vscode.commands.registerCommand(
    "files-quick-pick.searchFiles",
    () => searchFilesCommand.execute()
  );

  const searchInJsWorkspaceDisposable = vscode.commands.registerCommand(
    "files-quick-pick.searchInJsWorkspace",
    () => searchInJsWorkspaceCommand.execute()
  );

  const searchFilesInWorkspaceDisposable = vscode.commands.registerCommand(
    "files-quick-pick.searchFilesInWorkspace",
    () => searchFilesInWorkspaceCommand.execute()
  );

  context.subscriptions.push(
    modifiedFilesDisposable,
    searchFilesDisposable,
    searchInJsWorkspaceDisposable,
    searchFilesInWorkspaceDisposable
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
