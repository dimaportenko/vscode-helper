import * as vscode from "vscode";
import * as path from "path";
import { FileItem, FilePickerCommand } from "../types/file-picker";
import { RipgrepService } from "../services/ripgrep-service";
import { openFile, showError } from "../utils/file-utils";
import { detectJsWorkspace } from "../utils/workspace-utils";
import * as cp from "child_process";

interface SearchState {
  searchText: string;
  workspacePath?: string;
}

export class SearchInJsWorkspaceCommand implements FilePickerCommand {
  private quickPick: vscode.QuickPick<FileItem> | undefined;
  private currentProcesses: cp.ChildProcess[] = [];
  private workspaceRoot: string = "";
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  private killAllProcesses() {
    this.currentProcesses.forEach((process) => {
      if (!process.killed) {
        process.kill();
      }
    });
    this.currentProcesses = [];
  }

  private makePathRelativeToRoot(filePath: string, root: string): string {
    if (root) {
      const relativePath = path.relative(root, filePath);
      return relativePath.startsWith("..") ? filePath : relativePath;
    }
    return filePath;
  }

  private saveState(searchText: string, workspacePath?: string): void {
    const state: SearchState = {
      searchText,
      workspacePath,
    };
    this.context.globalState.update("searchInJsWorkspaceState", state);
  }

  private getState(): SearchState | undefined {
    return this.context.globalState.get("searchInJsWorkspaceState");
  }

  async execute(): Promise<void> {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        throw new Error("No workspace folder found");
      }

      this.workspaceRoot = workspaceFolder.uri.fsPath;

      // Get the currently active file
      const activeEditor = vscode.window.activeTextEditor;
      const currentFile = activeEditor?.document.uri;

      // Detect JS workspace information
      const workspaceInfo = await detectJsWorkspace(
        workspaceFolder,
        currentFile
      );

      // Determine the search root
      const searchRoot =
        workspaceInfo.currentWorkspacePath || workspaceFolder.uri.fsPath;

      this.quickPick = vscode.window.createQuickPick();
      this.quickPick.placeholder =
        "Type to search files by content in " +
        (workspaceInfo.currentWorkspacePath
          ? "current workspace"
          : "project root");
      this.quickPick.matchOnDescription = true;
      this.quickPick.matchOnDetail = true;

      // Restore previous state if exists
      const previousState = this.getState();
      if (previousState) {
        this.quickPick.value = previousState.searchText;
      }

      // Handle input changes
      this.quickPick.onDidChangeValue(async (value) => {
        // Kill all previous processes
        this.killAllProcesses();

        if (!value.trim()) {
          this.quickPick!.items = [];
          return;
        }

        try {
          this.quickPick!.busy = true;
          const process = await RipgrepService.searchFiles({
            workspaceFolder,
            searchText: value,
            onResults: (files) => {
              // Make file paths relative to project root
              const adjustedFiles = files.map((file) => ({
                ...file,
                filePath: this.makePathRelativeToRoot(
                  file.filePath,
                  this.workspaceRoot
                ),
                description: file.description
                  ? this.makePathRelativeToRoot(file.description, searchRoot)
                  : undefined,
              }));
              this.quickPick!.items = adjustedFiles;
              this.quickPick!.busy = false;
            },
            searchPath: searchRoot,
          });
          this.currentProcesses.push(process);
          // Save state after successful search
          this.saveState(value, searchRoot);
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
