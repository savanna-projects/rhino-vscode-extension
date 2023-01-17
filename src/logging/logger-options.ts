import { LogLevelName } from "./log-models";

export interface SourceOptions {
    sourcesFilterLogic: 'Include' | 'Exclude';
    sources: string[];
}

/**
 * Options for determining which source and log levels to write to channel output.
 */
export class LoggerOptions {
    /**
     * The minimum log level to write, filtering out everything below it. Default is 'INFORMATION'.
     */
    public logLevel: LogLevelName = 'information';

    /**
     * Exclude or include an array of server log sources.
     */
    public sourceOptions: SourceOptions = { sourcesFilterLogic: 'Exclude', sources: [] };

    constructor(init?: Partial<LoggerOptions>) {
        Object.assign(this, init);
    }
}
