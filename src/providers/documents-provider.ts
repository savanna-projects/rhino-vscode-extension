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

export class DocumentsProvider implements vscode.TreeDataProvider<TreeItem> {
    getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
        return element === undefined
            ? DocumentsProvider.getDocuments()
            : element.children;
    }

    /**
     * Summary. Creates the provider into the given context. 
     */
    public register(): any {
        // setup
        let options = {
            treeDataProvider: this
        };

        // get
        vscode.window.createTreeView('rhinoDocumentation', options);
    }

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A collection of utility methods
      └────────────────────────────────────────────────────────*/
    private static getDocuments(): Thenable<TreeItem[]> {
        // setup
        let options = { location: { viewId: "rhinoDocumentation" } };

        // get
        return vscode.window.withProgress(options, () => {
            return new Promise<TreeItem[]>(function (resolve) {
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
                    resolve([]);
                }

                // build
                DocumentsProvider.getTreeItems(documentsFolder, (docs: TreeItem) => {
                    if (docs.children === null || docs.children === undefined) {
                        return;
                    }
                    data.push(...docs.children);
                    resolve(data);
                });
            });
        });
    }

    private static getTreeItems(directory: string, callback: any) {
        // local
        const getFromDirectory: any = (directoryPath: any, parent: TreeItem) => {
            // setup
            const files = DocumentsProvider.sortFilesAndFolders(directoryPath, fs.readdirSync(directoryPath));
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

    private static sortFilesAndFolders(directoryPath: string, unsorted: string[]): string[] {
        // local
        const sortByName = (list: string[]) => {
            return list.sort((n1: string, n2: string) => {
                if (n1 > n2) {
                    return 1;
                }

                if (n1 < n2) {
                    return -1;
                }

                return 0;
            });
        };

        // setup
        let excludeFolders: string[] = [
            "Images"
        ].map(i => i.toUpperCase());
        let folders: string[] = [];
        let files: string[] = [];

        // sort o-n
        for (let item of unsorted) {
            let file = path.join(directoryPath, item);
            let stats = fs.statSync(file);
            if (stats.isDirectory()) {
                var isExcluded = excludeFolders.indexOf(item.toUpperCase()) > -1;
                if (isExcluded) {
                    continue;
                }
                folders.push(item);
            }
            else if (stats.isFile()) {
                files.push(item);
            }
        }

        // sort a-z
        folders = sortByName(folders);
        files = sortByName(files);

        // get
        return [...folders, ...files];
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
