export interface FileItem {
    label: string;
    description: string;
    filePath: string;
}

export interface FilePickerCommand {
    execute(): Promise<void>;
} 