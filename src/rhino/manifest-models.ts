import { LoggerOptions } from "../logging/logger-options";

export interface LoggerConfig {
    name: string;
    enableClientSideLogging: boolean;
    loggerOptions?: LoggerOptions;
}

export interface RhinoServerConfig {
    schema: string;
    host: string;
    port: string;
}