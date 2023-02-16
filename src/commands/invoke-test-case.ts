/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://stackoverflow.com/questions/45203543/vs-code-extension-api-to-get-the-range-of-the-whole-text-of-a-document
 * https://code.visualstudio.com/api/references/icons-in-labels
 * https://stackoverflow.com/questions/55633453/rotating-octicon-in-statusbar-of-vs-code
 * https://code.visualstudio.com/api/extension-guides/webview
 */
import * as vscode from 'vscode';
import { AgentLogListener } from '../components/agent-log-listener';
import { ReportManager } from '../components/report-manager';
import { Channels } from '../constants/channels';
import { Utilities } from '../extensions/utilities';
import { Logger } from '../logging/logger';
import { CommandBase } from "./command-base";

export class InvokeTestCaseCommand extends CommandBase {
    // members: state
    private readonly _testCases: string[];
    private readonly _logConfiguration: LogConfiguration;
    private readonly _logger: Logger;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // setup
        this.command = 'Invoke-TestCase';
        this._testCases = [];
        this._logConfiguration = Utilities.getLogConfiguration();
        this._logger = super.logger?.newLogger('InvokeTestCaseCommand');
    }

    /*┌─[ SETTERS ]────────────────────────────────────────────
      │
      │ A collection of functions to set object properties
      │ to avoid initializing members in the object signature.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Adds one or more Rhino Test Case(s) into the tests collection.
     * 
     * @param testCases One or more Rhino Test Case(s) to invoke.
     * @returns Self reference
     */
    public addTestCases(...testCases: string[]): InvokeTestCaseCommand {
        // build
        this._testCases.push(...testCases);

        // get
        return this;
    }

    /**
     * Summary. Adds one or more Rhino Test Case(s) into the tests collection.
     * 
     * @returns Self reference
     */
    public addOpenTestCases(): InvokeTestCaseCommand {
        // setup
        let editor = vscode.window.activeTextEditor;

        // bad request
        if (!editor) {
            return this;
        }

        // build
        let testCases = editor.document.getText().split('>>>');
        this._testCases.push(...testCases);

        // get
        return this;
    }

    /*┌─[ REGISTER ]───────────────────────────────────────────
      │
      │ A command registration pipeline to expose the command
      │ in the command interface (CTRL+SHIFT+P).
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register a command for invoking one or more Rhino Test Case
     *          and present the report.
     */
    protected async onRegister(): Promise<any> {
        // setup
        let command = vscode.commands.registerCommand(this.command, async () => {
            await this.invokeCommand();
        });

        // set
        this.context.subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    public async onInvokeCommand(): Promise<any> {
        // setup
        const listener = new AgentLogListener(Channels.agent, this.client);
        const configuration = InvokeTestCaseCommand.getConfiguration(this.command, this._testCases);
        const invokedTest: string = configuration.testsRepository[0];
        const testId = InvokeTestCaseCommand.getTestId(invokedTest);

        // invoke
        try {
            // log
            this._logger?.information(`Start-TestSession -Id ${testId} = Ok`);

            // user interface
            vscode.window.setStatusBarMessage('$(sync~spin) Invoking Test Case(s)...');

            // agent log
            if (this._logConfiguration.agentLogConfiguration.enabled) {
                listener.channel.show();
                listener.start();
            }

            // invoke
            const testRun = await this.client.rhino.invokeConfiguration(configuration);

            // log
            this._logger?.debug(JSON.stringify(testRun, null, 4));
            this._logger?.information(`Close-TestSession -Id ${testId} = Ok`);

            // user interface
            testRun.actual === true
                ? vscode.window.setStatusBarMessage("$(testing-passed-icon) Invoke Completed W/O Failures")
                : vscode.window.setStatusBarMessage("$(testing-error-icon) Invoke Completed, W/ Failures");

            // static report
            const htmlReport = new ReportManager(testRun).getHtmlReport();
            const panel = vscode.window.createWebviewPanel("RhinoReport", "Rhino Report", vscode.ViewColumn.One);
            panel.webview.html = htmlReport;
        } catch (error: any) {
            this._logger?.error(error.message, error.message);
            vscode.window.setStatusBarMessage(`$(testing-error-icon) ${error.message}`);
        }
        finally {
            listener.stop();
        }
    }

    // creates default configuration with text connector
    private static getConfiguration(command: string, testCases: string[]) {
        // setup
        const testsRepository = command === 'Invoke-TestCase'
            ? this.getOpenTestCases()
            : testCases;
        const configuration = Utilities.newConfigurationByManifest();

        // build
        configuration.testsRepository = testsRepository;

        // get
        return configuration;
    }

    // get test cases from the open document
    private static getOpenTestCases(): string[] {
        // setup
        let editor = vscode.window.activeTextEditor;

        // bad request
        if (!editor) {
            return [];
        }

        // clean
        let text = Utilities.formatRhinoSpec(editor.document.getText());

        // get
        return text.split('>>>').map(i => i.trim());
    }

    private static getTestId(test: string): string {
        //setup
        const matches = test.match(/(?<=\[test-id\](\s)*)\S+(?=\\n|\n)/g);

        // get
        return matches ? matches[0] : '';
    }
}
