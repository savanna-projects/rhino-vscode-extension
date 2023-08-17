/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://github.com/microsoft/vscode-extension-samples
 * https://css-tricks.com/what-i-learned-by-building-my-own-vs-code-extension/
 * https://www.freecodecamp.org/news/definitive-guide-to-snippets-visual-studio-code/
 * 
 * CREDITS
 */
import path = require('path');
import * as vscode from 'vscode';
import { TreeItem } from '../components/tree-item';
import { Utilities } from '../extensions/utilities';

export class ScriptsProvider implements vscode.TreeDataProvider<TreeItem> {
    // members
    private readonly _context: vscode.ExtensionContext;

    // events
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    public getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
        // exit conditions
        if (element !== undefined) {
            return element?.children;
        }

        // setup
        let options = {
            location: {
                viewId: "rhinoScripts"
            }
        };

        // get
        return vscode.window.withProgress(options, async () => {
            // setup
            let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
            workspace = workspace === undefined ? '' : workspace;

            let documentsFolder = path.join(workspace, '..', 'scripts');
            documentsFolder = documentsFolder.startsWith('\\')
                ? documentsFolder.substring(1, documentsFolder.length)
                : documentsFolder;

            // bad request
            const fs = require('fs');
            if (!fs.existsSync(documentsFolder)) {
                return [];
            }

            // build
            const includeFiles = [".cmd", ".sh", ".ps1", ".bat", ".py", ".js"];
            const excludeFolders = ["images"];
            const command = "vscode.open";
            return await Utilities.getTreeItems(documentsFolder, excludeFolders, includeFiles, command);
        });
    }

    /**
     * Summary. Creates the provider into the given context. 
     */
    public register(): any {
        // setup
        const options = {
            treeDataProvider: this,
            showCollapseAll: true
        };

        // build
        vscode.window.registerTreeDataProvider('rhinoScripts', this);
        vscode.commands.getCommands().then((commands) => {
            if (!commands.includes('Update-Scripts')) {
                vscode.commands.registerCommand('Update-Scripts', () => {
                    this.refresh();
                });
            }
        });

        // register
        const tree = vscode.window.createTreeView('rhinoScripts', options);
        this._context.subscriptions.push(tree);
    }
}
