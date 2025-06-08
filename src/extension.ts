// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode from "vscode";

import { FileExplorerProvider } from "./treeview";
import { DragDropController } from "./treeview/drag-drop-controller";
import {
  addFileOrFolder,
  cloudDownload,
  deleteFileOrFolder,
  openInExplorer,
  renameFileOrFolder,
  saveToStore,
} from "./utils/core-logic";
import { getBasePath } from "./utils/get-base-path";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "json-store" is now active!');

  let basePath = getBasePath();

  console.log("basePath", basePath);

  // Create the file explorer provider
  const fileExplorerProvider = new FileExplorerProvider();
  fileExplorerProvider.setWorkspaceRoot(basePath);

  const configurationChangeListener = vscode.workspace.onDidChangeConfiguration(
    event => {
      if (event.affectsConfiguration("json-store.basePath")) {
        basePath = getBasePath();
        fileExplorerProvider.setWorkspaceRoot(basePath);
        fileExplorerProvider.refresh();
        vscode.window.showInformationMessage(
          `JSON Store 路径已更新为: ${basePath}`
        );
      }
    }
  );

  const dragAndDropController = new DragDropController(fileExplorerProvider);

  // Register the tree view
  const treeView = vscode.window.createTreeView("json-store-view", {
    treeDataProvider: fileExplorerProvider,
    showCollapseAll: true,
    canSelectMany: true,
    dragAndDropController,
  });

  const getItemFromSelection = (item?: vscode.TreeItem | null) => {
    if (!item) {
      const selection = treeView.selection;
      if (selection && selection.length > 0) {
        return selection[0];
      }
    }
    return item;
  };

  // Register commands
  const refreshCommand = vscode.commands.registerCommand(
    "json-store.refresh",
    () => {
      fileExplorerProvider.refresh();
    }
  );

  const addFileCommand = vscode.commands.registerCommand(
    "json-store.addFile",
    async (item: vscode.TreeItem | null) => {
      const isFolder = item?.contextValue === "folder";
      await addFileOrFolder(
        "file",
        isFolder ? item.resourceUri!.fsPath : getBasePath()
      );
      fileExplorerProvider.refresh();
    }
  );

  const addFolderCommand = vscode.commands.registerCommand(
    "json-store.addFolder",
    async (item?: vscode.TreeItem) => {
      const isFolder = item?.contextValue === "folder";
      await addFileOrFolder(
        "folder",
        isFolder ? item.resourceUri!.fsPath : getBasePath()
      );
      fileExplorerProvider.refresh();
    }
  );

  const deleteItemCommand = vscode.commands.registerCommand(
    "json-store.delete",
    async (_item?: vscode.TreeItem) => {
      const item = getItemFromSelection(_item);
      if (!item) {
        return;
      }
      await deleteFileOrFolder(item);
      fileExplorerProvider.refresh();
    }
  );

  const renameFileCommand = vscode.commands.registerCommand(
    "json-store.rename",
    async (_item?: vscode.TreeItem) => {
      const item = getItemFromSelection(_item);
      if (!item) {
        return;
      }
      await renameFileOrFolder(item);
      fileExplorerProvider.refresh();
    }
  );

  const saveToStoreCommand = vscode.commands.registerCommand(
    "json-store.saveToStore",
    async (uri?: vscode.Uri) => {
      if (!uri) {
        return;
      }
      await saveToStore(uri);
      fileExplorerProvider.refresh();
    }
  );

  const saveToStoreAndDeleteSourceCommand = vscode.commands.registerCommand(
    "json-store.saveToStoreAndDeleteSource",
    async (uri?: vscode.Uri) => {
      if (!uri) {
        return;
      }
      await saveToStore(uri, true);
      fileExplorerProvider.refresh();
    }
  );

  const cloudDownloadCommand = vscode.commands.registerCommand(
    "json-store.cloudDownload",
    async () => {
      await cloudDownload();
      fileExplorerProvider.refresh();
    }
  );

  const openInExplorerCommand = vscode.commands.registerCommand(
    "json-store.openInExplorer",
    async () => {
      await openInExplorer();
    }
  );

  // Add to subscriptions
  context.subscriptions.push(
    treeView,
    refreshCommand,
    addFolderCommand,
    addFileCommand,
    deleteItemCommand,
    renameFileCommand,
    saveToStoreCommand,
    saveToStoreAndDeleteSourceCommand,
    configurationChangeListener,
    cloudDownloadCommand,
    openInExplorerCommand
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
