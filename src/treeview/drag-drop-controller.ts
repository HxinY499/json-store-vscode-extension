import fs from "fs";
import path from "path";
import vscode from "vscode";

import { getBasePath } from "../utils/get-base-path";
import { FileExplorerProvider } from ".";
import { FileItem } from "./file-item";

export class DragDropController
  implements vscode.TreeDragAndDropController<FileItem>
{
  dropMimeTypes = ["application/vnd.code.tree.json-store-view"];
  dragMimeTypes = ["application/vnd.code.tree.json-store-view"];

  private basePath = getBasePath();

  constructor(private fileExplorerProvider: FileExplorerProvider) {}

  setWorkspaceRoot(basePath: string): void {
    this.basePath = basePath;
  }

  public async handleDrop(
    target: FileItem | undefined,
    sources: vscode.DataTransfer
  ): Promise<void> {
    const transferItem = sources.get(
      "application/vnd.code.tree.json-store-view"
    );
    if (!transferItem) {
      return;
    }

    const draggedItems: FileItem[] = transferItem.value;
    if (!draggedItems || draggedItems.length === 0) {
      return;
    }

    // 确定目标路径
    let targetPath: string;
    if (target && target.contextValue === "folder") {
      // 拖拽到文件夹内
      targetPath = target.resourceUri.fsPath;
    } else if (target) {
      // 拖拽到文件上，使用文件所在的文件夹
      targetPath = path.dirname(target.resourceUri.fsPath);
    } else {
      // 拖拽到根目录
      targetPath = getBasePath();
    }

    // 移动每个拖拽的项目
    for (const item of draggedItems) {
      try {
        await this.moveItem(item, targetPath);
        this.fileExplorerProvider.refresh();
      } catch (err) {
        throw new Error(`${err}`);
      }
    }
  }

  public async handleDrag(
    source: FileItem[],
    dataTransfer: vscode.DataTransfer
  ): Promise<void> {
    dataTransfer.set(
      "application/vnd.code.tree.json-store-view",
      new vscode.DataTransferItem(source)
    );
  }

  private async moveItem(item: FileItem, targetPath: string): Promise<void> {
    const sourcePath = item.resourceUri.fsPath;
    const fileName = path.basename(sourcePath);
    const destinationPath = path.join(targetPath, fileName);

    // 检查是否是移动到同一位置
    if (sourcePath === destinationPath) {
      return;
    }

    // 检查目标是否已存在
    let shouldOverwrite = false;
    if (fs.existsSync(destinationPath)) {
      const choice = await vscode.window.showWarningMessage(
        `目标位置已存在 "${fileName}"，是否覆盖？`,
        { modal: true },
        "覆盖",
        "取消"
      );

      if (choice !== "覆盖") {
        return;
      }
      shouldOverwrite = true;
    }

    // 检查是否是移动到自身的子目录（避免无限循环）
    if (
      item.contextValue === "folder" &&
      destinationPath.startsWith(sourcePath + path.sep)
    ) {
      return;
    }

    try {
      const sourceUri = vscode.Uri.file(sourcePath);
      const destinationUri = vscode.Uri.file(destinationPath);

      // 如果需要覆盖，先删除目标文件/文件夹
      if (shouldOverwrite) {
        await vscode.workspace.fs.delete(destinationUri, {
          recursive: true,
          useTrash: false, // 不使用回收站，直接删除以避免冲突
        });
      }

      await vscode.workspace.fs.rename(sourceUri, destinationUri);
    } catch (error) {
      throw new Error(`Failed to move "${fileName}": ${error}`);
    }
  }
}
