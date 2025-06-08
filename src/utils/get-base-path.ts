import os from "os";
import path from "path";
import vscode from "vscode";

// 获取配置的 basePath
export function getBasePath(): string {
  const config = vscode.workspace.getConfiguration("json-store");
  const configuredPath = config.get<string>("basePath");

  if (configuredPath && configuredPath.trim()) {
    if (path.isAbsolute(configuredPath)) {
      return configuredPath;
    } else {
      // 相对路径相对于当前工作目录
      const workspaceRoot =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
      return path.join(workspaceRoot, configuredPath);
    }
  }

  // 默认路径
  return path.join(os.homedir(), ".json-store-vscode-extension");
}
