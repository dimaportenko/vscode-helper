import * as vscode from 'vscode';
import { FileItem } from '../types/file-picker';

export async function openFile(fileItem: FileItem, workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
    const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, fileItem.filePath);
    const document = await vscode.workspace.openTextDocument(fileUri);
    const lineNumber = fileItem.lineNumber ? fileItem.lineNumber - 1 : 0;
    await vscode.window.showTextDocument(document, {
        selection: new vscode.Range(lineNumber, 0, lineNumber, 0)
    });
}

export function showNoFilesMessage(message: string): void {
    vscode.window.showInformationMessage(message);
}

export function showError(error: Error): void {
    vscode.window.showErrorMessage('Error: ' + error.message);
} 