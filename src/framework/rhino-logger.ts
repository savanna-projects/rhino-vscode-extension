/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * WORK ITEMS
 * TODO: Implement log levels.
 */
import * as vscode from 'vscode';

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
    
    /**
     *
     */
    constructor(channelName: string) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
        
    }
    /**
     * Append the given value and a line feed character to the channel.
     */
    appendLine(log: string | object): void {
        var logMessage = typeof log == 'object' ? JSON.stringify(log) : log;
        this.outputChannel.appendLine(logMessage);
    }

    /**
     * Append the given value to the channel.
     */
    append(log: string | object): void {
        var logMessage = typeof log == 'object' ? JSON.stringify(log) : log;
        // `${Utilities.getTimestamp()} - ${logMessage}`
        this.outputChannel.append(logMessage);
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
