/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/icons-in-labels
 */
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { Command } from "./command";
import { FormatTestCaseCommand } from './format-document';

export class RegisterTestCaseCommand extends Command {
    // members
    private testSuites: string[] | undefined;
    private formatCommand: FormatTestCaseCommand;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.testSuites = [];
        this.formatCommand = new FormatTestCaseCommand(this.getContext());
        this.setCommandName('Register-TestCase');
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
            // setup
            var options = {
                placeHolder: 'A comma seprated test suite ids (e.g. 1908, RH-1908, etc.)'
            };

            vscode.window.showInputBox(options).then((value) => {
                this.testSuites = value?.split(',');
                this.testSuites === undefined ? [] : this.testSuites;
                this.invoke();
            });
        });

        // set
        this.getContext().subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    public invokeCommand() {
        this.invoke();
    }

    private invoke() {
        // notification
        vscode.window.setStatusBarMessage('$(sync~spin) Creating an integraed test case(s)...');

        // setup
        var manifest = Utilities.getProjectManifest();
        var configuration = {
            connector: manifest.connectorConfiguration,
            entity: {
                spec: this.getOpenTestCases(),
                testSuites: this.testSuites
            }
        };

        // build
        this.getRhinoClient().createTestCase(configuration, (response: any) => {
            vscode.window.setStatusBarMessage('$(testing-passed-icon) Integrated test cases created');

            // get by id
            var testCasesResponse = JSON.parse(response);
            vscode.window.setStatusBarMessage('$(sync~spin) Getting an integrated test case(s)...');
            var model = {
                connector: manifest.connectorConfiguration,
                entity: testCasesResponse
            };
            var s = JSON.stringify(model);
            this.getRhinoClient().getTestCases(model, (testCase: any) => {
                var document = JSON.parse(testCase).join('\n\n>>>\n\n');
                var range = this.getDocumentRange();
                vscode.window.activeTextEditor?.edit((i) => {
                    i.replace(range, document);
                    this.formatCommand.invokeCommand(() => {
                        vscode.window.setStatusBarMessage('$(testing-passed-icon) Integrated Test case(s) retrieved');
                    });
                });
            });
        });
    }

    // get test cases from the open document
    private getOpenTestCases(): string {
        // setup
        var editor = vscode.window.activeTextEditor;

        // bad request
        if (!editor) {
            return '';
        }

        // get
        return editor.document.getText();
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
