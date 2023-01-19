export enum LogLevel {
    trace,
    debug,
    information,
    warning,
    error,
    fatal
}

export type LogLevelName = keyof typeof LogLevel;

export const gravityLogLevelNames: Record<LogLevelName, string> = {
    debug: "Debug",
    trace: "Trace",
    information: "Information",
    warning: "Warning",
    error: "Error",
    fatal: "Fatal"
} as const;

export const rhinoLogLevelNames: Record<LogLevelName, string> = {
    debug: "DEBUG",
    trace: "TRACE",
    information: "INFO",
    warning: "WARN",
    error: "ERROR",
    fatal: "FATAL"
} as const;


export interface LogMessage {
    source: string;
    level: LogLevelName;
    timeStamp: string;
    message: string;
    formattedMessage: string;
}

export interface GravityLogMessage extends LogMessage {
}

export interface RhinoLogMessage extends LogMessage {
    /**
     * If loggerName exists, is {application}.{loggerName}, otherwise equals to {application}.
     */
    source: string;
    /**
     * Logger
     */
    loggerName?: string;
    application: string;

    /**
     * MachineName
     */
    machineName: string;
    exception?: string;
}
