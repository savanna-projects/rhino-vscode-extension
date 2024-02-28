import * as vscode from 'vscode';

export type DocumentData = {
    lines: string[];
    range: vscode.Range;
    rhinoRange?: RhinoRangeMap[]
};
export type RhinoRangeMap = {
    rhinoPosition: vscode.Position;
    actualLine: number;
};