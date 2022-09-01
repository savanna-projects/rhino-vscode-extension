/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import path = require('path');
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { Command } from "./command";

export class GetDocumentationCommand extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Get-Documentation');
    }

    /*┌─[ REGISTER & INVOKE ]──────────────────────────────────
      │
      │ A command registration pipeline to expose the command
      │ in the command interface (CTRL+SHIFT+P).
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register a command for creating an integrated test case.
     */
    public register(): any {
        // setup
        let documents = this.getDocumentations();

        // build
        let command = vscode.commands.registerCommand(this.getCommandName(), () => {
            this.invoke(documents, (id: any) => {
                console.log(`Get-Document -Id ${id} = OK`);
            });
        });

        // set
        this.getContext().subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    public invokeCommand(callback: any) {
        let documents = this.getDocumentations();
        this.invoke(documents, callback);
    }

    private invoke(documents: any[] | undefined, callback: any) {
        // setup
        let plugin = this.getOpenEntity();
        let id = this.getEntityId(plugin);
        let document = documents?.find(i => i.name === id);

        // not found
        if (document === undefined) {
            console.warn(`Get-Document -Id ${id} = NotFound`);
            vscode.window.setStatusBarMessage(`$(extensions-warning-message) Documentation for '${id}' not found`);
            return;
        }

        // build
        let file = document.file.replaceAll('\\', '/');
        file = file.match(/^[a-z,A-Z]:/) ? `/${file}` : file;
        let uri = vscode.Uri.parse(file);

        // get
        vscode.commands.executeCommand("markdown.showPreviewToSide", uri);

        // callback
        callback(id);
    }

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A collection of utility methods
      └────────────────────────────────────────────────────────*/
    private getDocumentations() {
        // setup
        let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;
        let pluginsFolder = path.join(workspace, '..', 'docs');
        pluginsFolder = pluginsFolder.startsWith('\\')
            ? pluginsFolder.substring(1, pluginsFolder.length)
            : pluginsFolder;
        let data: any[] = [];

        // bad request
        const fs = require('fs')
        if (!fs.existsSync(pluginsFolder)) {
            return;
        }

        // build 
        Utilities.getFiles(pluginsFolder, (files: string[]) => {
            for (const file of files) {
                let name = path.parse(file).name;
                data.push({ name: name, file: file })
            }
        });

        // get
        return [...new Map(data.map(item => [item['name'], item])).values()];
    }

    // get test cases from the open document
    private getOpenEntity(): string[] {
        // setup
        let editor = vscode.window.activeTextEditor;

        // bad request
        if (!editor) {
            return [];
        }

        // get
        return editor.document.getText().split(/\r?\n|\n\r?/);
    }

    private getEntityId(document: string[]): string {
        // not found
        if (document === undefined || document === null) {
            return '';
        }

        try {
            // setup
            let pattern = '^\\[test-id]';

            // get line number
            let onLine = 0;
            for (onLine; onLine < document.length; onLine++) {
                if (document[onLine].match(pattern) !== null) {
                    break;
                }
            }

            // not found
            if (document === undefined || document === null) {
                return '';
            }

            // get
            return document[onLine]
                .replaceAll('[test-id]', '')
                .trim();
        } catch (error) {
            console.error(error);
            return '';
        }
    }
}
