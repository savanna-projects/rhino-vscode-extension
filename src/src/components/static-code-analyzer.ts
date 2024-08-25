import * as fs from 'fs';
import * as vscode from 'vscode';
import path = require('path');
import { Logger } from '../logging/logger';
import { ExtensionLogger } from '../logging/extensions-logger';
import { Channels } from '../constants/channels';
import { TmLanguageCreateModel } from '../models/tm-create-model';
import { DiagnosticModel, DocumentData, RhinoRangeMap } from '../models/code-analysis-models';
import { commentRegex, multilineRegex } from '../formatters/formatConstants';


const rhinoExtensions = ['.rhino', '.rmodel', '.rplugin'];

export class StaticCodeAnalyzer {
    private readonly _createModel: TmLanguageCreateModel | Promise<TmLanguageCreateModel>;
    private readonly _context: vscode.ExtensionContext;
    private readonly _diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('rhino');
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
        this._logger = new ExtensionLogger(Channels.extension, 'StaticCodeAnalyzer');
    }

    public register() {
        this.initialAnalyzer();
        vscode.workspace.onDidOpenTextDocument(document => this.analyzer(document));
        vscode.workspace.onDidChangeTextDocument(e => this.analyzer(e.document));
    }

    public async initialAnalyzer(){
        
        this.fileUris = await vscode.workspace.findFiles(`**/*{${rhinoExtensions.join(',')}}`);
        this.fileUris.forEach(async (uri) => {
            
            let document = await vscode.workspace.openTextDocument(uri);
            this.analyzer(document);
        });
    }
    public async analyzer(doc: vscode.TextDocument) {
        // exit conditions
        let isRhinoFile = this.isRhinoFile(doc);
        
        if (!isRhinoFile) {
            return;
        }

        // setup
        let rules = this.resolveRules();
        const diagnostics: vscode.Diagnostic[] = [];

        // identify file type
        const isModelType = this.isModelFile(doc);
        const isTestType = this.isTestFile(doc);
        const isPluginType = this.isPluginFile(doc);

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

    private isRhinoFile(doc: vscode.TextDocument): boolean {
        let regexString = `(?:\\${rhinoExtensions.join('|\\')})$`;
        let isRhinoFileRegex = new RegExp(regexString);

        let isRhinoFile = isRhinoFileRegex.test(doc.fileName);
        return isRhinoFile;
    }

    private isPluginFile(doc: vscode.TextDocument): boolean {
        return doc.fileName.match(/(\\|\/)+src(\\|\/)+Plugins/) !== null || doc.fileName.endsWith(".rplugin");
    }

    private isModelFile(doc: vscode.TextDocument): boolean {
        return doc.fileName.match(/(\\|\/)+src(\\|\/)+Models/) !== null || doc.fileName.endsWith('.rmodel');
    }

    private isTestFile(doc: vscode.TextDocument): boolean {
        return doc.fileName.match(/(\\|\/)+src(\\|\/)+Tests/) !== null || doc.fileName.endsWith(".rhino");
    }

    private async newDiagnostics(diagnosticModel: DiagnosticModel, document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        const diagnostics = diagnosticModel.multiline
            ? await this.resolveMultilineRule(diagnosticModel, document)
            : await this.resolveSinglelineRule(diagnosticModel, document);

        // get
        return diagnostics;
    }

    private mergeRhinoMultilines(section: DocumentData): DocumentData{
        let lines:string[] = [];

        for(let sectionLine = 0; sectionLine < section.lines.length; sectionLine++){
            let line = section.lines[sectionLine];
            
            let previousLineNumber = sectionLine - 1 < 0 ? 0 : sectionLine - 1;

            let previousLine = section.lines[previousLineNumber];
            let isMatch = line.trim().match(multilineRegex) !== null;

            let isPreviousMatch = previousLine.trim().match(multilineRegex) !== null;
            let isMultiline = isMatch && isPreviousMatch || (!isMatch && isPreviousMatch);

            let formattedSectionLineNumber: number;
            let endCharacterIndex: number;
            if(isMultiline){
                formattedSectionLineNumber = lines.length - 1;
                let multiLine = lines[formattedSectionLineNumber];

                line = " " + line.replace(multilineRegex, "");
                multiLine = multiLine.replace(multilineRegex, "") + line;
                lines[formattedSectionLineNumber] = multiLine;
            }
            else{
                formattedSectionLineNumber = lines.length;
                lines.push(line);
            }
            endCharacterIndex = lines[formattedSectionLineNumber].length;
            let formattedRange: RhinoRangeMap = {
                actualLine: sectionLine + section.range.start.line,
                rhinoPosition: new vscode.Position(formattedSectionLineNumber + section.range.start.line, endCharacterIndex)
            };
            if(!section?.rhinoRange){
                section.rhinoRange = [];
            }
            section.rhinoRange.push(formattedRange);
        }
        section.lines = lines;
        return section;
    }
    // TODO: figure how to get range
    private async resolveSinglelineRule(diagnosticModel: DiagnosticModel, document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        // exit conditions
        if (!document) {
            return [];
        }

        // setup
        const diagnostics: vscode.Diagnostic[] = [];
        const documentData = this.getDocumentData(document);
        
        const sections: DocumentData[] = await this.getDocumentSections(documentData, diagnosticModel.sections);
        
        // merge Rhino multilines
        sections.forEach(section => section = this.mergeRhinoMultilines(section));

        // iterate
        sections.forEach(section => diagnostics.push(...this.assertRules(section, diagnosticModel)));

        // get
        return diagnostics;
    }
    private assertRules(section: DocumentData, diagnosticModel: DiagnosticModel){
        const diagnostics: vscode.Diagnostic[] = [];
        for (let sectionLineNumber = 0; sectionLineNumber < section.lines.length; sectionLineNumber++) {
            const line = section.lines[sectionLineNumber];
            if(line.match(commentRegex)){
                continue;
            }
            const isNegative = diagnosticModel.type.toUpperCase() === 'NEGATIVE';
            const isPositive = diagnosticModel.type.toUpperCase() === 'POSITIVE';

            let actualLineNumber = section.range.start.line + sectionLineNumber;
            let formattedRange = section.rhinoRange?.filter(r => r.rhinoPosition.line === actualLineNumber);
            let collection: vscode.Diagnostic[] = [];
            if (isNegative) {
                collection = this.assertNegative(diagnosticModel, actualLineNumber, line, formattedRange);
            }
            else if (isPositive) {
                collection = this.assertPositive(diagnosticModel, actualLineNumber, line, formattedRange);
            }
            diagnostics.push(...collection);
        }
        return diagnostics;
    }
    private getDocumentData(document: vscode.TextDocument){
        const documentData = {
            lines: document.getText().split(/\r?\n|\n\r?/),
            range: this.getDocumentRange(document),
            formattedRange: []
        };

        return documentData;
    }

    private async getDocumentSections(documentData: DocumentData, sections: string[] | undefined): Promise<DocumentData[]>{
        const annotations = (await this._createModel).annotations;
        const documentSections: DocumentData[] = !sections
            ? [{lines: [documentData.lines.join('\n')], range: new vscode.Range(documentData.range.start, documentData.range.end)}]
            // flatMap to remove 'undefined' results
            : sections.flatMap((section) => {
                let doc = this.getSection(documentData.lines, section, annotations);
                return doc ? doc : [];
            });

        return documentSections;
    }
    // TODO: optimize complexity
    private async resolveMultilineRule(diagnosticModel: DiagnosticModel, document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
        // exit conditions
        if (!document) {
            return [];
        }

        // setup
        const diagnostics: vscode.Diagnostic[] = [];
        const documentData = this.getDocumentData(document);
        
        const sections: DocumentData[] = await this.getDocumentSections(documentData, diagnosticModel.sections);

        // iterate
        sections.forEach(section => diagnostics.push(...this.assertRules(section, diagnosticModel)));

        // get
        return diagnostics;
    }

    private assertNegative(diagnosticModel: DiagnosticModel, lineNumber: number, line: string, rhinoRange: RhinoRangeMap[] | undefined): vscode.Diagnostic[] {
        // exit conditions
        
        if (line.match(diagnosticModel.expression)) {
            return [];
        }
        
            let sortedRange = rhinoRange && rhinoRange.length > 0 ? rhinoRange.sort((r1,r2) => r1.actualLine - r2.actualLine) : undefined;
            let actualStartLine = sortedRange ? sortedRange[0].actualLine : lineNumber;
            let actualEndLine = sortedRange ? sortedRange[sortedRange.length - 1].actualLine : lineNumber;
            let actualEndCharacter = sortedRange ? sortedRange[sortedRange.length - 1].rhinoPosition.character : line.length;
    
            // setup
            const start = new vscode.Position(actualStartLine, 0);
            const end = new vscode.Position(actualEndLine, actualEndCharacter);
            const range = new vscode.Range(start, end);
            const diagnostic = this.newDiagnostic(range, diagnosticModel);
        

            // get
            return [diagnostic];
    }

    private assertPositive(diagnosticModel: DiagnosticModel, lineNumber: number, line: string, rhinoRange: RhinoRangeMap[] | undefined) {
        // setup
        const diagnostics: vscode.Diagnostic[] = [];

        // iterate
        let result;
        while (result = diagnosticModel.expression.exec(line)) {
            let resultIndex = result.index;
            let actualLine: number;
            let actualStartCharacter: number;
            let actualEndCharacter: number;

            if(rhinoRange && rhinoRange.length > 0){
                let sortedRange = rhinoRange
                    .sort((r1,r2) => r1.actualLine - r2.actualLine)
                    .filter(i => i.rhinoPosition.character < resultIndex);

                let item = sortedRange.pop();
                
                actualLine = item ? item.actualLine : rhinoRange[0].actualLine;
                actualStartCharacter = item ? resultIndex - item.rhinoPosition.character : resultIndex;
            }
            else{
                actualLine = lineNumber;
                actualStartCharacter = resultIndex;
            }
            actualEndCharacter = actualStartCharacter + result[0].length;
            let start = new vscode.Position(actualLine, actualStartCharacter);
            let end = new vscode.Position(actualLine, actualEndCharacter);

            const range = new vscode.Range(start, end);
            const diagnostic = this.newDiagnostic(range, diagnosticModel);

            diagnostics.push(diagnostic);
        }

        // get
        return diagnostics;
    }


    private newDiagnostic(range: vscode.Range, diagnosticModel: DiagnosticModel) {
        const diagnostic = new vscode.Diagnostic(range, diagnosticModel.description, diagnosticModel.severity);

        if (diagnosticModel?.code) {
            diagnostic.code = {
                target: vscode.Uri.parse(diagnosticModel.code.target),
                value: diagnosticModel.code.value
            };
        }
        return diagnostic;
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
            model.multiline = entry?.multiline ? entry.multiline : false;
            model.expression = model.multiline ? new RegExp(entry.expression, 'g') : new RegExp(entry.expression, 'gs');
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
    private getSection(document: string[], annotation: string, annotations: any[]): DocumentData | undefined{
        try {
            // bad request
            if (!annotations) {
                return;
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
            return;
        }
    }
}


