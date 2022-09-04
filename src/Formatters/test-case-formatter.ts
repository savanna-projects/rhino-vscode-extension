/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { RhinoClient } from '../framework/rhino-client';
import { Formatter } from "./formatter";

export class TestCaseFormatter extends Formatter {
    // members:
    private annotations: any[];
    private excluded = [
        "test-actions",
        "test-expected-results",
        "test-data-provider",
        "test-setup",
        "test-cleanup",
        "test-parameters",
        "test-examples",
        "test-models"
    ];

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext, annotations: any[]) {
        super(context);
        this.annotations = annotations;
    }

    public format(document: vscode.TextDocument, callback: any): vscode.TextEdit[] {
        // setup
        let documentEntities = document.getText().split('>>>').map((i) => i.trim());;
        let documentFormatted = [];

        // iterate
        for (let i = 0; i < documentEntities.length; i++) {
            const documentEntity = documentEntities[i].split(/\r?\n|\n\r?/).map(i => i.trim());
            let metadataFormatted = this.formatMetadata(documentEntity, this.annotations);
            let actionsAndExpected = this.getInvocationSection(documentEntity, this.annotations);
            let dataSection = this.getDataSection(documentEntity, this.annotations);

            // normalize
            for (const line of documentEntity) {
                if (line.trim().startsWith('/**')) {
                    documentFormatted.push(line.trim());
                }
            }
            if (dataSection.examples.length > 0) {
                let examples = [''];
                examples.push(...dataSection.examples);
                dataSection.examples = examples;
            }

            // format
            documentFormatted.push(...metadataFormatted);
            documentFormatted.push(...dataSection.parameters);
            documentFormatted.push(...dataSection.dataProvider);
            documentFormatted.push(...actionsAndExpected);
            documentFormatted.push(...dataSection.examples);
            documentFormatted.push(...dataSection.models);

            // clean
            let index = documentFormatted.length - 1;
            while (documentFormatted[index] === '' && index > 0) {
                documentFormatted.splice(index, 1);
                index--;
            }

            // skip last
            if (i === documentEntities.length - 1) {
                continue;
            }

            // separator
            documentFormatted.push('')
            documentFormatted.push(">>>");
            documentFormatted.push('')
        }

        let range = this.getDocumentRange(document);
        let newText = documentFormatted.join('\n');
        let clearEdit = vscode.TextEdit.delete(range);
        let insertEdit = vscode.TextEdit.insert(new vscode.Position(0, 0), newText);

        // callback
        callback(newText)

        // get
        return [clearEdit, insertEdit];
    }

    /*┌─[ METADATA ]───────────────────────────────────────────
      │
      │ Sort, arrange and format the test metadata sections.
      └────────────────────────────────────────────────────────*/
    private formatMetadata(testCase: string[], annotations: string[]): string[] {
        try {
            // setup
            let formatMap = this.getMetadataFormatMap(annotations);
            let metadataMap = formatMap
                .filter(i => !this.excluded.some(j => j === i.key))
                .sort((a, b) => (a.order < b.order ? -1 : 1));

            // get
            let metadataSection = [];
            for (const item of metadataMap) {
                let lines = this.getSection(testCase, item.key, annotations).lines;
                if (lines.length === 0) {
                    continue;
                }
                let literal = item.literal;
                let indentation = ' '.repeat(item.indentation);
                metadataSection.push(literal + indentation + lines[0].replace(literal, '').trim());
            }
            metadataSection.push('');
            return metadataSection;
        }
        catch {
            return [];
        }
    }

    private getMetadataFormatMap(annotations: any[]): any[] {
        // setup
        let metadataMap = annotations
            .filter(i => !this.excluded.some(j => j === i.key))
            .map(i => i.literal.length);
        let maxLength = Math.max(...metadataMap) + 1;
        let map = [];

        // build
        for (const element of annotations) {
            let item = {
                key: element.key,
                literal: element.literal,
                match: '^\\[' + element.key + '\\]',
                order: element.entity.priority,
                indentation: maxLength - element.literal.length
            };
            map.push(item);
        }

        // get
        return map;
    }

    /*┌─[ TEST CASE & EXPECTED RESULTS ]───────────────────────
      │
      │ Sort, arrange and format the test and expected results
      │ sections.
      └────────────────────────────────────────────────────────*/
    private getInvocationSection(testCase: string[], annotations: string[]): string[] {
        try {
            // setup
            let actions = this.getActions(testCase, annotations);
            let expected = this.getAssertions(testCase, annotations, actions.total);

            // build
            let actionsSection = actions.section.map((i: any) => i.action);
            let assertionsSection = this.buildExpectedSection(expected);

            // get
            return [...actionsSection, ...assertionsSection];
        }
        catch {
            return [];
        }
    }

    private getActions(testCase: string[], annotations: string[]): any {
        // setup
        const commentRegex = /^((\W+)?\d+\.?)?(\s+)?\/\*{2}/g;
        const indexRegex = /^((\s+)?(\d+(\.+)?))+(\s+)?/g;
        let map: any[] = [];

        // build
        let actions = this
            .getSection(testCase, 'test-actions', annotations)
            .lines
            .map((i: string) => i.trim());
        let totalActions = actions.filter((i: string) => i !== '' && i.match(commentRegex) === null).length - 1;
        map.push({ type: "annotation", action: actions[0], index: -1 });

        // iterate
        let index = 1;
        for (let i = 1; i < actions.length; i++) {
            const action = actions[i];
            let isComment = action.match(commentRegex) !== null;
            let isEmpty = action === '';

            if (isEmpty) {
                continue;
            }
            if (isComment) {
                map.push({ type: "comment", action: action, index: index });
                continue;
            }

            let _index = index.toString();
            let _action = action.replace(indexRegex, '');
            let indent = totalActions.toString().length - _index.length;
            _action = _index + '. ' + ' '.repeat(indent) + _action;

            map.push({ type: "action", action: _action, index: index++ });
        }

        // get
        return {
            section: [...map].sort((a, b) => (a.index < b.index ? -1 : 1)),
            total: totalActions
        };
    }

    private getAssertions(testCase: string[], annotations: string[], totalActions: number): any {
        // setup
        const indexRegex = /^\[\d+\]/g;
        const indexNumberRegex = /(?<=^\[)\d+(?=\])/g;
        let map: any[] = [];

        // build
        let expectedResults = this
            .getSection(testCase, 'test-expected-results', annotations)
            .lines
            .map((i: string) => i.trim())
            .filter((i: string) => i !== '');
        map.push({ type: "annotation", action: expectedResults[0], index: -1, expected: [] });
        let lastIndex = 1;

        // iterate
        for (let i = 1; i < expectedResults.length; i++) {
            const assertion = expectedResults[i].trim();
            let evaluation = this.getEvaluation(assertion, lastIndex, i);

            if (evaluation == null) {
                continue;
            }
            if (evaluation.type !== 'N/A') {
                map.push(evaluation);
                continue;
            }

            lastIndex = parseInt(assertion.match(indexNumberRegex)[0]);
            let isOutOfBound = totalActions < lastIndex || lastIndex < 1;
            if (isOutOfBound) {
                map.push({ type: "outOfBound", action: assertion, index: -1, expected: [] });
                continue;
            }

            let _index = lastIndex.toString();
            let _result = assertion.replace(indexRegex, '').trim();
            let indent = totalActions.toString().length - _index.length;
            _result = '[' + _index + '] ' + ' '.repeat(indent) + _result;

            map.push({ type: "assertion", action: _result, lastIndex });
        }

        // get
        return {
            section: [...map].sort((a, b) => (a.index < b.index ? -1 : 1)),
            total: map.filter(i => i === 'assertion').length
        };
    }

    private getEvaluation(assertion: any, lastIndex: number, index: number) {
        let conditions = this.getConditions(assertion);

        if (conditions.ignore) {
            return null;
        }
        if (conditions.isCommentedOut) {
            return { type: "commentedOut", action: assertion, index: -1, expected: [] }
        }
        if (conditions.isComment) {
            let commentIndex = lastIndex > 1 ? lastIndex : index;
            return { type: "comment", action: assertion, index: commentIndex, expected: [] }
        }
        if (conditions.isBroken) {
            return { type: "broken", action: assertion, index: -1, expected: [] }
        }

        return { type: "N/A" };
    }

    private getConditions(assertion: any): any {
        // constants
        const assertCommentRegex = /^(\W+)?\/\*{2}(\s+)?(\[\d+\])/g;
        const brokenCommentRegex = /^((\W+)?(\[\d+\]))(\s+)?\/\*{2}/g;
        const commentRegex = /^(\W+)?(\s+)?\/\*{2}/g;
        const ignoreRegex = /^(\/\*{2})(\s+)?(commented|out of bound|broken)/igm;
        const indexRegex = /^\[\d+\]/g;

        // build
        let isCommentedOut = assertion.match(assertCommentRegex) !== null;
        let isComment = !isCommentedOut && assertion.match(commentRegex) !== null;
        let isBroken = !isCommentedOut && !isComment && (assertion.match(indexRegex) === null || assertion.match(brokenCommentRegex) !== null);
        let ignore = assertion.match(ignoreRegex) !== null;

        // get
        return {
            isCommentedOut: isCommentedOut,
            isComment: isComment,
            isBroken: isBroken,
            ignore: ignore
        }
    }

    private buildExpectedSection(expectedMap: any): string[] {
        // setup
        let assertions = expectedMap.section.filter((i: any) => i.type === 'assertion' || i.type === 'comment');
        let broken = expectedMap.section.filter((i: any) => i.type === 'broken');
        let commentedOut = expectedMap.section.filter((i: any) => i.type === 'commentedOut');
        let outOfBound = expectedMap.section.filter((i: any) => i.type === 'outOfBound');

        // build
        let brokenSection = ['\n/** Broken'];
        brokenSection.push(...broken.map((i: any) => i.action));
        brokenSection = brokenSection.length === 1 ? [] : brokenSection;

        let outOfBoundSection = ['\n/** Out of Bound'];
        outOfBoundSection.push(...outOfBound.map((i: any) => i.action));
        outOfBoundSection = outOfBoundSection.length === 1 ? [] : outOfBoundSection;

        let commentedOutSection = ['\n/** Commented'];
        commentedOutSection.push(...commentedOut.map((i: any) => i.action));
        commentedOutSection = commentedOutSection.length === 1 ? [] : commentedOutSection;

        let assertionsSection = ['\n[test-expected-results]'];
        assertionsSection.push(...assertions.sort((i: any) => i.index).map((i: any) => i.action));
        assertionsSection = assertionsSection.length === 1 ? [] : assertionsSection;

        // build
        let section = [];
        section.push(...assertionsSection);
        section.push(...commentedOutSection);
        section.push(...outOfBoundSection);
        section.push(...brokenSection);

        // get
        return section;
    }

    /*┌─[ TEST PARAMETERS & DATA PROVIDER ]────────────────────
      │
      │ Sort, arrange and format the test data provider and
      │ plugin parameters sections.
      └────────────────────────────────────────────────────────*/
    private getDataSection(document: string[], annotations: any[]) {
        // setup
        let dataProvider: string[] = [];
        let parameters: string[] = [];
        let examples: string[] = [];
        let models: string[] = [];

        // build: data provider
        dataProvider.push(...this.formatTable('test-data-provider', document, annotations));
        parameters.push(...this.formatTable('test-parameters', document, annotations));
        examples.push(...this.formatTable('test-examples', document, annotations));
        models.push(...this.formatTable('test-models', document, annotations));

        // get
        return {
            dataProvider: dataProvider.length <= 1 ? [] : dataProvider,
            parameters: parameters.length <= 1 ? [] : parameters,
            examples: examples.length <= 1 ? [] : examples,
            models: models.length <= 1 ? [] : models
        };
    }

    private formatTable(section: string, document: string[], annotations: any[]): string[] {
        // setup
        let _section = this.getSection(document, section, annotations);
        let sectionAnnotation = _section.lines.length > 0 ? _section.lines[0] : '';
        let markdown = _section.lines.slice(1, _section.lines.length).map((i: string) => i.trim()).filter((i: string) => i !== '');

        // bad request
        if (markdown.length === 0) {
            return [];
        }

        // setup
        let information = this.getMarkdownInformation(markdown);
        let maxLength = Math.max(...information.map((i: any) => i.markdown.length));
        let header = [];
        let table = [];

        // build
        for (let i = 0; i < maxLength; i++) {
            let row = '';
            for (const element of information) {
                const _row = element.markdown[i];
                row += _row;
            }
            if (i < 2) {
                header.push(row);
            }
            else {
                table.push(row);
            }
        }

        // sort
        table = table.sort();

        // get
        if (table.length > 0) {
            table.push('');
        }

        // build
        let formattedSection = [sectionAnnotation];
        formattedSection.push(...header);
        formattedSection.push(...table);

        // TODO: distinct by parameters name
        // distinct
        let distinctSection = new Set(formattedSection);

        // get
        return [...distinctSection];
    }

    private getMarkdownInformation(markdown: string[]): any[] {
        // setup
        let columns = this.getComposedTable(markdown);
        let markdownInformation: any[] = [];

        // iterate
        for (let i = 0; i < columns.length; i++) {
            // setup
            let isLast = i === columns.length - 1;
            let column = columns[i];
            let maxLength = Math.max(...column.rows.map((i: string) => i.length));
            maxLength = maxLength < column.column.length ? column.column.length : maxLength;

            // build
            let header = '|' + column.column + ' '.repeat(maxLength - column.column.length);
            let separator = '|' + '-'.repeat(maxLength);

            // normalize
            header = isLast ? header + '|' : header;
            separator = isLast ? separator + '|' : separator;

            // build
            let columnMarkdown: string[] = [header, separator];
            for (const element of column.rows) {
                let row = element;

                row = '|' + row + ' '.repeat(maxLength - row.length);
                row = isLast ? row + '|' : row;

                columnMarkdown.push(row);
            }
            markdownInformation.push({
                length: maxLength,
                markdown: columnMarkdown
            });
        }

        // get
        return markdownInformation;
    }

    private getComposedTable(markdown: string[]): any[] {
        // constants
        const HEADER_INDEX = 0;
        const SEPARATOR_INDEX = 1;

        // setup
        let columns = markdown[HEADER_INDEX].split('|').map(i => i.trim()).filter(i => i !== '');
        let dataPointer = markdown[SEPARATOR_INDEX].match(/^\|(-+\|?)+\|$/g) !== null ? 2 : 1;

        // build
        let table: any[] = [];
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            const rows = [];
            for (let j = dataPointer; j < markdown.length; j++) {
                let composedRow = markdown[j].split('|');
                let composedRowClean = composedRow.slice(1, composedRow.length - 1);
                let row = composedRowClean.map(i => i.trim())[i];
                row = row === undefined ? '' : row;
                rows.push(row);
            }
            table.push({
                column: column,
                rows: rows
            });
        }

        // get
        return table;
    }

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
                lines.push(document[onLine].trim());
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

    private getDocumentRange(document: vscode.TextDocument): vscode.Range {
        // not found
        if (!document) {
            let position = new vscode.Position(0, 0);
            return new vscode.Range(position, position);
        }

        // build
        let firstLine = document.lineAt(0);
        let lastLine = document.lineAt(document.lineCount - 1);

        // get
        return new vscode.Range(firstLine.range.start, lastLine.range.end);
    }
}
