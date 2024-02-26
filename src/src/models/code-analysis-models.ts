import * as vscode from 'vscode';

export type DocumentData = {
    lines: string[];
    range: vscode.Range;
    formattedRange?: FormattedRangeMap[]
};

export type FormattedRangeMap = {
    formattedPosition: vscode.Position;
    actualLine: number;
};