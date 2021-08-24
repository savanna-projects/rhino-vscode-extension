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
            var map = this.getActions(testCase, annotations);
            var m = this.getE(testCase, annotations, 0);

            // normalize
            for (let i = 1; i < map.map.length - 1; i++) {
                var item = map.map[i];
                if (item.type !== 'action') {
                    continue;
                }
                item.expected = item.expected.filter((i: any) => i.index === item.index);
            }

            // build
            var actionsSection = this.buildActionsSection(map);
            var expectedSection = this.buildExpectedSection(map);

            // get
            return [actionsSection, expectedSection];
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
        map.push({ type: "annotation", action: actions[0], index: -1, expecpted: [] });

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
                map.push({ type: "comment", action: action, index: -1, expecpted: [] });
                continue;
            }

            var _index = index.toString();
            var _action = action.replace(indexRegex, '');
            var indent = totalActions.toString().length - _index.length;
            _action = _index + '. ' + ' '.repeat(indent) + _action;

            map.push({ type: "action", action: _action, index: index++, expecpted: [] });
        }

        // get
        return {
            section: map,
            total: totalActions
        };
    }

    private getE(testCase: string[], annotations: string[], lastAction: number): any {
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

        // iterate
        for (let i = 1; i < expectedResults.length; i++) {
            const result = expectedResults[i];
            var isAssertComment = result.match(assertCommentRegex) !== null;
            var isComment = !isAssertComment && result.match(commentRegex) !== null;
            var isBroken = !isAssertComment && !isComment && (result.match(indexRegex) === null || result.match(brokenCommentRegex) !== null);
            var ignore = result.math(ignoreRegex) !== null;

            if (ignore) {
                continue;
            }
            if (isAssertComment) {
                map.push({ type: "assertComment", action: result, index: -1, expecpted: [] });
                continue;
            }
            if (isComment) {
                map.push({ type: "comment", action: result, index: -1, expecpted: [] });
                continue;
            }
            if (isBroken) {
                map.push({ type: "broken", action: result, index: -1, expecpted: [] });
                continue;
            }

            var index = parseInt(result.match(indexNumberRegex)[0]);
            var isOutOfBound = lastAction < index;
            if (isOutOfBound) {
                map.push({ type: "outOfBound", action: result, index: -1, expecpted: [] });
                continue;
            }
            map.push({ type: "assertion", action: result, index });
        }
    }
























    // private getActionsMap(testCase: string[], annotations: string[]): any {
    //     // setup
    //     var map: any[] = [];
    //     var index = 1;
    //     var commentRegex = /^((\W+)?\d+\.?)?(\s+)?\/\*{2}/g;
    //     var actionRegex = /^(\s+)?\/\*{2}$/g;

    //     var actions = this
    //         .getSection(testCase, 'test-actions', annotations)
    //         .lines
    //         .map((i: string) => i.trim());

    //     var expecteds = this
    //         .getSection(testCase, 'test-expected-results', annotations)
    //         .lines
    //         .map((i: string) => i.trim());
    //     var totalActions = actions.filter((i: string) => i !== '' && i.match(commentRegex) === null).length - 1;
    //     var invalids = this.getExpected(-1, expecteds, totalActions, false);

    //     // build
    //     map.push({ type: 'annotation', action: actions[0], index: -1 });
    //     for (let i = 1; i < actions.length; i++) {
    //         const action = actions[i];
    //         var isEmpty = action === '' || action.match(actionRegex) !== null;
    //         var isComment = !isEmpty && action.match(commentRegex) !== null;

    //         if (isEmpty) {
    //             continue;
    //         }
    //         if (isComment) {
    //             map.push({ type: 'comment', action: action, index: -1 });
    //             continue;
    //         }

    //         var expected: any[] = this.getExpected(index, expecteds, totalActions, true);
    //         map.push({ type: 'action', action: action, index: index++, expected: expected });
    //     }

    //     // get
    //     return {
    //         map: map,
    //         invalids: invalids
    //     };
    // }

    private getExpected(index: number, section: string[], totalAction: number, validOnly: boolean = false): any[] {
        // setup
        var map = [];

        // build
        for (let i = 1; i < section.length; i++) {
            const expected = section[i];
            var isEmpty = expected === '' || expected.match(/^(\s+)?\/\*{2}$/g) !== null;
            var isComment = !isEmpty && expected.match(/^(^(\s+)?\/\*{2})(\s+)?\[\d+]/g) !== null;
            var isValid = !isComment || (!isEmpty && expected.match(/((\[\d+\])(?!(\s+\/\*{2})))/g) !== null);
            var isMatch = isValid && expected.match("(?<=^\\[)" + index.toString() + "(?=\\])") !== null;

            if (isEmpty && !validOnly) {
                continue;
            }
            if (isComment) {
                map.push({ type: 'comment', action: expected, index: -1 });
                continue;
            }
            if (!isValid && !validOnly) {
                map.push({ type: 'invalid', action: expected, index: -1 });
                continue;
            }
            if (!isMatch && validOnly) {
                var match = expected.match(/(?<=\[)\d+(?=\])/g);
                var _index = match === null ? -1 : parseInt(match[0]);
                if (_index < totalAction && _index === index) {
                    map.push({ type: 'expected', action: expected, index: _index });
                }
                continue;
            }

            if (validOnly) {
                map.push({ type: 'expected', action: expected, index: index });
            }
        }

        // get
        return map.sort((a, b) => (a.index < b.index ? -1 : 1));
    }

    private buildActionsSection(data: any): string {
        // setup
        var section = [];
        var maxLength = (data.map.filter((i: any) => i.type === 'action').length).toString().length + 1;

        // build
        for (let i = 0; i < data.map.length; i++) {
            var line = data.map[i].action.replace(/^((\s+)?(\d+(\.+)?))+\s+/g, '');
            if (data.map[i].index !== -1) {
                var indent = maxLength - data.map[i].index.toString().length;
                line = data.map[i].index.toString() + '.' + ' '.repeat(indent) + line;
            }
            section.push(line);
        }
        section.push('');

        // get
        return section.join("\n");
    }

    private buildExpectedSection(data: any): string {
        // setup
        var section: string[] = [];
        var invalids: string[] = [''];
        var comments: string[] = [''];
        var hasComments = data.invalids.filter((i: any) => i.type === 'comment').length > 0;
        var hasInvalids = data.invalids.filter((i: any) => i.type === 'invalid').length > 0;;

        // build: invalid
        for (let i = 0; i < data.invalids.length; i++) {
            const expected = data.invalids[i];
            if (expected.type === 'comment') {
                comments.push(expected.action);
            }
            if (expected.type === 'invalid') {
                invalids.push('/**' + expected.action);
            }
        }

        // build: valid
        for (let i = 1; i < data.map.length; i++) {
            const expected = data.map[i].expected;
            if (expected === null || expected === undefined) {
                continue;
            }

            for (let j = 0; j < expected.length; j++) {
                const line = expected[j];
                if (line.type !== 'expected') {
                    continue;
                }
                section.push(line.action);
            }
        }

        // not found
        if (section.length === 0) {
            return '';
        }

        // build indent
        section = this.buildIndent(section);
        var indentedSetion = [
            '[test-expected-results]'
        ];
        indentedSetion.push(...section);

        // get
        if (hasComments) {
            indentedSetion.push(...comments);
        }
        if (hasInvalids) {
            indentedSetion.push(...invalids);
        }
        return indentedSetion.join("\n");
    }

    private buildIndent(section: string[]): string[] {
        // setup
        function onFilter(i: string): any {
            var match = i.match(/\[\d+\]/);
            if (match === null) {
                return {
                    index: '-1',
                    action: '-1'
                };
            }
            return {
                index: match[0].trim(),
                action: i.replace(match[0], '').trim()
            };
        }
        var onData = section.map(onFilter).filter((i: any) => i.index !== '-1');
        var maxLength = Math.max(...onData.map(i => i.index.length)) + 1;

        // build
        var onSection: string[] = [];
        for (let i = 0; i < onData.length; i++) {
            const item = onData[i];
            var indent = maxLength - item.index.length;
            onSection.push(item.index + ' '.repeat(indent) + item.action);
        }

        // get
        return onSection;
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