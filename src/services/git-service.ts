import * as vscode from 'vscode';
import * as cp from 'child_process';
import { FileItem } from '../types/file-picker';

export class GitService {
    static async getModifiedFiles(workspaceFolder: vscode.WorkspaceFolder): Promise<FileItem[]> {
        const gitStatus = cp.spawnSync('git', ['status', '--porcelain'], {
            cwd: workspaceFolder.uri.fsPath,
            encoding: 'utf8'
        });

        if (gitStatus.error) {
            throw new Error('Failed to get git status: ' + gitStatus.error.message);
        }

        return gitStatus.stdout
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                const status = line.substring(0, 2).trim();
                const filePath = line.substring(3);
                return {
                    label: filePath,
                    description: status,
                    filePath: filePath
                };
            });
    }
} 