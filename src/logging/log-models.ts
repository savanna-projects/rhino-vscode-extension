export enum LogLevel {
    TRACE,
    DEBUG,
    INFORMATION,
    WARNING,
    ERROR,
    FATAL
}

export type LogLevelName = keyof typeof LogLevel;



/**
 * Custom type guard to assert whether an unknown object is a LogLevelName.
 */
export function isLogLevelName(maybeLogLevelName: unknown): maybeLogLevelName is LogLevelName {
    return typeof maybeLogLevelName === 'string' && Object.keys(LogLevel).includes(maybeLogLevelName);
}


export const GravityLogLevelNames: Record<LogLevelName, string> = {
    DEBUG: "Debug",
    TRACE: "Trace",
    INFORMATION: "Information",
    WARNING: "Warning",
    ERROR: "Error",
    FATAL: "Fatal"
} as const;
export const RhinoLogLevelNames: Record<LogLevelName, string> = {
    DEBUG: "DBG",
    TRACE: "TRC",
    INFORMATION: "INF",
    WARNING: "WRN",
    ERROR: "ERR",
    FATAL: "FTL"
} as const;


export interface LogMessage {
    source: string;
    level: LogLevelName;
    timeStamp: string;
    message: string;
    formattedMessage: string;
}


export function isLogMessage(object: any): object is LogMessage{
    return Object.prototype.hasOwnProperty.call(object, "source")
    && Object.prototype.hasOwnProperty.call(object, "level") 
    && Object.prototype.hasOwnProperty.call(object, "message")
    && Object.prototype.hasOwnProperty.call(object, "formattedMessage");
}

export interface GravityLogMessage extends LogMessage{
}

export interface RhinoLogMessage extends LogMessage{
    /**
     * If loggerName exists, is of {application}.{loggerName}, otherwise equals to {application}.
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