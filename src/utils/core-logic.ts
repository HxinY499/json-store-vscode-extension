import fs from "fs";
import path from "path";
import vscode from "vscode";

import { genTimeName } from "./gen-time-name";
import { getBasePath } from "./get-base-path";

export async function createFileInStore(
  fileName: string,
  content?: string,
  basePath?: string
) {
  if (!basePath) {
    basePath = getBasePath();
  }

  const fileUri = vscode.Uri.file(path.join(basePath, fileName));
  const edit = new vscode.WorkspaceEdit();
  edit.createFile(fileUri, {
    overwrite: true,
    ignoreIfExists: false,
    contents: content ? new TextEncoder().encode(content) : undefined,
  });
  await vscode.workspace.applyEdit(edit);
  const document = await vscode.workspace.openTextDocument(fileUri);
  await vscode.window.showTextDocument(document);
}

export async function addFileOrFolder(
  type: "file" | "folder",
  basePath?: string
) {
  if (!basePath) {
    basePath = getBasePath();
  }

  try {
    const fileName = await vscode.window.showInputBox({
      prompt: "Enter file name",
      value: genTimeName(),
      validateInput: value => {
        if (!value) {
          return "name cannot be empty";
        }
        return null;
      },
    });

    if (!fileName) {
      return;
    }

    if (type === "file") {
      await createFileInStore(`${fileName}.json`, undefined, basePath);
    } else {
      const folderUri = vscode.Uri.file(path.join(basePath, fileName));
      await vscode.workspace.fs.createDirectory(folderUri);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error creating ${type}: ${error}`);
  }
}
export async function deleteFileOrFolder(item: vscode.TreeItem) {
  if (item && item.resourceUri) {
    const isFolder = item.contextValue === "folder";
    const itemType = isFolder ? "folder" : "file";

    // const result = await vscode.window.showWarningMessage(
    //   `Are you sure you want to delete this ${itemType} "${item.label}"?${
    //     isFolder ? " This will delete all contents inside." : ""
    //   }`,
    //   { modal: true },
    //   "Delete"
    // );

    // if (result === "Delete") {
    try {
      await vscode.workspace.fs.delete(item.resourceUri, {
        recursive: isFolder,
        useTrash: true, // 使用回收站更安全
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `❌ Failed to delete ${itemType}: ${error}`
      );
    }
    // }
  }
}

export async function renameFileOrFolder(item: vscode.TreeItem) {
  if (item && item.resourceUri) {
    const currentName = path.basename(item.resourceUri.fsPath);
    const newName = await vscode.window.showInputBox({
      prompt: "Enter new file name",
      value: currentName,
      valueSelection: [
        0,
        currentName.lastIndexOf(".") > 0
          ? currentName.lastIndexOf(".")
          : currentName.length,
      ],
    });

    if (newName && newName !== currentName) {
      try {
        const newUri = vscode.Uri.file(
          path.join(path.dirname(item.resourceUri.fsPath), newName)
        );
        await vscode.workspace.fs.rename(item.resourceUri, newUri);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to rename file: ${error}`);
      }
    }
  }
}

export async function saveToStore(
  uri: vscode.Uri,
  deleteSource: boolean = false
) {
  try {
    // 获取当前活动的编辑器
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showWarningMessage("没有打开的JSON文件");
      return;
    }

    const document = activeEditor.document;
    const fileUri = uri || document.uri;

    // 检查是否是JSON文件
    if (!fileUri.fsPath.endsWith(".json")) {
      vscode.window.showWarningMessage("只能保存JSON文件到JSON Store");
      return;
    }

    const fileName = path.basename(fileUri.fsPath);
    const targetPath = path.join(getBasePath(), fileName);

    if (fs.existsSync(targetPath)) {
      const choice = await vscode.window.showWarningMessage(
        `JSON Store中已存在文件 "${fileName}"，是否覆盖？`,
        { modal: true },
        "覆盖",
        "取消"
      );

      if (choice !== "覆盖") {
        return;
      }
    }

    const fileContent = document.getText();
    await createFileInStore(fileName, fileContent);
    if (deleteSource) {
      await vscode.workspace.fs.delete(uri, {
        useTrash: true,
      });
    }

    vscode.window.showInformationMessage(
      `✅ 文件 "${fileName}" 已成功保存到 JSON Store`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`保存到JSON Store失败: ${error}`);
  }
}

export async function cloudDownload() {
  const url = await vscode.window.showInputBox({
    prompt: "Enter url",
    value: "",
  });

  if (!url) {
    return;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    await createFileInStore(
      url.replaceAll("/", "-"),
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    vscode.window.showErrorMessage(`下载失败: ${error}`);
  }
}
