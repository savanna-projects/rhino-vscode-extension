import { LogLevel, LogLevelName } from "./log-models";


interface SourceOptions {
    sourcesFilterLogic: 'Include' | 'Exclude';
    sources: string[];
}
/**
 * Options for determining which source and log levels to write to channel output.
 */
export class LoggerOptions{
    public logLevel:LogLevelName = 'TRACE';
    public sourceOptions: SourceOptions = {sourcesFilterLogic: 'Exclude', sources: []};

    /**
     * 
     */
    constructor(init? : Partial<LoggerOptions>) {
        Object.assign(this, init);
        
    }

    public isLogLevelEnabled(logLevel: LogLevelName):boolean{
        return LogLevel[this.logLevel] <= LogLevel[logLevel];
    }

}