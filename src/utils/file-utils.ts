import * as vscode from 'vscode';
import { FileItem } from '../types/file-picker';

export async function openFile(fileItem: FileItem, workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
    const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, fileItem.filePath);
    const document = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(document);
}

export function showNoFilesMessage(message: string): void {
    vscode.window.showInformationMessage(message);
}

export function showError(error: Error): void {
    vscode.window.showErrorMessage('Error: ' + error.message);
} 