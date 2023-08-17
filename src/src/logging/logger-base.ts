import * as vscode from "vscode";
import { Utilities } from "../extensions/utilities";
import { LogEntry, Logger, LogLevel } from "./logger";

export abstract class LoggerBase implements Logger {
    /* eslint-disable @typescript-eslint/naming-convention */
    private static readonly _events: { [code: string]: string; } = {
        0: "Unknown, reason will be ignored when loggin.",
        1: "Rhino Agent is not running or cannot be directly interacted.",
        2: "The request sent to Rhino Agent yields no results or the results could not be parsed."
    };

    // members: state
    private readonly _configuration: LogConfiguration;
    private _logLevel: 'none' | 'trace' | 'debug' | 'information' | 'warning' | 'error' | 'fatal' = 'fatal';

    // properties
    public abstract readonly addConsole: boolean;
    public readonly channel: vscode.OutputChannel;
    public readonly logName: string;
    public isTraceEnabled: boolean;
    public isDebugEnabled: boolean;
    public isErrorEnabled: boolean;
    public isFatalEnabled: boolean;
    public isInformationEnabled: boolean;
    public isWarningEnabled: boolean;

    protected constructor(channel: vscode.OutputChannel, logName: string) {
        // default state
        this.isTraceEnabled = false;
        this.isDebugEnabled = false;
        this.isInformationEnabled = false;
        this.isWarningEnabled = false;
        this.isErrorEnabled = false;
        this.isFatalEnabled = false;

        // properties
        this.channel = channel;
        this.logName = logName;

        // new
        this._configuration = Utilities.getLogConfiguration();
        if (this._configuration.agentLogConfiguration.enabled) {
            LoggerBase.setLevel(this, this._configuration.logLevel);
        }
    }

    public trace(message: string): void;
    public trace(message: string, event?: string): void;
    public trace(message: string, event?: string, error?: Error | undefined): void;
    public trace(message: string, event?: string, error?: Error): void {
        if (!this.getTraceCompliance()) {
            return;
        }
        this.writeLog(LogLevel.trace, message, event, error);
    }

    public debug(message: string): void;
    public debug(message: string, event?: string): void;
    public debug(message: string, event?: string, error?: Error | undefined): void;
    public debug(message: string, event?: string, error?: Error): void {
        if (!this.getDebugCompliance()) {
            return;
        }
        this.writeLog(LogLevel.debug, message, event, error);
    }

    public error(message: string): void;
    public error(message: string, event?: string): void;
    public error(message: string, event?: string, error?: Error | undefined): void;
    public error(message: string, event?: string, error?: Error): void {
        if (this.addConsole && error !== null && error !== undefined) {
            console.error(error);
        }
        if (!this.getErrorCompliance()) {
            return;
        }
        this.writeLog(LogLevel.error, message, event, error);
    }

    public fatal(message: string): void;
    public fatal(message: string, event?: string): void;
    public fatal(message: string, event?: string, error?: Error | undefined): void;
    public fatal(message: string, event?: string, error?: Error): void {
        if (this.addConsole && error !== null && error !== undefined) {
            console.error(error);
        }
        if (!this.getFatalCompliance()) {
            return;
        }
        this.writeLog(LogLevel.fatal, message, event, error);
    }

    public information(message: string): void;
    public information(message: string, event?: string): void;
    public information(message: string, event?: string, error?: Error | undefined): void;
    public information(message: string, event?: string, error?: Error): void {
        if (!this.getInformationCompliance()) {
            return;
        }
        this.writeLog(LogLevel.information, message, event, error);
    }

    public warning(message: string): void;
    public warning(message: string, event?: string): void;
    public warning(message: string, event?: string, error?: Error | undefined): void;
    public warning(message: string, event?: string, error?: Error): void {
        if (!this.getWarningCompliance()) {
            return;
        }
        this.writeLog(LogLevel.warning, message, event, error);
    }

    public abstract newLogger(logName: string): Logger;

    protected onWriteLog(logEntry: LogEntry, error?: Error): void {
        logEntry = logEntry;
        error = error;
    }

    public getLogLevel(): "none" | "trace" | "debug" | "information" | "warning" | "error" | "fatal" {
        return this._logLevel;
    }

    public setLogLevel(logLevel: "none" | "trace" | "debug" | "information" | "warning" | "error" | "fatal"): Logger {
        // set
        LoggerBase.setLevel(this, logLevel);

        // get
        return this;
    }

    // Utilities
    private writeLog(level: string, message: string, event?: string, error?: Error) {
        // setup
        const configuration = Utilities.getLogConfiguration(); // TODO: check where to cache this property.
        const applicationName = this.channel.name;
        const logName = this.logName;
        const logEntry = LoggerBase.getLogEntry(applicationName, logName, level, message, event, error);

        // plugin
        this.onWriteLog(logEntry, error);

        // build
        const logLevel = logEntry.logLevel.toUpperCase();
        const data = [
            `timestamp:   ${logEntry.timestamp}`,
            `level:       ${LoggerBase.getLevelSymbol(logLevel.toLowerCase())} ${logLevel}`,
            `application: ${logEntry.applicationName}`,
            `logger:      ${logEntry.logName}`,
            `message:     ${logEntry.message}`
        ];

        // add reason
        if (logEntry.reason && logEntry.reason !== '') {
            data.push(`reason:      ${logEntry.reason}`);
        }

        // add error
        if (error !== null && error !== undefined) {
            data.push('#---------------------------------#');
            data.push('# ERROR                           #');
            data.push('#---------------------------------#');
            data.push(`${error.stack}`);
        }
        data.push('\n');

        // build
        const log = data.join('\n');

        // filter
        const isFilter = LoggerBase.assertFilter(configuration, logEntry);
        if (isFilter) {
            return;
        }

        // write
        this.channel.appendLine(log);
    }

    private static getLogEntry(applicationName: string, logName: string, level: string, message: string): LogEntry;
    private static getLogEntry(applicationName: string, logName: string, level: string, message: string, event?: string): LogEntry;
    private static getLogEntry(applicationName: string, logName: string, level: string, message: string, event?: string, error?: Error): LogEntry;
    private static getLogEntry(
        applicationName: string,
        logName: string,
        level: string,
        message: string,
        event?: string,
        error?: Error): LogEntry {

        // setup
        const iserror = error !== null && error !== undefined;
        const isEvent = event !== null && event !== undefined && event !== LogEvents.unknown;
        const timestamp = Utilities.getTimestamp();
        const reason = isEvent ? this.getReason(event) : '';

        // setup entry
        let logEntry: LogEntry = {
            applicationName: applicationName,
            logName: logName,
            message: message,
            timestamp: timestamp,
            logLevel: level
        };

        if (iserror) {
            logEntry.error = error;
        }

        if (reason !== '') {
            logEntry.reason = reason;
        }

        // get
        return logEntry;
    }

    private static setLevel(instance: any, logLevel: "none" | "trace" | "debug" | "information" | "warning" | "error" | "fatal") {
        // get all log level properties
        var properties = this.getLogLevels(instance);

        // get property
        var property = properties.find(p => p.toUpperCase().match(logLevel.toUpperCase()));
        if (property === undefined) {
            return this;
        }

        // switch on selected level
        instance[property] = true;

        // switch off all other levels
        for (let i = 0; i < properties.length; i++) {
            const element = properties[i].toUpperCase();
            if (element !== property.toUpperCase()) {
                instance[properties[i]] = false;
            }
        }
    }

    private static getLogLevels(instance: any) {
        // setup
        const obj = instance;
        const properties = [];

        // collect
        for (let member in obj) {
            const property = obj[member];
            if (typeof property === 'boolean') {
                properties.push(member);
            }
        }

        // get
        return properties;
    }

    private static getLevelSymbol(logLevel: string): string {
        // setup
        const symbols: { [key: string]: string } = {
            'trace': '⚐',
            'debug': '⚑',
            'information': '🛈',
            'warning': '⚠',
            'error': '☢',
            'fatal': '☢',
        };

        // get
        return symbols[logLevel];
    }

    private static getReason(event: string) {
        // get
        try {
            return this._events[event];
        } catch (error) {
            return '';
        }
    }

    private static assertFilter(configuration: LogConfiguration, logEntry: LogEntry): boolean {
        try {
            // setup
            let type = configuration.sourceOptions?.filter;
            const sources = configuration.sourceOptions?.sources;
            const isType = type !== null && type !== undefined;
            const isSources = sources !== null && sources !== undefined && sources.length > 0;

            // build
            const logTypes: string[] = isType && isSources ? sources : [];
            const filterType = isType ? type : 'include';

            // negative (no sources)
            if (!isSources) {
                return false;
            }

            // assert
            const isSource = logTypes.map(i => i.toUpperCase()).includes(logEntry.logName.toUpperCase());

            // get
            if (filterType === 'exclude' && isSource) {
                return true;
            }
            if (filterType === 'include' && !isSource) {
                return true;
            }

            // default
            return false;
        } catch (error: any) {
            return false;
        }
    }

    //#region *** Compliance ***
    private getTraceCompliance = () => this.isTraceEnabled;
    private getDebugCompliance = () => this.getTraceCompliance() || this.isDebugEnabled;
    private getInformationCompliance = () => this.getDebugCompliance() || this.isInformationEnabled;
    private getWarningCompliance = () => this.getInformationCompliance() || this.isWarningEnabled;
    private getErrorCompliance = () => this.getWarningCompliance() || this.isErrorEnabled;
    private getFatalCompliance = () => this.getErrorCompliance() || this.isFatalEnabled;
    //#endregion
}

export class LogEvents {
    public static readonly unknown: string = 'EXT000';
    public static readonly noConnection: string = 'AGT001';
    public static readonly noResults: string = 'AGT002';
}
