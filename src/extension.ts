// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import { ShowModifiedFilesCommand } from './commands/show-modified-files';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "files-quick-pick" is now active!');

	const showModifiedFilesCommand = new ShowModifiedFilesCommand();
	const disposable = vscode.commands.registerCommand(
		'files-quick-pick.showModifiedFiles',
		() => showModifiedFilesCommand.execute()
	);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
