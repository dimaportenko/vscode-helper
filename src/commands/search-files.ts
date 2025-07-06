import * as vscode from "vscode";
import { FileItem, FilePickerCommand } from "../types/file-picker";
import { RipgrepService } from "../services/ripgrep-service";
import { openFile, showNoFilesMessage, showError } from "../utils/file-utils";
import * as cp from "child_process";

export class SearchFilesCommand implements FilePickerCommand {
  private quickPick: vscode.QuickPick<FileItem> | undefined;
  private currentProcesses: cp.ChildProcess[] = [];
  private usingLiteralSearch = false;

  private killAllProcesses() {
    this.currentProcesses.forEach((process) => {
      if (!process.killed) {
        process.kill();
      }
    });
    this.currentProcesses = [];
  }

  private async performSearch(
    workspaceFolder: vscode.WorkspaceFolder,
    searchText: string,
    onResults: (files: FileItem[]) => void,
    useLiteralSearch = false
  ): Promise<cp.ChildProcess> {
    const rgArgs = useLiteralSearch
      ? ["--max-columns", "250", "--smart-case", "--line-number", "--color", "never", "--fixed-strings"]
      : ["--max-columns", "250", "--smart-case", "--line-number", "--color", "never"];

    return RipgrepService.searchFiles({
      workspaceFolder,
      searchText,
      onResults,
      rgArgs,
    });
  }

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
        // Kill all previous processes
        this.killAllProcesses();

        // Reset placeholder when input changes
        this.quickPick!.placeholder = "Type to search files by content";

        if (!value.trim()) {
          this.quickPick!.items = [];
          return;
        }

        try {
          this.quickPick!.busy = true;
          this.usingLiteralSearch = false;
          
          const process = await this.performSearch(
            workspaceFolder,
            value,
            (files) => {
              this.quickPick!.items = files;
              this.quickPick!.busy = false;
            }
          );

          // Handle process errors for fallback
          process.on("close", async (code) => {
            if (code === 2 && !this.usingLiteralSearch) {
              // Regex syntax error, retry with literal search
              this.killAllProcesses();
              this.usingLiteralSearch = true;
              
              try {
                const literalProcess = await this.performSearch(
                  workspaceFolder,
                  value,
                  (files) => {
                    this.quickPick!.items = files;
                    this.quickPick!.busy = false;
                  },
                  true
                );
                this.currentProcesses.push(literalProcess);
                
                // Update placeholder to indicate literal search
                if (this.quickPick) {
                  this.quickPick.placeholder = "Type to search files by content (literal search mode)";
                }
              } catch (error) {
                showError(error as Error);
                this.quickPick!.busy = false;
              }
            }
          });

          this.currentProcesses.push(process);
        } catch (error) {
          showError(error as Error);
          this.quickPick!.busy = false;
        }
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
        this.killAllProcesses();
        this.quickPick!.dispose();
      });

      this.quickPick.show();
    } catch (error) {
      showError(error as Error);
    }
  }
}
