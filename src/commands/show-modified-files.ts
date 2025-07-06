import * as vscode from 'vscode';
import { FileItem, FilePickerCommand } from '../types/file-picker';
import { GitService } from '../services/git-service';
import { openFile, showNoFilesMessage, showError, setupQuickPickCopyHandler } from '../utils/file-utils';

export class ShowModifiedFilesCommand implements FilePickerCommand {
    async execute(): Promise<void> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder found');
            }

            const modifiedFiles = await GitService.getModifiedFiles(workspaceFolder);

            if (modifiedFiles.length === 0) {
                showNoFilesMessage('No modified files found');
                return;
            }

            // Create quick pick instead of using showQuickPick
            const quickPick = vscode.window.createQuickPick<FileItem>();
            quickPick.items = modifiedFiles;
            quickPick.placeholder = 'Select a modified file to open';
            
            // Setup copy handler
            setupQuickPickCopyHandler(quickPick, workspaceFolder);

            // Handle selection
            quickPick.onDidAccept(async () => {
                const selectedFile = quickPick.selectedItems[0];
                if (selectedFile) {
                    await openFile(selectedFile, workspaceFolder);
                }
                quickPick.dispose();
            });

            // Handle cancellation
            quickPick.onDidHide(() => {
                quickPick.dispose();
            });

            quickPick.show();
        } catch (error) {
            showError(error as Error);
        }
    }
} 