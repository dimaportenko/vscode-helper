import * as vscode from "vscode";

export interface FileItem extends vscode.QuickPickItem {
  filePath: string;
  lineNumber?: number;
}

export interface FilePickerCommand {
  execute(): Promise<void>;
}
