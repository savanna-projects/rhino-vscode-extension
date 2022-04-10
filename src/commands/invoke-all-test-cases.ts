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
        var command = vscode.commands.registerCommand(this.getCommandName(), () => {
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
        var context = this.getContext();

        // notification
        vscode.window.setStatusBarMessage('$(sync~spin) Invoking test case(s)...');

        // format
        new FormatTestCaseCommand(context).invokeCommand(() => {
            // invoke
            this.getConfiguration((configuration: any) => {
                this.getRhinoClient().invokeConfiguration(configuration, (testRun: any) => {
                    var _testRun = JSON.parse(testRun);
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
            var configuration = Utilities.getConfigurationByManifest();

            // build
            configuration.testsRepository = testCases;

            // invoke
            callback(configuration);
        });
    }

    // get test cases from the open document
    private getAllTestCases(callback: any) {
        // setup
        var workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;

        var testsFolder = path.join(workspace, 'TestCases');
        testsFolder = testsFolder.startsWith('\\')
            ? testsFolder.substring(1, testsFolder.length)
            : testsFolder;

        // build
        const fs = require('fs');

        // iterate
        Utilities.getFiles(testsFolder, (files: string[]) => {
            var testCases: string[] = [];
            for (let i = 0; i < files.length; i++) {
                try {
                    const testCaseFile = files[i];
                    var testCase = fs.readFileSync(testCaseFile, 'utf8');

                    if (Utilities.isNullOrUndefined(testCase) || testCase === '') {
                        continue;
                    }

                    var spec = testCase.split('\n').map((i: string) => i.replace(/^\d+\.\s+/, '')).join('\n');
                    testCases.push(spec);
                } catch (e) {
                    console.log('Error:', e);
                }
            }

            callback(testCases);
        });
    }
}
