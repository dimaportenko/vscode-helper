import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export interface JsWorkspaceInfo {
  isJsWorkspace: boolean;
  isMonorepo: boolean;
  currentWorkspacePath?: string;
}

function findMatchingDirectories(basePath: string, pattern: string): string[] {
  const globPattern = pattern.replace("/*", "");
  const fullPath = path.join(basePath, globPattern);

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  if (!pattern.endsWith("/*")) {
    return [fullPath];
  }

  // If pattern ends with /*, find all subdirectories
  return fs
    .readdirSync(fullPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(fullPath, dirent.name));
}

export async function detectJsWorkspace(
  workspaceFolder: vscode.WorkspaceFolder,
  currentFile?: vscode.Uri
): Promise<JsWorkspaceInfo> {
  const workspacePath = workspaceFolder.uri.fsPath;

  // Check if it's a JS workspace by looking for package.json
  const packageJsonPath = path.join(workspacePath, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return { isJsWorkspace: false, isMonorepo: false };
  }

  // Read package.json to check for workspaces
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const workspaces = packageJson.workspaces || [];

  if (!workspaces.length) {
    return { isJsWorkspace: true, isMonorepo: false };
  }

  // If we have a current file, try to find which workspace it belongs to
  let currentWorkspacePath: string | undefined;
  if (currentFile) {
    const filePath = currentFile.fsPath;

    // First, check non-wildcard workspaces
    for (const workspacePattern of workspaces) {
      if (!workspacePattern.endsWith("/*")) {
        const patternPath = path.join(workspacePath, workspacePattern);
        if (filePath.startsWith(patternPath)) {
          currentWorkspacePath = patternPath;
          break;
        }
      }
    }

    // If not found in non-wildcard workspaces, check wildcard workspaces
    if (!currentWorkspacePath) {
      for (const workspacePattern of workspaces) {
        if (workspacePattern.endsWith("/*")) {
          const matchingDirs = findMatchingDirectories(
            workspacePath,
            workspacePattern
          );
          for (const dir of matchingDirs) {
            if (filePath.startsWith(dir)) {
              currentWorkspacePath = dir;
              break;
            }
          }
          if (currentWorkspacePath) {
            break;
          }
        }
      }
    }
  }

  return {
    isJsWorkspace: true,
    isMonorepo: true,
    currentWorkspacePath,
  };
}
