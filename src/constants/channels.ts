import * as vscode from 'vscode';

export class Channels {
    public static agent: vscode.OutputChannel = vscode.window.createOutputChannel('Rhino Agent', 'rhinolog');
    public static extension: vscode.OutputChannel = vscode.window.createOutputChannel('Rhino Extension', 'rhinolog');
}
