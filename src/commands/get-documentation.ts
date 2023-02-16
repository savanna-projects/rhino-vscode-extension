/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import path = require('path');
import * as fs from 'fs';
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { Logger } from '../logging/logger';
import { CommandBase } from "./command-base";

export class GetDocumentationCommand extends CommandBase {
    // members: static
    private readonly _logger: Logger;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this._logger = super.logger?.newLogger('GetDocumentationCommand');
        this.command = 'Get-Documentation';
    }

    /*┌─[ REGISTER & INVOKE ]──────────────────────────────────
      │
      │ A command registration pipeline to expose the command
      │ in the command interface (CTRL+SHIFT+P).
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register a command for creating an integrated test case.
     */
    protected async onRegister(): Promise<any> {
        // build
        let command = vscode.commands.registerCommand(this.command, async () => {
            const id = await this.invokeCommand();
            this._logger?.trace(`Get-Document -Id ${id} = OK`);
        });

        // set
        this.context.subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    protected async onInvokeCommand(): Promise<any> {
        // setup
        const documents = GetDocumentationCommand.getDocumentations();
        const plugin = GetDocumentationCommand.getOpenEntity();
        const id = this.getEntityId(plugin);
        const document = documents?.find(i => i.name === id);

        // not found
        if (document === undefined) {
            this._logger?.trace(`Get-Document -Id ${id} = NotFound`);
            vscode.window.setStatusBarMessage(`$(extensions-warning-message) Documentation For '${id}' Not Found`);
            return;
        }

        // build
        let file = document.file.replaceAll('\\', '/');
        file = file.match(/^[a-z,A-Z]:/) ? `/${file}` : file;

        const uri = vscode.Uri.parse(file);

        // get
        vscode.commands.executeCommand("markdown.showPreviewToSide", uri);
    }

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A collection of utility methods
      └────────────────────────────────────────────────────────*/
    private static getDocumentations() {
        // setup
        const pluginsFolder = Utilities.getSystemUtilityFolderPath('docs');
        const data: any[] = [];

        // bad request
        if (!fs.existsSync(pluginsFolder)) {
            return;
        }

        // build
        const files = Utilities.getFiles(pluginsFolder);
        for (const file of files) {
            let name = path.parse(file).name;
            data.push({ name: name, file: file });
        }

        // get
        return [...new Map(data.map(item => [item['name'], item])).values()];
    }

    // get test cases from the open document
    private static getOpenEntity(): string[] {
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
        if (!document?.length) {
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
            return document[onLine] ? document[onLine]
                .replaceAll('[test-id]', '')
                .trim() : '';
        } catch (error: any) {
            this._logger?.error(error.message, error);
            return '';
        }
    }
}
