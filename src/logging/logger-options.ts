import { LogLevelName } from "./log-models";
import { isLogLevelName } from "./log-models-typeguards";

export interface SourceOptions {
    sourcesFilterLogic: 'Include' | 'Exclude';
    sources: string[];
}

/**
 * Options for determining which source and log levels to write to channel output.
 */
export class LoggerOptions {


    private readonly defaultLogLevel: LogLevelName = 'information';
    /**
     * The minimum log level to write, filtering out everything below it. Default is 'information'.
     */
    public logLevel: LogLevelName = this.defaultLogLevel;

    /**
     * Exclude or include an array of server log sources.
     */
    public sourceOptions: SourceOptions = { sourcesFilterLogic: 'Exclude', sources: [] };

    constructor(init?: Partial<LoggerOptions>) {
        if (init?.logLevel) {
            let logLevelName = init.logLevel.toLowerCase();
            init.logLevel = isLogLevelName(logLevelName) ? logLevelName : this.defaultLogLevel;
        }
        Object.assign(this, init);
    }
}
