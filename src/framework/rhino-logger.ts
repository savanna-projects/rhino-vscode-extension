/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * WORK ITEMS
 * TODO: Implement log levels.
 */
import * as vscode from 'vscode';
import { isLogMessage, LogMessage } from '../logging/log-models';
import { LoggerOptions } from '../logging/logger-options';

export interface IRhinoLogger {
    appendLine(log: string | object): void
    append(log: string | object): void
    replace(value: string): void
    show(preserveFocus?: boolean | undefined): void
    hide(): void
}

var logger: RhinoLogger;

export class RhinoLogger implements IRhinoLogger {
    // members
    private outputChannel: vscode.OutputChannel;
    private loggerOptions: LoggerOptions;
    /**
     *
     */
    constructor(channelName: string, loggerOptions?: LoggerOptions) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
        this.loggerOptions = loggerOptions ?? new LoggerOptions();
        
    }

    /**
     * Append the given value and a line feed character to the channel.
     */
    appendLine(log: string): void {
        this.outputChannel.appendLine(log);
    }

    /**
     * Appends the given value to the channel, if it complies with the {@link loggerOptions logger options} criteria.
     */
    //TODO: 
    append(log: LogMessage): void
    append(log: string): void
    append(log: object): void
    append(log: any): void {
        let logMessage: string;
        if(typeof log == 'object'){
            if(isLogMessage(log)){
                if(this.isLogCompliant(log)){
                    logMessage = log.formattedMessage;
                }
                else{
                    return;
                }
            }
            else{
                logMessage = JSON.stringify(log);
            }
        }
        else{
            logMessage = log;
        }
        
        this.outputChannel.append(logMessage);
    }

    private isLogCompliant(logMessage: LogMessage): boolean{
        if(!this.loggerOptions.isLogLevelEnabled(logMessage.level)){
            return false;
        }
        let sourceOptions = this.loggerOptions?.sourceOptions ?? {};
        return sourceOptions?.sourcesFilterLogic == 'Exclude' ? 
                !sourceOptions.sources.includes(logMessage.source) :
                sourceOptions.sources.includes(logMessage.source);
    }

    // info(log: string | object): void {
    //     this.outputChannel.appendLine(`${this.getTimestamp()} - ${JSON.stringify(log)}`);
    // }
    // warn(log: string | object): void {
    //     this.outputChannel.appendLine(`${this.getTimestamp()} - ${JSON.stringify(log)}`);
    // }
    // error(log: string | object): void {
    //     this.outputChannel.appendLine(`${this.getTimestamp()} - ${JSON.stringify(log)}`);
    // }
    // fatal(log: string | object): void {
    //     this.outputChannel.appendLine(`${this.getTimestamp()} - ${JSON.stringify(log)}`);
    // }
    
    
    replace(value: string): void {
        this.outputChannel.replace(value);
    }
    clear(): void {
        this.outputChannel.clear();
    }
    show(preserveFocus?: boolean | undefined): void{
        this.outputChannel.show(preserveFocus);
    }
    hide(): void {
        this.outputChannel.hide();
    }

    public getOutputChannel(): vscode.OutputChannel{
        return this.outputChannel;
    }

}

export function getRhinoLogger(){
    if(!logger){
        logger = new RhinoLogger('rhino-language-support');
    }
    return logger;
}
