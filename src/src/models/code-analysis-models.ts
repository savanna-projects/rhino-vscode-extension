import * as vscode from 'vscode';

export type DocumentData = {
    lines: string[];
    range: vscode.Range;
    rhinoRange?: RhinoRangeMap[]
};
export type PluginData = Record<string, string>;

export type RhinoRangeMap = {
    rhinoPosition: vscode.Position;
    actualLine: number;
};

export class DiagnosticModel {
    public type: string;
    public code?: Code;
    public description: string;
    public expression: RegExp;
    public id: string;
    public multiline: boolean;
    public sections?: string[];
    public severity: vscode.DiagnosticSeverity;
    public source?: string;
    public tags?: vscode.DiagnosticTag;
    public entities: ("Plugin" | "Test" | "Model")[];

    constructor() {
        this.type = 'positive';
        this.description = '';
        this.expression = new RegExp(/.*/);
        this.id = '';
        this.multiline = true;
        this.severity = vscode.DiagnosticSeverity.Hint;
        this.entities = [];
    }
}

class Code {
    public target: string = '';
    public value: string = '';
}