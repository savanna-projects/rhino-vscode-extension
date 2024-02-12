import * as fs from 'fs';
import * as vscode from 'vscode';
import path = require('path');
import { Logger } from '../logging/logger';
import { ExtensionLogger } from '../logging/extensions-logger';
import { Channels } from '../constants/channels';
import { TmLanguageCreateModel } from '../models/tm-create-model';

export class StaticCodeAnalyzer {
    private readonly _createModel: TmLanguageCreateModel | Promise<TmLanguageCreateModel>;
    private readonly _context: vscode.ExtensionContext;
    private readonly _diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('rhino');
    private readonly _diagnosticModels: DiagnosticModel[];
    private readonly _logger: Logger;
    private fileUris: vscode.Uri[] = [];
    /**
     * Summary. Creates a new instance of VS Static Code Analysis for Rhino API.
     * 
     * @param context The context under which to trigger the analyzer.
     */
    constructor(context: vscode.ExtensionContext, createModel: TmLanguageCreateModel | Promise<TmLanguageCreateModel>) {
        this._createModel = createModel;
        this._context = context;
        this._diagnosticModels = [];
        this._logger = new ExtensionLogger(Channels.extension, 'StaticCodeAnalyzer');
    }

    public register() {
        this.initialAnalyzer();
        vscode.workspace.onDidOpenTextDocument(document => this.analyzer(document));
        vscode.workspace.onDidChangeTextDocument(e => this.analyzer(e.document));
    }

    public async initialAnalyzer(){
        
        this.fileUris = await vscode.workspace.findFiles('**/*.rhino');
        this.fileUris.forEach(async (uri) => {
            
            let document = await vscode.workspace.openTextDocument(uri);
            this.analyzer(document);
        });
    }
    public async analyzer(doc: vscode.TextDocument) {
        // exit conditions
        const isRhino = doc.fileName.endsWith('.rhino');
        const isRhinoModel = doc.fileName.endsWith('.rmodel');
        if (!isRhino && !isRhinoModel) {
            return;
        }

        // setup
        let rules = this.resolveRules();
        const diagnostics: vscode.Diagnostic[] = [];

        // identify file type
        const isModelType = isRhinoModel;
        const isTestType = doc.fileName.match(/(\\|\/)+src(\\|\/)+Tests/) !== null || doc.fileName.endsWith(".rhino");
        const isPluginType = doc.fileName.match(/(\\|\/)+src(\\|\/)+Plugins/) !== null || doc.fileName.endsWith(".rplugin");

        // filter
        if (isModelType) {
            rules = rules.filter(i => i.entities?.includes("Model"));
        }
        else if (isPluginType) {
            rules = rules.filter(i => i.entities?.includes("Plugin"));
        }
        else if (isTestType) {
            rules = rules.filter(i => i.entities?.includes("Test"));
        }

        // build
        for (const rule of rules) {
            const diagnostic = this.newDiagnostics(rule, doc);
            diagnostics.push(...(await diagnostic));
        }

        // register
        this._diagnosticCollection.set(doc.uri, diagnostics);
        this._context.subscriptions.push(this._diagnosticCollection);
    }

    private async newDiagnostics(diagnosticModel: DiagnosticModel, document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics = diagnosticModel.multiline
            ? await this.resolveMultilineRule(diagnosticModel, document)
            : this.resolveSinglelineRule(diagnosticModel, document);

        // get
        return diagnostics;
    }

    // TODO: figure how to get range
    private resolveSinglelineRule(diagnosticModel: DiagnosticModel, document: vscode.TextDocument): vscode.Diagnostic[] {
        console.log(diagnosticModel);
        throw new Error();
    }

    // TODO: optimize complexity
    private async resolveMultilineRule(diagnosticModel: DiagnosticModel, document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        // exit conditions
        if (!document) {
            return [];
        }

        // setup
        const annotations = (await this._createModel).annotations;
        const diagnostics: vscode.Diagnostic[] = [];
        // const document = vscode.window.activeTextEditor.document;
        const documentData = {
            lines: document.getText().split(/\r?\n|\n\r?/),
            range: this.getDocumentRange(document)
            // range: this.getActiveDocumentRange(vscode.window.activeTextEditor)
        };
        const sections = diagnosticModel.sections === undefined
            ? [documentData]
            : diagnosticModel.sections.map(i => this.getSection(documentData.lines, i, annotations));

        // iterate
        sections.forEach(section => {
            for (let i = 0; i < section.lines.length; i++) {
                const line = section.lines[i];
                const isNegative = diagnosticModel.type.toUpperCase() === 'NEGATIVE';
                const isPositive = diagnosticModel.type.toUpperCase() === 'POSITIVE';

                if (isNegative) {
                    let collection = this.assertNegative(diagnosticModel, section.range.start.line + i, line);
                    diagnostics.push(...collection);
                }
                else if (isPositive) {
                    let collection = this.assertPositive(diagnosticModel, section.range.start.line + i, line);
                    diagnostics.push(...collection);
                }
            }
        });

        // get
        return diagnostics;
    }

    private assertNegative(diagnosticModel: DiagnosticModel, lineNumber: number, line: string): vscode.Diagnostic[] {
        // exit conditions
        if (line.match(diagnosticModel.expression)) {
            return [];
        }

        // setup
        const start = new vscode.Position(lineNumber, 0);
        const end = new vscode.Position(lineNumber, line.length);
        const range = new vscode.Range(start, end);
        const diagnostic = new vscode.Diagnostic(range, diagnosticModel.description, diagnosticModel.severity);

        if(diagnosticModel.code){
            diagnostic.code = {
                target: vscode.Uri.parse(diagnosticModel.code.target),
                value: diagnosticModel.code.value
            };
        }

        // get
        return [diagnostic];
    }

    private assertPositive(diagnosticModel: DiagnosticModel, lineNumber: number, line: string) {
        // setup
        const diagnostics: vscode.Diagnostic[] = [];

        // iterate
        let result;
        while (result = diagnosticModel.expression.exec(line)) {
            const start = new vscode.Position(lineNumber, result.index);
            const end = new vscode.Position(lineNumber, result.index + result[0].length);
            const range = new vscode.Range(start, end);
            const diagnostic = new vscode.Diagnostic(range, diagnosticModel.description, diagnosticModel.severity);

            if(diagnosticModel.code!== null && diagnosticModel.code!==undefined){
                diagnostic.code = {
                    target: vscode.Uri.parse(diagnosticModel.code.target),
                    value: diagnosticModel.code.value
                };
            }

            diagnostics.push(diagnostic);
        }

        // get
        return diagnostics;
    }


    private getDocumentRange(document: vscode.TextDocument) {
        // setup
        var firstLine = document.lineAt(0);
        var lastLine = document.lineAt(document.lineCount - 1);

        // get
        return new vscode.Range(firstLine.range.start, lastLine.range.end);
    }

    //#region *** Read Rules Files ***
    private resolveRules(): DiagnosticModel[] {
        const diagnosticModels: DiagnosticModel[] = [];
        try {
            // setup
            const rootPath = path.resolve(__dirname, '../..');
            const directoryPath = path.join(rootPath, 'rules');
            const files = fs.readdirSync(directoryPath);

            // build
            for (const file of files) {
                const filePath = path.join(directoryPath, file);
                const models = this.convertFromFile(filePath);
                diagnosticModels.push(...models);
            }
        } catch (error: any) {
            this._logger.error('Resolve-Rules = (InternalServerError)', '-1', error);
        }

        // default
        return diagnosticModels;
    }

    private convertFromFile(filePath: string): DiagnosticModel[] {
        try {
            // setup
            const modelsData = fs.readFileSync(filePath, 'utf8');
            const models = JSON.parse(modelsData);
            const diagnosticModels: DiagnosticModel[] = [];

            // build
            for (const model of models) {
                const diagnosticModel = this.convertFromEntry(model);

                if (diagnosticModel === undefined) {
                    continue;
                }

                diagnosticModels.push(diagnosticModel);
            }

            // get
            return diagnosticModels;
        } catch (error: any) {
            const message = `ConvertFrom-File -FilePath ${filePath} = (InternalServerError)`;
            this._logger.error(message, '-1', error);
            return [];
        }
    }

    private convertFromEntry(entry: any): DiagnosticModel | undefined {
        try {
            // setup
            const model = new DiagnosticModel();
            model.type = entry.type;
            model.description = entry.description;
            model.expression = new RegExp(entry.expression, 'g');
            model.id = entry.id;
            model.sections = entry.sections;
            model.severity = StaticCodeAnalyzer.getSeverity(entry.severity);
            model.entities = entry.entities;
            model.code = entry.code;

            // get
            return model;
        } catch (error: any) {
            const message = `ConvertFrom-Entry = (InternalServerError)`;
            this._logger.error(message, '-1', error);
            return undefined;
        }
    }

    private static getSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity.toUpperCase()) {
            case 'ERROR':
                return vscode.DiagnosticSeverity.Error;
            case 'HINT':
                return vscode.DiagnosticSeverity.Hint;
            case 'INFORMATION':
                return vscode.DiagnosticSeverity.Information;
            case 'WARNING':
                return vscode.DiagnosticSeverity.Warning;
            default:
                return vscode.DiagnosticSeverity.Hint;
        }
    }
    //#endregion

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A collection of utility methods
      └────────────────────────────────────────────────────────*/
    private getSection(document: string[], annotation: string, annotations: any[]): any {
        try {
            // bad request
            if (annotations === undefined || annotations === null || annotations.length === 0) {
                return [];
            }

            // setup
            let lines: string[] = [];
            let map = annotations.map((i) => i.key).filter((i) => i !== annotation);
            let pattern = map.map((i) => '^\\[' + i + ']').join('|');
            let testPattern = '^\\[' + annotation + ']';

            // get line number
            let onLine = 0;
            for (onLine; onLine < document.length; onLine++) {
                if (document[onLine].match(testPattern) !== null) {
                    break;
                }
            }
            let start = new vscode.Position(onLine, 0);

            // iterate
            while (onLine < document.length) {
                if (document[onLine].match(pattern)) {
                    break;
                }
                lines.push(document[onLine]);
                onLine += 1;
            }
            let end = new vscode.Position(onLine - 1, 0);

            // default
            return {
                lines: lines,
                range: new vscode.Range(start, end)
            };
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}

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
