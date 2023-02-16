import * as vscode from "vscode";
import { Logger } from "./logger";
import { LoggerBase } from "./logger-base";

export class ExtensionLogger extends LoggerBase {

    // properties
    public readonly addConsole: boolean = true;

    constructor(channel: vscode.OutputChannel, logName: string) {
        super(channel, logName);
    }

    public newLogger(logName: string): Logger {
        return new ExtensionLogger(this.channel, logName);
    }
}
