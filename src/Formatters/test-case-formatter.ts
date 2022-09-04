/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { Formatter } from "./formatter";

export class TestCaseFormatter extends Formatter {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);
    }

    public format(document: vscode.TextDocument): vscode.TextEdit[] {
        console.log('Method not implemented.');
        return []
    }
}
