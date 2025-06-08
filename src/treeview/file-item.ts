import vscode from "vscode";

export class FileItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly resourceUri: vscode.Uri,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);

    this.tooltip = this.resourceUri.fsPath;
    this.contextValue =
      this.collapsibleState === vscode.TreeItemCollapsibleState.None
        ? "file"
        : "folder";

    // 设置图标
    if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
      this.iconPath = new vscode.ThemeIcon("file");
      this.command = {
        command: "vscode.open",
        title: "Open File",
        arguments: [this.resourceUri],
      };
    } else {
      this.iconPath = new vscode.ThemeIcon("folder");
    }
  }
}
