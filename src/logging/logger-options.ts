import { LogLevel, LogLevelName } from "./log-models";


interface SourceOptions {
    sourcesFilterLogic: 'Include' | 'Exclude';
    sources: string[];
}

export class LoggerOptions{
    public logLevel:LogLevelName = 'TRACE';
    public sourceOptions?: SourceOptions;

    /**
     *
     */
    constructor(init? : Partial<LoggerOptions>) {
        Object.assign(this, init);
        
    }
    // public isTraceEnabled(): boolean {
    //     return LogLevel[this.logLevel] >= LogLevel.TRACE;
    // }
    // public isDebugEnabled(): boolean {
    //     return LogLevel[this.logLevel] >= LogLevel.DEBUG;
    // }
    // public isInfoEnabled(): boolean {
    //     return LogLevel[this.logLevel] >= LogLevel.INFORMATION;
    // }
    // public isWarningEnabled(): boolean {
    //     return LogLevel[this.logLevel] >= LogLevel.WARNING;
    // }
    // public isErrorEnabled(): boolean {
    //     return LogLevel[this.logLevel] >= LogLevel.ERROR;
    // }
    // public isFatalEnabled(): boolean {
    //     return LogLevel[this.logLevel] >= LogLevel.FATAL;
    // }

    public isLogLevelEnabled(logLevel: LogLevelName):boolean{
        return LogLevel[this.logLevel] <= LogLevel[logLevel];
    }

}