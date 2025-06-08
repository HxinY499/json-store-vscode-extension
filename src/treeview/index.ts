import fs from "fs";
import path from "path";
import vscode from "vscode";

import { FileItem } from "./file-item";

export class FileExplorerProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    FileItem | undefined | null | void
  > = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    FileItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private workspaceRoot: string | undefined;

  constructor() {}

  setWorkspaceRoot(workspaceRoot: string): void {
    this.workspaceRoot = workspaceRoot;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FileItem): Thenable<FileItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No folder opened");
      return Promise.resolve([]);
    }

    if (element) {
      // 返回子目录和文件
      return Promise.resolve(
        this.getFilesInDirectory(element.resourceUri.fsPath)
      );
    } else {
      // 返回根目录内容
      return Promise.resolve(this.getFilesInDirectory(this.workspaceRoot));
    }
  }

  private getFilesInDirectory(dirPath: string): FileItem[] {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const files = fs.readdirSync(dirPath);
    return files.map(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      return new FileItem(
        file,
        vscode.Uri.file(filePath),
        stat.isDirectory()
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None
      );
    });
  }
}
