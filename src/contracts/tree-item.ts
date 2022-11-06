/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';

export class TreeItem extends vscode.TreeItem {
    children: TreeItem[] | undefined;
    command?: vscode.Command | undefined;

    constructor(
        label: string,
        iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri } | vscode.ThemeIcon,
        children?: TreeItem[] | undefined,
        command?: vscode.Command) {

        super(
            label,
            children === undefined
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Collapsed);
        this.command = command;
        this.iconPath = iconPath;
        if (children !== undefined) {
            this.children = children;
        }
    }
}
