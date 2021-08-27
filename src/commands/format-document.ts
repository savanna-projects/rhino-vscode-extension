/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/icons-in-labels
 * https://stackoverflow.com/questions/45203543/vs-code-extension-api-to-get-the-range-of-the-whole-text-of-a-document
 * https://stackoverflow.com/questions/43311121/sort-an-array-of-objects-in-typescript
 * 
 * CREDITS
 * https://github.com/josa42/vscode-markdown-table-formatter
 * https://github.com/dbrockman/reformat-markdown-table
 */
import * as vscode from 'vscode';
import { Command } from "./command";

export class FormatTestCaseCommand extends Command {
    // members:
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
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Format-Document');
    }

    /*┌─[ REGISTER & INVOKE ]──────────────────────────────────
      │
      │ A command registration pipeline to expose the command
      │ in the command interface (CTRL+SHIFT+P).
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register a command for creating an integrated test case.
     */
    public register(): any {
        // build
        var command = vscode.commands.registerCommand(this.getCommandName(), () => {
            this.invoke(undefined);
        });

        // set
        this.getContext().subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    public invokeCommand(callback: any) {
        this.invoke(callback);
    }

    private invoke(callback: any) {
        // setup
        var documentEntities = this.getOpenDocument();
        var client = this.getRhinoClient();

        // build
        client.getAnnotations((annotations: any) => {
            // setup
            var _annotations: any[] = JSON.parse(annotations);

            // PER TEST (POC on single test)
            // setup
            var documentFormatted = [];

            // iterate
            for (let i = 0; i < documentEntities.length; i++) {
                var documentEntity = documentEntities[i].split('\r\n').map(i => i.trim());
                var metadataFormatted = this.formatMetadata(documentEntity, _annotations);
                var actionsAndExpected = this.getInvocationSection(documentEntity, _annotations);
                var dataSection = this.getDataSection(documentEntity, _annotations);

                // normalize
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

                // skip last
                if (i === documentEntities.length - 1) {
                    continue;
                }

                // seprator
                documentFormatted.push(">>>");
            }

            var t = documentFormatted.join("\n").trim();
            var range = this.getDocumentRange();

            vscode.window.activeTextEditor?.edit((i) => {
                i.replace(range, t);
                vscode.window.activeTextEditor?.document.save();

                if (callback !== undefined) {
                    callback();
                }
            });
        });
    }

    private getOpenDocument(): string[] {
        // setup
        var editor = vscode.window.activeTextEditor;

        // bad request
        if (!editor) {
            return [];
        }

        // get
        return editor.document.getText().split('>>>').map((i) => i.trim());
    }

    /*┌─[ METADATA ]───────────────────────────────────────────
      │
      │ Sort, arrange and format the test metadata sections.
      └────────────────────────────────────────────────────────*/
    private formatMetadata(testCase: string[], annotations: string[]): string[] {
        try {
            // setup
            var formatMap = this.getMetadataFormatMap(annotations);
            var metadataMap = formatMap
                .filter(i => !this.excluded.some(j => j === i.key))
                .sort((a, b) => (a.order < b.order ? -1 : 1));

            // get
            var metadataSection = [];
            for (let i = 0; i < metadataMap.length; i++) {
                const item = metadataMap[i];
                var lines = this.getSection(testCase, item.key, annotations).lines;
                if (lines.length === 0) {
                    continue;
                }
                var literal = metadataMap[i].literal;
                var indentation = ' '.repeat(metadataMap[i].indentation);
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
        var metadataMap = annotations
            .filter(i => !this.excluded.some(j => j === i.key))
            .map(i => i.literal.length);
        var maxLength = Math.max(...metadataMap) + 1;
        var map = [];

        // build
        for (let i = 0; i < annotations.length; i++) {
            var item = {
                key: annotations[i].key,
                literal: annotations[i].literal,
                match: '^\\[' + annotations[i].key + '\\]',
                order: annotations[i].entity.priority,
                indentation: maxLength - annotations[i].literal.length
            };
            map.push(item);
        }

        // get
        return map;
    }

    /*┌─[ TEST CASE & EXPECTED RESULTS ]───────────────────────
      │
      │ Sort, arrange and format the test and exepected results
      │ sections.
      └────────────────────────────────────────────────────────*/
    private getInvocationSection(testCase: string[], annotations: string[]): string[] {
        try {
            // setup
            var actions = this.getActions(testCase, annotations);
            var expected = this.getAssertions(testCase, annotations, actions.total);

            // build
            var actionsSection = actions.section.map((i: any) => i.action);
            var assertionsSection = this.buildExpectedSection(expected);

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
        var map: any[] = [];

        // build
        var actions = this
            .getSection(testCase, 'test-actions', annotations)
            .lines
            .map((i: string) => i.trim());
        var totalActions = actions.filter((i: string) => i !== '' && i.match(commentRegex) === null).length - 1;
        map.push({ type: "annotation", action: actions[0], index: -1 });

        // iterate
        var index = 1;
        for (let i = 1; i < actions.length; i++) {
            const action = actions[i];
            var isComment = action.match(commentRegex) !== null;
            var isEmpty = action === '';

            if (isEmpty) {
                continue;
            }
            if (isComment) {
                map.push({ type: "comment", action: action, index: index });
                continue;
            }

            var _index = index.toString();
            var _action = action.replace(indexRegex, '');
            var indent = totalActions.toString().length - _index.length;
            _action = _index + '. ' + ' '.repeat(indent) + _action;

            map.push({ type: "action", action: _action, index: index++ });
        }

        // get
        return {
            section: map.sort((a, b) => (a.index < b.index ? -1 : 1)),
            total: totalActions
        };
    }

    private getAssertions(testCase: string[], annotations: string[], totalActions: number): any {
        // setup
        const assertCommentRegex = /^(\W+)?\/\*{2}(\s+)?(\[\d+\])/g;
        const brokenCommentRegex = /^((\W+)?(\[\d+\]))(\s+)?\/\*{2}/g;
        const commentRegex = /^(\W+)?(\s+)?\/\*{2}/g;
        const ignoreRegex = /^(\/\*{2})(\s+)?(commented|out of bound|broken)/igm;
        const indexRegex = /^\[\d+\]/g;
        const indexNumberRegex = /(?<=^\[)\d+(?=\])/g;
        var map: any[] = [];

        // build
        var expectedResults = this
            .getSection(testCase, 'test-expected-results', annotations)
            .lines
            .map((i: string) => i.trim())
            .filter((i: string) => i !== '');
        map.push({ type: "annotation", action: expectedResults[0], index: -1, expecpted: [] });
        var lastIndex = 1;

        // iterate
        for (let i = 1; i < expectedResults.length; i++) {
            const assertion = expectedResults[i].trim();
            var isCommentedOut = assertion.match(assertCommentRegex) !== null;
            var isComment = !isCommentedOut && assertion.match(commentRegex) !== null;
            var isBroken = !isCommentedOut && !isComment && (assertion.match(indexRegex) === null || assertion.match(brokenCommentRegex) !== null);
            var ignore = assertion.match(ignoreRegex) !== null;

            if (ignore) {
                continue;
            }
            if (isCommentedOut) {
                map.push({ type: "commentedOut", action: assertion, index: -1, expecpted: [] });
                continue;
            }
            if (isComment) {
                var commentIndex = lastIndex > 1 ? lastIndex : i;
                map.push({ type: "comment", action: assertion, index: commentIndex, expecpted: [] });
                continue;
            }
            if (isBroken) {
                map.push({ type: "broken", action: assertion, index: -1, expecpted: [] });
                continue;
            }

            lastIndex = parseInt(assertion.match(indexNumberRegex)[0]);
            var isOutOfBound = totalActions < lastIndex || lastIndex < 1;
            if (isOutOfBound) {
                map.push({ type: "outOfBound", action: assertion, index: -1, expecpted: [] });
                continue;
            }

            var _index = lastIndex.toString();
            var _result = assertion.replace(indexRegex, '');
            var indent = totalActions.toString().length - _index.length;
            _result = '[' + _index + ']' + ' '.repeat(indent) + _result;

            map.push({ type: "assertion", action: _result, lastIndex });
        }

        // get
        return {
            section: map.sort((a, b) => (a.index < b.index ? -1 : 1)),
            total: map.filter(i => i === 'assertion').length
        };
    }

    private buildExpectedSection(expectedMap: any): string[] {
        // setup
        var assertions = expectedMap.section.filter((i: any) => i.type === 'assertion' || i.type === 'comment');
        var broken = expectedMap.section.filter((i: any) => i.type === 'broken');
        var commentedOut = expectedMap.section.filter((i: any) => i.type === 'commentedOut');
        var outOfBound = expectedMap.section.filter((i: any) => i.type === 'outOfBound');

        // build
        var brokenSection = ['[broken]'];
        brokenSection.push(...broken.map((i: any) => '/** ' + i.action));

        var outOfBoundSection = ['[out-of-bound]'];
        outOfBoundSection.push(...outOfBound.map((i: any) => '/** ' + i.action));

        var commentedOutSection = ['[commented-out]'];
        commentedOutSection.push(...commentedOut.map((i: any) => i.action));

        var assertionsSection = ['[test-expected-results]'];
        assertionsSection.push(...assertions.sort((i: any) => i.index).map((i: any) => i.action));

        // build
        var newLine = ['\n'];
        var section = [];
        section.push(...newLine);
        section.push(...assertionsSection);
        section.push(...newLine);
        section.push(...commentedOutSection);
        section.push(...newLine);
        section.push(...outOfBoundSection);
        section.push(...newLine);
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
        var dataProvider: string[] = [];
        var parameters: string[] = [];
        var examples: string[] = [];
        var models: string[] = [];

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
        var _section = this.getSection(document, section, annotations);
        var sectionAnnotation = _section.lines.length > 0 ? _section.lines[0] : '';
        var markdown = _section.lines.slice(1, _section.lines.length).map((i: string) => i.trim()).filter((i: string) => i !== '');

        // bad request
        if (markdown.length === 0) {
            return [];
        }

        // setup
        var information = this.getMarkdownInformation(markdown);
        var maxLength = Math.max(...information.map((i: any) => i.markdown.length));
        var table = [];

        // build
        for (let i = 0; i < maxLength; i++) {
            var row = '';
            for (let j = 0; j < information.length; j++) {
                const _row = information[j].markdown[i];
                row += _row;
            }
            table.push(row);
        };

        // get
        if (table.length > 0) {
            table.push('');
        }

        // build
        var formattedSection = [sectionAnnotation];
        formattedSection.push(...table);

        // get
        return formattedSection;
    }

    private getMarkdownInformation(markdown: string[]): any[] {
        // setup
        var columns = this.getComposedTable(markdown);
        var markdownInformation: any[] = [];

        // iterate
        for (let i = 0; i < columns.length; i++) {
            // setup
            var isLast = i === columns.length - 1;
            var column = columns[i];
            var maxLength = Math.max(...column.rows.map((i: string) => i.length));
            maxLength = maxLength < column.column.length ? column.column.length : maxLength;

            // build
            var header = '|' + column.column + ' '.repeat(maxLength - column.column.length);
            var seperator = '|' + '-'.repeat(maxLength);

            // normalize
            header = isLast ? header + '|' : header;
            seperator = isLast ? seperator + '|' : seperator;

            // build
            var columnMarkdown: string[] = [header, seperator];
            for (let j = 0; j < column.rows.length; j++) {
                let row = column.rows[j];

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
        const SEPERATOR_INDEX = 1;

        // setup
        var columns = markdown[HEADER_INDEX].split('|').map(i => i.trim()).filter(i => i !== '');
        var dataPointer = markdown[SEPERATOR_INDEX].match(/^\|(-+\|?)+\|$/g) !== null ? 2 : 1;

        // build
        var table: any[] = [];
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
    private getSection(document: string[], annotation: string, annotations: any[])
        : any {
        try {
            // bad request
            if (annotations === undefined || annotations === null || annotations.length === 0) {
                return [];
            }

            // setup
            var map = annotations.map((i) => i.key).filter((i) => i !== annotation);
            var pattern = map.map((i) => '^\\[' + i + ']').join('|');
            var testPattern = '^\\[' + annotation + ']';

            // get line number
            var onLine = 0;
            for (onLine; onLine < document.length; onLine++) {
                if (document[onLine].match(testPattern) !== null) {
                    break;
                }
            }
            var start = new vscode.Position(onLine, 0);

            // iterate
            var lines: string[] = [];
            while (onLine < document.length) {
                if (document[onLine].match(pattern)) {
                    break;
                }
                lines.push(document[onLine]);
                onLine += 1;
            }
            var end = new vscode.Position(onLine - 1, 0);

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

    private getDocumentRange() {
        // setup
        var document = vscode.window.activeTextEditor?.document;

        // not found
        if (!document) {
            var position = new vscode.Position(0, 0);
            return new vscode.Range(position, position);
        }

        // build
        var firstLine = document.lineAt(0);
        var lastLine = document.lineAt(document.lineCount - 1);

        // get
        return new vscode.Range(firstLine.range.start, lastLine.range.end);
    }
}