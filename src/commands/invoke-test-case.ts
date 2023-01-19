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
import { Utilities } from '../extensions/utilities';
import { RhinoLogger } from '../framework/rhino-logger';
import { LoggerOptions } from '../logging/logger-options';
import { ServerLogParser } from '../logging/server-log-parser';
import { ServerLogService } from '../logging/server-log-service';
import { LoggerConfig } from '../rhino/manifest-models';
import { ReportManager } from '../rhino/report-manager';
import { Command } from "./command";

export class InvokeTestCaseCommand extends Command {
    // members
    private testCases: string[];
    private loggerConfig: LoggerConfig | undefined;
    private testRunLogger: RhinoLogger | undefined;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // setup
        this.testCases = [];
        this.setCommandName('Invoke-TestCase');
        this.setLoggerConfig();
    }

    private extractLoggerOptions(): LoggerOptions {
        return new LoggerOptions(this.loggerConfig?.loggerOptions);
    }

    private setLoggerConfig(): void {
        this.loggerConfig = Utilities.getLoggerConfig(this.getCommandName());
    }

    private createLogger() {
        this.setLoggerConfig();
        let loggerOptions = this.extractLoggerOptions();
        if (!this.testRunLogger) {
            
            this.testRunLogger = new RhinoLogger("Test Run Log", loggerOptions);
        }
        else{
            this.testRunLogger.setLoggerOptions(loggerOptions);
        }
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
        this.testCases.push(...testCases);

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
        this.testCases.push(...testCases);

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
        // notification
        vscode.window.setStatusBarMessage('$(sync~spin) Invoking test case(s)...');

        let runEnded = false;
        let stopCondition = () => runEnded;

        let configuration = this.getConfiguration();
        let invokedTest: string = configuration.testsRepository[0];

        let testId = this.extractTestId(invokedTest);

        if (this.loggerConfig?.enableClientSideLogging) {
            this.displayRunLog(stopCondition, testId, 1000);
        }

        // invoke
        this.getRhinoClient().invokeConfiguration(configuration, (testRun: any) => {
            let _testRun = JSON.parse(testRun);
            _testRun.actual === true
                ? vscode.window.setStatusBarMessage("$(testing-passed-icon) Invoke completed w/o test(s) failures")
                : vscode.window.setStatusBarMessage("$(testing-error-icon) Invoke completed, w/ test(s) failures");

            console.info(testRun);
            try {
                let htmlReport = new ReportManager(_testRun).getHtmlReport();
                const panel = vscode.window.createWebviewPanel("RhinoReport", "Rhino Report", vscode.ViewColumn.One);
                panel.webview.html = htmlReport;
            } catch (error) {
                console.error(error);
                vscode.window.setStatusBarMessage("$(testing-error-icon) Invoke was not completed");
            }
            finally {
                runEnded = true;
            }
        });
    }
    /**
     * 
     * @param stopCondition The condition after which
     * @param interval Interval, in milliseconds, to get the log. Default is 1000ms
     */
    private async displayRunLog(stopCondition: (...args: any) => boolean, testId: string, interval?: number): Promise<void> {
        this.createLogger();
        if (!this.testRunLogger) {
            throw new Error(`No test run logger created!`);
        }
        let logger = this.testRunLogger;
        logger.show();

        logger.appendLine(`\n----------------------------------------\n${Utilities.getTimestamp()} - ${testId}: Test run started.\n----------------------------------------\n`);


        let logParser = new ServerLogService(this.getRhinoClient());
        let numberOfLines = 200;
        let latestLogId = await logParser.getLatestLogId();
        let runStartTime = new Date();
        let isAfterRunStart = false;

        let logging = async () => {
            let log = await logParser.getLog(latestLogId, numberOfLines);
            let messagesToLog = logParser.parseLog(log ?? "");
            for (let message of messagesToLog) {
                if (!isAfterRunStart) {
                    let logDate = ServerLogParser.parseLogTimestamp(message);
                    isAfterRunStart = logDate > runStartTime;
                }

                if (isAfterRunStart) {
                    logger.append(message);
                }

                //Wait to slightly stagger writing of logs to channel, allowing easier reading of log continuously.
                await Utilities.wait(100);
            }
        };

        Utilities.poll(logging, stopCondition, interval ?? 1000).then(() => logger.appendLine(`\n----------------------------------------\n${Utilities.getTimestamp()} - ${testId}: Test run ended.\n----------------------------------------\n`));
    }
    // creates default configuration with text connector
    private getConfiguration() {
        // setup
        let testsRepository = this.getCommandName() === 'Invoke-TestCase'
            ? this.getOpenTestCases()
            : this.testCases;
        let configuration = Utilities.getConfigurationByManifest();

        // build
        configuration.testsRepository = testsRepository;

        // get
        return configuration;
    }

    // get test cases from the open document
    private getOpenTestCases(): string[] {
        // setup
        let editor = vscode.window.activeTextEditor;

        // bad request
        if (!editor) {
            return [];
        }

        // clean
        let text = Utilities.buildRhinoSpec(editor.document.getText());

        // get
        return text.split('>>>').map(i => i.trim());
    }

    private extractTestId(test: string): string {
        let matches = test.match(/(?<=\[test-id\](\s)*)\S+(?=\\n|\n)/g);
        return matches ? matches[0] : '';
    }
}
