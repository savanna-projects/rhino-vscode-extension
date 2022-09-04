/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/icons-in-labels
 */
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { Command } from "./command";

export class RegisterTestCaseCommand extends Command {
    // members
    private testSuites: string[] | undefined;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.testSuites = [];
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
        let command = vscode.commands.registerCommand(this.getCommandName(), () => {
            // setup
            let options = {
                placeHolder: 'A comma separated test suite ids (e.g. 1908, RH-1908, etc.)'
            };

            vscode.window.showInputBox(options).then((value) => {
                this.testSuites = value?.split(',');
                this.testSuites = (this.testSuites === undefined) ? [] : this.testSuites;
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
        let manifest = Utilities.getProjectManifest();
        let configuration = {
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
            let testCasesResponse = JSON.parse(response);
            vscode.window.setStatusBarMessage('$(sync~spin) Getting an integrated test case(s)...');
            let model = {
                connector: manifest.connectorConfiguration,
                entity: testCasesResponse
            };
            this.getRhinoClient().getTestCases(model, (testCase: any) => {
                let document = JSON.parse(testCase).join('\n\n>>>\n\n');
                let range = this.getDocumentRange();
                vscode.window.activeTextEditor?.edit((i) => {
                    i.replace(range, document);
                    vscode.window.setStatusBarMessage('$(testing-passed-icon) Integrated Test case(s) retrieved');
                });
            });
        });
    }

    // get test cases from the open document
    private getOpenTestCases(): string {
        // setup
        let editor = vscode.window.activeTextEditor;

        // bad request
        if (!editor) {
            return '';
        }

        // get
        return editor.document.getText();
    }

    private getDocumentRange() {
        // setup
        let document = vscode.window.activeTextEditor?.document;

        // not found
        if (!document) {
            let position = new vscode.Position(0, 0);
            return new vscode.Range(position, position);
        }

        // build
        let firstLine = document.lineAt(0);
        let lastLine = document.lineAt(document.lineCount - 1);

        // get
        return new vscode.Range(firstLine.range.start, lastLine.range.end);
    }
}
