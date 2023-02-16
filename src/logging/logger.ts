import * as vscode from 'vscode';

export interface Logger {
    /**
     * Gets a value indicating to add error level logs and above to the extension console.
     */
    readonly addConsole: boolean;
    
    /**
     * Gets the log channel.
     */
    readonly channel: vscode.OutputChannel;

    /**
     * Gets the log name.
     */
    readonly logName: string;

    /**
     * Determines if messages of priority "trace" will be logged.
     */
    isTraceEnabled: boolean;

    /**
     * Determines if messages of priority "debug" will be logged.
     */
    isDebugEnabled: boolean;

    /**
     * Determines if messages of priority "error" will be logged.
     */
    isErrorEnabled: boolean;

    /**
     * Determines if messages of priority "fatal" will be logged.
     */
    isFatalEnabled: boolean;

    /**
     * Determines if messages of priority "info" will be logged.
     */
    isInformationEnabled: boolean;

    /**
     * Determines if messages of priority "warn" will be logged.
     */
    isWarningEnabled: boolean;

    /**
     * Creates a new child logger with the same channel as the parent logger.
     * 
     * @param logName The logger name.
     */
    newLogger(logName: string): Logger;

    /**
     * Sets the log level.
     */
    setLogLevel(logLevel: 'none' | 'trace' | 'debug' | 'information' | 'warning' | 'error' | 'fatal'): Logger;
    
    /**
     * Gets the log level.
     */
    getLogLevel(): 'none' | 'trace' | 'debug' | 'information' | 'warning' | 'error' | 'fatal';

    /**
     * Logs a trace message.
     * 
     * @param message The message to log.
     * @param event   The log event id.
     * @param error   The error to log.
     */
    trace(message: string): void;
    trace(message: string, event?: string): void;
    trace(message: string, event?: string, error?: Error | undefined): void;

    /**
     * Logs a debug message.
     * 
     * @param message The message to log.
     * @param event   The log event id.
     * @param error   The error to log.
     */
    debug(message: string): void;
    debug(message: string, event?: string): void;
    debug(message: string, event?: string, error?: Error | undefined): void;

    /**
     * Logs an error message.
     * 
     * @param message The message to log.
     * @param event   The log event id.
     * @param error   The error to log.
     */
    error(message: string): void;
    error(message: string, event?: string): void;
    error(message: string, event?: string, error?: Error | undefined): void;

    /**
     * Logs a fatal message.
     * 
     * @param message The message to log.
     * @param event   The log event id.
     * @param error   The error to log.
     */
    fatal(message: string): void;
    fatal(message: string, event?: string): void;
    fatal(message: string, event?: string, error?: Error | undefined): void;

    /**
     * Logs an information message.
     * 
     * @param message The message to log.
     * @param event   The log event id.
     * @param error   The error to log.
     */
    information(message: string): void;
    information(message: string, event?: string): void;
    information(message: string, event?: string, error?: Error | undefined): void;

    /**
     * ogs a warning message.
     * 
     * @param message The message to log.
     * @param event   The log event id.
     * @param error   The error to log.
     */
    warning(message: string): void;
    warning(message: string, event?: string): void;
    warning(message: string, event?: string, error?: Error | undefined): void;
}

export class LogLevel {
    public static readonly none: 'none' = 'none';
    public static readonly trace: 'trace' = 'trace';
    public static readonly debug: 'debug' = 'debug';
    public static readonly information: 'information' = 'information';
    public static readonly warning: 'warning' = 'warning';
    public static readonly error: 'error' = 'error';
    public static readonly fatal: 'fatal' = 'fatal';
}

export type LogEntry = {
    applicationName: string,
    error?: Error
    logLevel: string,
    logName: string,
    message: string,
    timestamp: string,
    reason?: string
};
