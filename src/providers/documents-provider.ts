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
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { TreeItem } from '../contracts/tree-item';

export class DocumentsProvider implements vscode.TreeDataProvider<TreeItem> {
    getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
        // exit conditions
        if (element !== undefined) {
            return element?.children;
        }

        // setup
        let options = { location: { viewId: "rhinoDocumentation" } };

        // get
        return vscode.window.withProgress(options, () => {
            return new Promise<TreeItem[]>((resolve) => {
                // setup
                let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
                workspace = workspace === undefined ? '' : workspace;
                let documentsFolder = path.join(workspace, '..', 'docs');
                documentsFolder = documentsFolder.startsWith('\\')
                    ? documentsFolder.substring(1, documentsFolder.length)
                    : documentsFolder;

                // bad request
                const fs = require('fs');
                if (!fs.existsSync(documentsFolder)) {
                    resolve([]);
                }

                // build
                const includeFiles = [".md"];
                const excludeFolders = ["images"];
                const command = "markdown.showPreviewToSide";
                let data = Utilities.getTreeItems(documentsFolder, excludeFolders, includeFiles, command);

                resolve(data);
            });
        });
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
}
