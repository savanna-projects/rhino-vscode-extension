/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://stackoverflow.com/questions/45203543/vs-code-extension-api-to-get-the-range-of-the-whole-text-of-a-document
 * https://code.visualstudio.com/api/references/icons-in-labels
 * https://stackoverflow.com/questions/55633453/rotating-octicon-in-statusbar-of-vs-code
 * https://code.visualstudio.com/api/extension-guides/webview
 */
import path = require('path');
import * as fs from 'fs';
import * as vscode from 'vscode';
import { ReportManager } from '../components/report-manager';
import { Utilities } from '../extensions/utilities';
import { Logger } from '../logging/logger';
import { CommandBase } from "./command-base";
import { AgentLogListener } from '../components/agent-log-listener';
import { Channels } from '../constants/channels';

export class InvokeTestFolderCommand extends CommandBase {
    // members: static
    private readonly _logger: Logger;
    private foldersUri: vscode.Uri[] | undefined;
    private readonly _logConfiguration: LogConfiguration;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);
        
        // setup
        this._logConfiguration = Utilities.getLogConfiguration();
        this._logger = this.logger?.newLogger('InvokeTestFolderCommand');
        this.command = 'Invoke-TestCase -Folder';
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
        let command = vscode.commands.registerCommand(this.command, async (_contextSelection: vscode.Uri, allSelections: vscode.Uri[]) => {

            // use this if triggered by a menu item,
            this.foldersUri = allSelections;  // folder will be undefined when triggered by keybinding

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
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Invoking Test Case(s)...');
        const listener = new AgentLogListener(Channels.agent, this.client);


        try 
        {
            // agent log
            if (this._logConfiguration.agentLogConfiguration.enabled) {
                listener.channel.show();
                listener.start();
            }

            // invoke
            const configuration = this.getConfiguration();
            const testRun = await client.rhino.invokeConfiguration(configuration);

            testRun.actual === true
                ? vscode.window.setStatusBarMessage("$(testing-passed-icon) Invoke Completed W/O Test(s) Failure(s)")
                : vscode.window.setStatusBarMessage("$(testing-error-icon) Invoke Completed, W/ Test(s) Failure(s)");

            // extension log
            this._logger?.trace(JSON.stringify(testRun, null, 4));

            // user report
            const panel = vscode.window.createWebviewPanel("RhinoReport", "Rhino Report", vscode.ViewColumn.One);
            panel.webview.html = new ReportManager(testRun).getHtmlReport();

        } catch (error: any) {
            this._logger?.error(error.message, error);
            vscode.window.setStatusBarMessage(`$(testing-error-icon) ${error.message}`);
        }
        finally{
            listener.stop();
        }
    }

    // creates default configuration with text connector
    private getConfiguration(): any {
        // setup
        const testCases = this.getTestCases();
        const configuration = Utilities.newConfigurationByManifest();

        // build
        configuration.testsRepository = testCases;

        // get
        return configuration;
    }

    // get test cases from the open document
    private getTestCases(): string[] {
        // setup   
        const testCases: string[] = [];
        if(!this.foldersUri){
            this._logger?.error(`No folders found.`);
            return [];
        }

        // iterate
        for(let testsFolder of this.foldersUri){
            let folderPath = testsFolder.fsPath;
            this._logger?.information(`Finding tests in ${folderPath}.`);
            const files = Utilities.getFiles(folderPath);
            for (const testCaseFile of files) {
                try {
                    const testCase = fs.readFileSync(testCaseFile, 'utf8');
    
                    if (Utilities.assertNullOrUndefined(testCase) || testCase === '') {
                        continue;
                    }
    
                    const spec = Utilities.formatRhinoSpec(testCase);
                    testCases.push(spec);
                } catch (error: any) {
                    this._logger?.error(error.message, error);
                }
            }
        }
        

        // get
        return testCases;
    }
}
