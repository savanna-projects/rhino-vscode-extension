/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { CommandBase } from "./command-base";

export class GetTestCaseCommand extends CommandBase {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.command = 'Get-TestCase';
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
            await this.invokeCommand();
        });

        // set
        this.context.subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    protected async onInvokeCommand(): Promise<any> {
        // setup
        const client = this.client;
        const configuration = GetTestCaseCommand.getConfiguration(this.manifest);
        const options = {
            placeHolder: 'Test ID to get (e.g., RP-1234)'
        };
        const request = {
            connector: configuration.connector,
            entity: ''
        };

        vscode.window.showInputBox(options).then(async (value) => {
            // setup
            request.entity = value === undefined ? '' : value;

            // user interface
            vscode.window.setStatusBarMessage(`$(sync~spin) Loading Test Case ${request.entity}...`);

            // get
            const response = await client.integration.getTestCases(request);

            // replace in editor
            const range = GetTestCaseCommand.getDocumentRange();
            vscode.window.activeTextEditor?.edit((i) => {
                i.replace(range, response);

                vscode.window.activeTextEditor?.document.save();

                const message = `$(testing-passed-icon) Test Case ${request.entity} Loaded`;
                vscode.window.setStatusBarMessage(message);
            });
        });
    }

    // creates default configuration with text connector
    private static getConfiguration(manifest: any) {
        // setup
        const projectManifest = manifest;

        // build
        return {
            connector: projectManifest.connectorConfiguration
        };
    }

    private static getDocumentRange() {
        // setup
        const document = vscode.window.activeTextEditor?.document;

        // not found
        if (!document) {
            const position = new vscode.Position(0, 0);
            return new vscode.Range(position, position);
        }

        // build
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);

        // get
        return new vscode.Range(firstLine.range.start, lastLine.range.end);
    }
}
