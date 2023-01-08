export const logLevelIds = [ 'Trace', 'Debug' , 'Information', 'Warning', 'Error', 'Fatal', ] as const

export const gravityLogStartText = ['Rhino.Agent'] as const;
export const rhinoLogStartText = ['DBG', 'ERR', 'FTL', 'INF', 'TRC', 'WRN'] as const;

export type LogLevelId = typeof logLevelIds[number];

export const GravityLogLevels: Record<LogLevelId, string> = {
    Debug: "Debug",
    Trace: "Trace",
    Information: "Information",
    Warning: "Warning",
    Error: "Error",
    Fatal: "Fatal"
} as const;
export const RhinoLogLevels: Record<LogLevelId, string> = {
    Debug: "DBG",
    Trace: "TRC",
    Information: "INF",
    Warning: "WRN",
    Error: "ERR",
    Fatal: "FTL"
} as const;


export interface LogMessage {
    source: string;
    level: string;
    message: string;
    formattedMessage: string;
}

export interface GravityLogMessage extends LogMessage{
}

export interface RhinoLogMessage extends LogMessage{
    /**
     * Logger
     */
    loggerName: string;
    timeStamp: string;
    /**
     * MachineName
     */
    machineName: string;
}