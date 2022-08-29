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
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { ReportManager } from '../rhino/report-manager';
import { Command } from "./command";
import { FormatTestCaseCommand } from './format-document';

export class InvokeAllTestCasesCommand extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // setup
        this.setCommandName('Invoke-TestCase -All');
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
    public register(): any {
        // setup
        let command = vscode.commands.registerCommand(this.getCommandName(), () => {
            this.invoke();
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
        // setup
        let context = this.getContext();

        // notification
        vscode.window.setStatusBarMessage('$(sync~spin) Invoking test case(s)...');

        // format
        new FormatTestCaseCommand(context).invokeCommand(() => {
            // invoke
            this.getConfiguration((configuration: any) => {
                this.getRhinoClient().invokeConfiguration(configuration, (testRun: any) => {
                    let _testRun = JSON.parse(testRun);
                    _testRun.actual === true
                        ? vscode.window.setStatusBarMessage("$(testing-passed-icon) Invoke completed w/o test(s) failures")
                        : vscode.window.setStatusBarMessage("$(testing-error-icon) Invoke completed, w/ test(s) failures");

                    console.info(testRun);
                    try {
                        const panel = vscode.window.createWebviewPanel("RhinoReport", "Rhino Report", vscode.ViewColumn.One);
                        panel.webview.html = new ReportManager(_testRun).getHtmlReport();
                    } catch (error) {
                        console.error(error);
                        vscode.window.setStatusBarMessage("$(testing-error-icon) Invoke was not completed");
                    }
                });
            });
        });
    }

    // creates default configuration with text connector
    private getConfiguration(callback: any) {
        this.getAllTestCases((testCases: string[]) => {
            // get configuration
            let configuration = Utilities.getConfigurationByManifest();

            // build
            configuration.testsRepository = testCases;

            // invoke
            callback(configuration);
        });
    }

    // get test cases from the open document
    private getAllTestCases(callback: any) {
        // build
        const fs = require('fs');

        // setup
        let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;

        let testCasesPath = path.join(workspace, 'TestCases');
        let testsPath = path.join(workspace, 'Tests');

        // normalize
        testsPath = testsPath.startsWith('\\')
            ? testsPath.substring(1, testsPath.length)
            : testsPath;

        // setup
        let isTestsPath = fs.existsSync(testsPath);
        let testsFolder = testCasesPath;
        
        if (isTestsPath) {
            testsFolder = testsPath;
        }
        
        testsFolder = testsFolder.startsWith('\\')
            ? testsFolder.substring(1, testsFolder.length)
            : testsFolder;

        // iterate
        Utilities.getFiles(testsFolder, (files: string[]) => {
            let testCases: string[] = [];
            for (const testCaseFile of files) {
                try {
                    let testCase = fs.readFileSync(testCaseFile, 'utf8');

                    if (Utilities.isNullOrUndefined(testCase) || testCase === '') {
                        continue;
                    }

                    let spec = testCase.split('\n').map((i: string) => i.replace(/^\d+\.\s+/, '')).join('\n');
                    testCases.push(spec);
                } catch (e) {
                    console.log('Error:', e);
                }
            }

            callback(testCases);
        });
    }
}
