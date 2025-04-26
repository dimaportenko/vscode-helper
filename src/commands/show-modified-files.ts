import * as vscode from 'vscode';
import { FilePickerCommand } from '../types/file-picker';
import { GitService } from '../services/git-service';
import { openFile, showNoFilesMessage, showError } from '../utils/file-utils';

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

            const selectedFile = await vscode.window.showQuickPick(modifiedFiles, {
                placeHolder: 'Select a modified file to open'
            });

            if (selectedFile) {
                await openFile(selectedFile, workspaceFolder);
            }
        } catch (error) {
            showError(error as Error);
        }
    }
} 