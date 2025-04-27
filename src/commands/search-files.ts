import * as vscode from "vscode";
import { FileItem, FilePickerCommand } from "../types/file-picker";
import { RipgrepService } from "../services/ripgrep-service";
import { openFile, showNoFilesMessage, showError } from "../utils/file-utils";

export class SearchFilesCommand implements FilePickerCommand {
  private quickPick: vscode.QuickPick<FileItem> | undefined;
  private searchTimeout: NodeJS.Timeout | undefined;

  async execute(): Promise<void> {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        throw new Error("No workspace folder found");
      }

      this.quickPick = vscode.window.createQuickPick();
      this.quickPick.placeholder = "Type to search files by content";
      this.quickPick.matchOnDescription = true;
      this.quickPick.matchOnDetail = true;

      // Handle input changes
      this.quickPick.onDidChangeValue(async (value) => {
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }

        if (!value.trim()) {
          this.quickPick!.items = [];
          return;
        }

        // Debounce search to avoid too many requests
        this.searchTimeout = setTimeout(async () => {
          try {
            const foundFiles = await RipgrepService.searchFiles(
              workspaceFolder,
              value
            );
            this.quickPick!.items = foundFiles;
          } catch (error) {
            showError(error as Error);
          }
        }, 200); // 300ms debounce
      });

      // Handle selection
      this.quickPick.onDidAccept(async () => {
        const selectedItem = this.quickPick!.selectedItems[0];
        if (selectedItem) {
          await openFile(selectedItem, workspaceFolder);
        }
        this.quickPick!.dispose();
      });

      // Handle cancellation
      this.quickPick.onDidHide(() => {
        this.quickPick!.dispose();
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }
      });

      this.quickPick.show();
    } catch (error) {
      showError(error as Error);
    }
  }
}
