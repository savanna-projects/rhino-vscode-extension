/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { Command } from "./command";
import { FormatTestCaseCommand } from "./format-document"

export class GetTestCaseCommand extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Get-TestCase');
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
        // build
        var command = vscode.commands.registerCommand(this.getCommandName(), () => {
            this.invoke(undefined);
        });

        // set
        this.getContext().subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    public invokeCommand(callback: any) {
        this.invoke(callback);
    }

    private invoke(callback: any) {
        // setup
        var client = this.getRhinoClient();
        var configuration = this.getConfiguration();
        var options = {
            placeHolder: 'Test ID to get (e.g., RP-1234)'
        };
        var request = {
            connector: configuration.connector,
            entity: ''
        };

        vscode.window.showInputBox(options).then((value) => {
            // setup
            request.entity = value === undefined ? '' : value;

            // user interface
            vscode.window.setStatusBarMessage('$(sync~spin) Loading Test Case ' + request.entity + '...');

            // get
            client.getTestCase(request, (response: any) => {
                var formatter = new FormatTestCaseCommand(this.getContext())
                var range = this.getDocumentRange();

                vscode.window.activeTextEditor?.edit((i) => {
                    i.replace(range, response);
                    formatter.invokeCommand(() => {
                        vscode.window.activeTextEditor?.document.save();

                        let message = '$(testing-passed-icon) Test Case ' + request.entity + ' loaded';
                        vscode.window.setStatusBarMessage(message)

                        if (callback !== undefined) {
                            callback();
                        }
                    });
                });
            });
        });
    }

    // creates default configuration with text connector
    private getConfiguration() {
        // setup
        var projectManifest = this.getProjectManifest();

        // build
        return {
            connector: projectManifest.connectorConfiguration
        };
    }

    private getDocumentRange() {
        // setup
        var document = vscode.window.activeTextEditor?.document;

        // not found
        if (!document) {
            var position = new vscode.Position(0, 0);
            return new vscode.Range(position, position);
        }

        // build
        var firstLine = document.lineAt(0);
        var lastLine = document.lineAt(document.lineCount - 1);

        // get
        return new vscode.Range(firstLine.range.start, lastLine.range.end);
    }
}
