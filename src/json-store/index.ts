import fs from "fs";
import os from "os";
import path from "path";
import vscode from "vscode";

class JsonStore {
  public basePath = path.join(os.homedir(), ".json-store-vscode-extension");
  private _data: Record<string, any> = {};

  constructor() {
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists() {
    try {
      await fs.promises.access(this.basePath);
    } catch {
      await fs.promises.mkdir(this.basePath, { recursive: true });
    }
  }

  private genName(type: "file" | "folder") {
    const curDate = new Date();
    const year = curDate.getFullYear();
    const month = curDate.getMonth() + 1;
    const day = curDate.getDate();
    const hour = curDate.getHours();
    const minute = curDate.getMinutes();
    const second = curDate.getSeconds();
    if (type === "file") {
      return `${year}.${month}.${day}.${hour}:${minute}:${second}.json`;
    } else {
      return `${year}.${month}.${day}.${hour}:${minute}:${second}`;
    }
  }

  async loadJsonFiles() {
    const files = await fs.promises.readdir(this.basePath, {
      withFileTypes: true,
    });
    return files.filter(file => file.name.endsWith(".json"));
  }

  async addFile(item: vscode.TreeItem | null) {
    const filename = this.genName("file");
    let filePath = "";
    if (!item) {
      filePath = path.join(this.basePath, filename);
    } else if (item.contextValue === "folder") {
      filePath = path.join(item.resourceUri?.path ?? "", filename);
    }

    await fs.promises.writeFile(filePath, "");
    return filePath;
  }

  async addFolder(item: vscode.TreeItem | null) {
    const folderName = this.genName("folder");
    let filePath = "";
    if (!item) {
      filePath = path.join(this.basePath, folderName);
    } else if (item.contextValue === "folder") {
      filePath = path.join(item.resourceUri?.path ?? this.basePath, folderName);
    }

    await fs.promises.mkdir(filePath, { recursive: true });
    return filePath;
  }

  async renameFile(item: vscode.TreeItem, newName: string) {
    const oldPath = item.resourceUri?.fsPath ?? "";
    const newPath = path.join(path.dirname(oldPath), newName);
    await fs.promises.rename(oldPath, newPath);
  }
}

export default JsonStore;
