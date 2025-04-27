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
    searchText: string
  ): Promise<FileItem[]> {
    const rgProcess = cp.spawnSync(
      "rg",
      ["--smart-case", "--line-number", "--color", "never", searchText, "./"],
      {
        cwd: workspaceFolder.uri.fsPath,
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      }
    );

    if (rgProcess.error) {
      if ((rgProcess.error as NodeJS.ErrnoException).code === 'ENOBUFS') {
        throw new Error("Search results too large. Please try a more specific search.");
      }
      throw new Error("Failed to execute ripgrep: " + rgProcess.error.message);
    }

    if (rgProcess.status !== 0 && rgProcess.status !== 1) {
      throw new Error("Ripgrep search failed with status: " + rgProcess.status);
    }

    // Parse the output into structured results
    const results = this.parseRipgrepOutput(rgProcess.stdout);

    // Convert to FileItems
    const pickItems: FileItem[] = [];
    results.forEach((result) => {
    //   pickItems.push({
    //     label: result.filePath,
    //     description: searchText,
    //     detail: searchText,
    //     filePath: "",
    //     kind: vscode.QuickPickItemKind.Separator,
    //   });

    //   pickItems.push({
    //     // _type: "QuickPickItemRgMenuAction",
    //     label: result.filePath,
    //     description: `${searchText} ${result.matches.length} matches`,
    //     filePath: result.filePath,
    //     kind: vscode.QuickPickItemKind.Default,
    //     // detail: result.matches
    //     //   .map((match) => `Line ${match.lineNumber}: ${match.lineText}`)
    //     //   .join("\n"),
    //   });

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
}
