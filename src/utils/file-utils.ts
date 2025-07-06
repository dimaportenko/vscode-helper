import * as vscode from 'vscode';
import { FileItem } from '../types/file-picker';
import * as path from 'path';

// Global state for tracking active QuickPick
interface QuickPickState {
    quickPick: vscode.QuickPick<FileItem>;
    workspaceFolder: vscode.WorkspaceFolder;
}

let activeQuickPickState: QuickPickState | undefined;

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

export async function copyFilePathToClipboard(fileItem: FileItem, workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
    try {
        // Make the path relative to workspace root if it's not already
        let relativePath = fileItem.filePath;
        if (path.isAbsolute(relativePath)) {
            relativePath = path.relative(workspaceFolder.uri.fsPath, relativePath);
        }
        
        await vscode.env.clipboard.writeText(relativePath);
        vscode.window.setStatusBarMessage(`Copied: ${relativePath}`, 2000);
    } catch (error) {
        showError(new Error('Failed to copy file path to clipboard'));
    }
}

export function setActiveQuickPick(quickPick: vscode.QuickPick<FileItem>, workspaceFolder: vscode.WorkspaceFolder): void {
    activeQuickPickState = { quickPick, workspaceFolder };
    // Set custom context key when QuickPick becomes active
    vscode.commands.executeCommand('setContext', 'filesQuickPick.active', true);
}

export function clearActiveQuickPick(): void {
    activeQuickPickState = undefined;
    // Clear custom context key when QuickPick is no longer active
    vscode.commands.executeCommand('setContext', 'filesQuickPick.active', false);
}

export async function copyActiveQuickPickPath(): Promise<void> {
    if (!activeQuickPickState) {
        vscode.window.showWarningMessage('No active file picker');
        return;
    }

    const selectedItem = activeQuickPickState.quickPick.activeItems[0];
    if (!selectedItem) {
        vscode.window.showWarningMessage('No file highlighted');
        return;
    }

    await copyFilePathToClipboard(selectedItem, activeQuickPickState.workspaceFolder);
}

export function setupQuickPickCopyHandler(
    quickPick: vscode.QuickPick<FileItem>,
    workspaceFolder: vscode.WorkspaceFolder
): void {
    // Register this QuickPick as the active one
    setActiveQuickPick(quickPick, workspaceFolder);
    
    // Add a copy button to the quick pick
    const copyButton: vscode.QuickInputButton = {
        iconPath: new vscode.ThemeIcon('copy'),
        tooltip: 'Copy file path (Cmd+C)'
    };
    
    quickPick.buttons = [copyButton];
    
    // Handle button click
    quickPick.onDidTriggerButton(async (button) => {
        if (button === copyButton) {
            await copyActiveQuickPickPath();
        }
    });

    // Clean up when QuickPick is hidden
    quickPick.onDidHide(() => {
        clearActiveQuickPick();
    });

    // Update placeholder to show copy instruction
    const originalPlaceholder = quickPick.placeholder;
    quickPick.placeholder = originalPlaceholder + ' (Cmd+C to copy path)';
} 