/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * WORK ITEMS
 * TODO: split actions inside different calsses which represents the backend structure.
 */
import * as vscode from 'vscode';

export class RhinoLogger {
    // members
    private outputChannel: vscode.OutputChannel;

    /**
     * Summary. Creates a new instance of RhinoClient.
     */
    constructor(channelName: string) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
        this.outputChannel.show();
    }


    public appendLine(message: string){
        this.outputChannel.appendLine(message);
    }

    public append(message: string){
        this.outputChannel.append(message);
    }
}
