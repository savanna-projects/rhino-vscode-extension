import { GravityLogMessage, LogLevel, LogLevelName, LogMessage, RhinoLogMessage } from "./log-models";

/**
 * Custom type guard to assert whether an unknown object is a LogLevelName.
 */
export function isLogLevelName(maybeLogLevelName: unknown): maybeLogLevelName is LogLevelName {
    return typeof maybeLogLevelName === 'string' && Object.keys(LogLevel).includes(maybeLogLevelName);
}

export function isRhinoLog(logMessage: LogMessage): logMessage is RhinoLogMessage {
    return Object.prototype.hasOwnProperty.call(logMessage, "application")
        && Object.prototype.hasOwnProperty.call(logMessage, "machineName");
}

export function isGravityLog(logMessage: LogMessage): logMessage is GravityLogMessage {
    return !Object.prototype.hasOwnProperty.call(logMessage, "application")
        && !Object.prototype.hasOwnProperty.call(logMessage, "machineName")
        && Object.prototype.hasOwnProperty.call(logMessage, "timestamp")
        && Object.prototype.hasOwnProperty.call(logMessage, "source")
        && Object.prototype.hasOwnProperty.call(logMessage, "level")
        && Object.prototype.hasOwnProperty.call(logMessage, "message")
        && Object.prototype.hasOwnProperty.call(logMessage, "formattedMessage");
}

export function isLogMessage(object: any): object is LogMessage {
    return Object.prototype.hasOwnProperty.call(object, "source")
        && Object.prototype.hasOwnProperty.call(object, "level")
        && Object.prototype.hasOwnProperty.call(object, "message")
        && Object.prototype.hasOwnProperty.call(object, "formattedMessage");
}

