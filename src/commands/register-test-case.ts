/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/icons-in-labels
 */
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { CommandBase } from './command-base';

export class RegisterTestCaseCommand extends CommandBase {
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
        this.command = 'Register-TestCase';
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
        const command = vscode.commands.registerCommand(this.command, () => {
            // setup
            const options = {
                placeHolder: 'A comma separated test suite id (e.g. 1908, RH-1908, etc.)'
            };

            vscode.window.showInputBox(options).then(async (value) => {
                this.testSuites = value?.split(',');
                this.testSuites = (this.testSuites === undefined) ? [] : this.testSuites;
                await this.invokeCommand();
            });
        });

        // set
        this.context.subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    protected async onInvokeCommand(): Promise<any> {
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Creating an Integrated Test Case(s)...');

        // setup
        let manifest = Utilities.getManifest();
        let testCreateModel = {
            connector: manifest.connectorConfiguration,
            entity: {
                spec: Utilities.getOpenDocumentText(),
                testSuites: this.testSuites
            }
        };

        // invoke
        const createResponse = await this.client.integration.newTestCase(testCreateModel);

        // user interface
        vscode.window.setStatusBarMessage('$(testing-passed-icon) Integrated Test Case(s) Created');

        // get by id
        vscode.window.setStatusBarMessage('$(sync~spin) Retrieving an Integrated Test Case(s)...');
        let testGetModel = {
            connector: manifest.connectorConfiguration,
            entity: createResponse.length > 0 ? createResponse[0] : ''
        };

        if (testGetModel.entity === '') {
            return;
        }

        const testCase = await this.client.integration.getTestCases(testGetModel);

        // replace in open document
        const range = Utilities.getOpenDocumentRange();
        vscode.window.activeTextEditor?.edit((i) => {
            i.replace(range, testCase);
            vscode.window.setStatusBarMessage('$(testing-passed-icon) Integrated Test Case(s) Retrieved');
        });
    }
}
