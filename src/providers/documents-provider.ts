/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://github.com/microsoft/vscode-extension-samples
 * https://css-tricks.com/what-i-learned-by-building-my-own-vs-code-extension/
 * https://www.freecodecamp.org/news/definitive-guide-to-snippets-visual-studio-code/
 * 
 * CREDITS
 * https://iconscout.com/contributors/vorillaz
 */
import path = require('path');
import fs = require('fs');
import * as vscode from 'vscode';
import { TransferListItem } from 'worker_threads';

export class DocumentsProvider implements vscode.TreeDataProvider<TreeItem> {
    data: TreeItem[];

    constructor() {
        let documents = DocumentsProvider.getDocuments();
        this.data = [...documents];
    }

    getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A collection of utility methods
      └────────────────────────────────────────────────────────*/
    private static getDocuments(): TreeItem[] {
        // setup
        let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;
        let documentsFolder = path.join(workspace, '..', 'docs');
        documentsFolder = documentsFolder.startsWith('\\')
            ? documentsFolder.substring(1, documentsFolder.length)
            : documentsFolder;
        let data: TreeItem[] = [];

        // bad request
        const fs = require('fs');
        if (!fs.existsSync(documentsFolder)) {
            return [];
        }

        // build
        vscode.window.setStatusBarMessage('$(sync~spin) Loading documents...');
        DocumentsProvider.getTreeItems(documentsFolder, (docs: TreeItem) => {
            if (docs.children === null || docs.children === undefined) {
                return;
            }
            data.push(...docs.children);
            vscode.window.setStatusBarMessage('$(testing-passed-icon) Documents loaded');
        });

        // get
        let a = this.filterData(data);
        return data;
    }

    public static getTreeItems(directory: string, callback: any) {
        // local
        const getFromDirectory: any = (directoryPath: any, parent: TreeItem) => {
            // setup
            const files = fs.readdirSync(directoryPath);
            const directoryName = path.basename(directoryPath);

            // normalize
            if (parent !== null && parent !== undefined) {
                parent.children = parent.children === null || parent.children === undefined
                    ? []
                    : parent.children;
            }
            else {
                parent = new TreeSection(directoryName);
                parent.children = [];
            }
            parent.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

            for (const file of files) {
                const filePath = path.join(directoryPath, file);
                const stats = fs.statSync(filePath);

                if (filePath.toUpperCase().endsWith('.PNG')) {
                    continue;
                }

                if (stats.isDirectory()) {
                    const item = path.basename(filePath);
                    const section = new TreeSection(item);
                    section.collapsibleState = 1;
                    parent.children?.push(section);
                    getFromDirectory(filePath, section);
                }
                else {
                    let onFile = filePath.replaceAll('\\', '/');
                    onFile = onFile.match(/^[a-z,A-Z]:/) ? `/${onFile}` : onFile;
                    parent.children?.push(new TreeItem(file, onFile));
                }
            }

            return parent;
        };

        // build
        let docs = getFromDirectory(directory);

        // callback
        callback(docs);
    }

    private static filterData(data: TreeItem[]): TreeItem[] {
        // setup
        let cleanData: TreeItem[] = [];

        // recurse
        const stData: any = (item: TreeItem) => {
            if (item.type === 'branch' && (item.children === null || item.children === undefined || item.children.length === 0)) {
                return;
            }
            if (item.type === 'leaf' && (item.children === null || item.children === undefined || item.children.length === 0)) {
                cleanData.push(item);
                return;
            }
            if (item.children === undefined || item.children?.length === 0) {
                return;
            }
            for (let child of item.children) {
                stData(child);
            }
        };

        // get
        for (let d of data) {
            stData(d);
        }

        return cleanData;
    }
}

class TreeItem extends vscode.TreeItem {
    children: TreeItem[] | undefined;
    command?: vscode.Command | undefined;
    type: string = 'leaf';

    constructor(label: string, resource: string, children?: TreeItem[]) {
        super(
            label,
            children === undefined
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
        this.command = <vscode.Command>{
            title: "",
            command: "markdown.showPreviewToSide",
            arguments: [vscode.Uri.file(resource)]
        };
    }

    iconPath = vscode.ThemeIcon.File;
}

class TreeSection extends vscode.TreeItem {
    children: TreeItem[] | undefined;
    type: string = 'branch';

    constructor(label: string, children?: TreeItem[]) {
        super(
            label,
            children === undefined
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
    }

    iconPath = vscode.ThemeIcon.Folder;
}
