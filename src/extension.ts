// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "git-modified-quick-pick" is now active!');

	const disposable = vscode.commands.registerCommand('git-modified-quick-pick.showModifiedFiles', async () => {
		try {
			// Get the current workspace folder
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {
				vscode.window.showErrorMessage('No workspace folder found');
				return;
			}

			// Execute git status command
			const gitStatus = cp.spawnSync('git', ['status', '--porcelain'], {
				cwd: workspaceFolder.uri.fsPath,
				encoding: 'utf8'
			});

			if (gitStatus.error) {
				vscode.window.showErrorMessage('Failed to get git status: ' + gitStatus.error.message);
				return;
			}

			// Parse the output to get modified files
			const modifiedFiles = gitStatus.stdout
				.split('\n')
				.filter(line => line.trim())
				.map(line => {
					const status = line.substring(0, 2).trim();
					const filePath = line.substring(3);
					return {
						label: filePath,
						description: status,
						filePath: filePath
					};
				});

			if (modifiedFiles.length === 0) {
				vscode.window.showInformationMessage('No modified files found');
				return;
			}

			// Show quick pick
			const selectedFile = await vscode.window.showQuickPick(modifiedFiles, {
				placeHolder: 'Select a modified file to open'
			});

			if (selectedFile) {
				const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, selectedFile.filePath);
				const document = await vscode.workspace.openTextDocument(fileUri);
				await vscode.window.showTextDocument(document);
			}
		} catch (error) {
			vscode.window.showErrorMessage('Error: ' + (error as Error).message);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
