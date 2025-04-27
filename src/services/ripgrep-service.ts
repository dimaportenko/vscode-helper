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
  static async searchFiles(
    workspaceFolder: vscode.WorkspaceFolder,
    searchText: string,
    onResults: (files: FileItem[]) => void
  ): Promise<cp.ChildProcess> {
    const rgProcess = cp.spawn(
      "rg",
      ["--max-columns", "250", "--smart-case", "--line-number", "--color", "never", searchText, "./"],
      {
        cwd: workspaceFolder.uri.fsPath,
      }
    );

    let output = "";
    let error = "";

    rgProcess.stdout.on("data", (data) => {
      output += data.toString();
      const results = this.parseRipgrepOutput(output);
      const pickItems = this.convertToFileItems(results, searchText);
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
      if (code !== 0 && code !== 1) {
        throw new Error("Ripgrep search failed with status: " + code);
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

  private static convertToFileItems(
    results: SearchResult[],
    searchText: string
  ): FileItem[] {
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
