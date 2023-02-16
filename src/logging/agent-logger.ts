import * as vscode from "vscode";
import { Utilities } from '../extensions/utilities';
import { LogEntry, Logger, LogLevel } from "./logger";
import { LoggerBase } from "./logger-base";

export class AgentLogger extends LoggerBase {

    // properties
    public readonly addConsole: boolean = false;

    constructor(channel: vscode.OutputChannel, logName: string) {
        super(channel, logName);
    }

    /**
     * Gets and allows to set the log entry right before creating the log message.
     * 
     * @param logEntry The log entry.
     */
    protected onWriteLog(logEntry: LogEntry, error?: Error): void {
        // setup
        const gravityLog = AgentLogParser.getGravityLog(logEntry.message, error);

        // set
        logEntry.applicationName = gravityLog.applicationName;
        logEntry.error = gravityLog.error;
        logEntry.logLevel = gravityLog.logLevel;
        logEntry.logName = gravityLog.logName;
        logEntry.message = gravityLog.message;
        logEntry.timestamp = gravityLog.timestamp;
    }

    public newLogger(logName: string): Logger {
        return new AgentLogger(this.channel, logName);
    }
}

class AgentLogParser {
    public static readonly gravityLogStartText = ['Rhino.Agent'] as const;

    // TODO: clean gravity action message (remove time and trace data)
    // TODO: normalize timestamp (optional) - create unique value
    public static getGravityLog(logMessage: string, error?: Error): LogEntry {
        // tokens
        const logNameToken = /(?<=Logger\s+:\s+)\w+/gi;
        const logLevelToken = /(?<=LogLevel\s+:\s+)\w+|(?<=Rhino.Agent\s)\w+(?=:\s+(\d+\s+:\s+(\d+\.?)+)?)/gi;
        const timestampToken = /(?<=TimeStamp\s+:\s+)(\d+(\W+)?)+(?=\n)|(?<=Rhino.Agent\s+\w+:\s+\d+\s+:\s+)(\d+\.?)+/gi;
        const messageToken = /(?<=Message\s+:\s+).*|(?<=Rhino\.Agent\s+\w+:\s+\d+\s+:\s+((\d+\.?)+\s+-\s+)?).*/gi;
        const normalizeToken = /^((\d+\.?)+)\s+\W+\s+/gi;

        // setup
        try {
            const isErrorMessage = error !== null && error !== undefined && error.message !== '';
            const logName: string = Utilities.getFirstMatch(logMessage.match(logNameToken)).trim();
            const logLevel = Utilities.getFirstMatch(logMessage.match(logLevelToken)).trim();
            const timestamp = Utilities.getFirstMatch(logMessage.match(timestampToken)).trim();
            const message = isErrorMessage
                ? error.message
                : Utilities.getFirstMatch(logMessage.match(messageToken)).trim();
            return {
                applicationName: 'Rhino Extension',
                logName: logName && logName !== 'LogLevel' ? logName : 'N/A',
                timestamp: timestamp ? timestamp : Utilities.getTimestamp(),
                logLevel: logLevel,
                message: message.replace(normalizeToken, ''),
                error: error
            };
        }
        catch (error: any) {
            return {
                applicationName: 'Rhino Extension',
                logName: 'AgentLogger',
                timestamp: Utilities.getTimestamp(),
                logLevel: LogLevel.error,
                message: error.message.trim(),
                error: error
            };
        }
    }
}
