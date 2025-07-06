import * as vscode from "vscode";
import * as cp from "child_process";
import { FileItem } from "../types/file-picker";
import { getPathLabel } from "../utils/path";

interface SearchResult {
  filePath: string;
  matches: {
    lineNumber: number;
    lineText: string;
  }[];
}

export class RipgrepService {
  static async searchFiles({
    workspaceFolder,
    searchText,
    onResults,
    searchPath,
    rgArgs = [
      "--max-columns",
      "250",
      "--smart-case",
      "--line-number",
      "--color",
      "never",
    ],
  }: {
    workspaceFolder: vscode.WorkspaceFolder;
    searchText: string;
    onResults: (files: FileItem[]) => void;
    searchPath?: string;
    rgArgs?: string[];
  }): Promise<cp.ChildProcess> {
    // Validate search text
    if (!searchText || !searchText.trim()) {
      throw new Error("Search text cannot be empty");
    }

    const searchDir = searchPath || "./";
    const rgProcess = cp.spawn("rg", [...rgArgs, searchText, searchDir], {
      cwd: workspaceFolder.uri.fsPath,
    });

    let output = "";
    let error = "";

    rgProcess.stdout.on("data", (data) => {
      output += data.toString();
      const results = this.parseRipgrepOutput(output);
      const pickItems = this.convertToFileItems(results);
      onResults(pickItems);
    });

    rgProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    rgProcess.on("error", (err) => {
      if ((err as NodeJS.ErrnoException).code === "ENOBUFS") {
        throw new Error(
          "Search results too large. Please try a more specific search."
        );
      }
      throw new Error("Failed to execute ripgrep: " + err.message);
    });

    rgProcess.on("close", (code) => {
      // Exit code 0: success, 1: no matches found, 2: error (often regex syntax)
      // null: process was killed (e.g., user typed new search)
      // We don't throw for these codes as they are expected behaviors
      if (code !== null && code !== 0 && code !== 1 && code !== 2) {
        const errorMessage = error ? `Ripgrep search failed with status: ${code}. Error: ${error}` : `Ripgrep search failed with status: ${code}`;
        throw new Error(errorMessage);
      }
    });

    return rgProcess;
  }

  private static parseRipgrepOutput(output: string): SearchResult[] {
    const results: { [filePath: string]: SearchResult } = {};

    output
      .split("\n")
      .filter((line) => line.trim())
      .forEach((line) => {
        // Split line into file path, line number, and content
        const [filePath, lineNumber, ...contentParts] = line.split(":");
        const lineText = contentParts.join(":").trim();

        if (!results[filePath]) {
          results[filePath] = {
            filePath,
            matches: [],
          };
        }

        results[filePath].matches.push({
          lineNumber: parseInt(lineNumber, 10),
          lineText,
        });
      });

    return Object.values(results);
  }

  private static convertToFileItems(results: SearchResult[]): FileItem[] {
    const pickItems: FileItem[] = [];
    results.forEach((result) => {
      result.matches.forEach((match) => {
        pickItems.push({
          label: getPathLabel(result.filePath),
          detail: match.lineText,
          description: result.filePath,
          filePath: result.filePath,
          kind: vscode.QuickPickItemKind.Default,
          lineNumber: match.lineNumber,
        });
      });
    });
    return pickItems;
  }
}
