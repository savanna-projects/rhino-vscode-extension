/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/commands
 * 
 * WORK ITEMS
 * TODO: implement different style for code, external & infra plugins
 */
import * as vscode from 'vscode';
import { CommandBase } from "./command-base";
import { Utilities } from "../extensions/utilities";
import { TmLanguageCreateModel } from '../models/tm-create-model';
import { Logger } from '../logging/logger';

export class CreateTmLanguageCommand extends CommandBase {
    // members
    private readonly _logger: Logger;
    private readonly _createModel: TmLanguageCreateModel;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext, createModel: TmLanguageCreateModel) {
        super(context);

        // build
        this._logger = super.logger?.newLogger('CreateTmLanguageCommand');
        this._createModel = createModel;
        this.command = 'Create-TmLanguage';
    }

    /*┌─[ REGISTER ]───────────────────────────────────────────
      │
      │ A command registration pipeline to expose the command
      │ in the command interface (CTRL+SHIFT+P).
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register a command for invoking one or more Rhino Test Case
     *          and present the report.
     */
    protected async onRegister(): Promise<any> {
        // setup
        let command = vscode.commands.registerCommand(this.command, async () => {
            await this.invokeCommand();
        });

        // set
        this.context.subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    protected async onInvokeCommand(): Promise<any> {
        // setup
        const context = this.context;
        const createModel = this._createModel;

        try {
            // user interface
            vscode.window.setStatusBarMessage('$(sync~spin) Creating TM Language...');

            // set language
            CreateTmLanguageCommand.setTmLanguage(context, createModel);

            // user interface
            vscode.window.setStatusBarMessage('$(testing-passed-icon) TM Language Created');
        } catch (error: any) {
            // internal server error
            this._logger?.error(error.message, error);
            vscode.window.setStatusBarMessage(`$(testing-error-icon) ${error.message}...`);
        }
    }

    private static setTmLanguage(context: vscode.ExtensionContext, createModel: TmLanguageCreateModel) {
        // setup
        const plugins = createModel.plugins;
        const operators = createModel.operators;
        const verbs = createModel.verbs;
        const assertions = createModel.assertions;
        const locators = createModel.locators;
        const annotations = createModel.annotations.map((i: any) => i.key.trim());
        const nameClass = plugins.map((i: any) => i.literal);

        // build
        const keywordControl = [];
        keywordControl.push(...operators.map((i: any) => '\\s+' + i.literal + '\\s+'));
        keywordControl.push(...verbs.map((i: any) => '\\s+' + i.literal + '\\s+'));

        const functions = [];
        functions.push(...assertions.map((i: any) => '(?<=\\{)' + i.literal + '(?=})'));
        functions.push(...locators.map((i: any) => '(?<=\\{)' + i.literal + '(?=})'));

        // create
        const tmLanguage = this.getTmConfiguration(nameClass, keywordControl, functions, annotations);
        Utilities.updateTmConfiguration(context, JSON.stringify(tmLanguage));
    }

    private static getTmConfiguration(nameClass: string[], keywordControl: string[], functions: string[], annotations: string[]) {
        // build
        const _nameClass = "\\b(" + nameClass.filter(i => i !== '').sort((a, b) => b.length - a.length).join('|') + ")\\b";
        const _keywordControl = "(" + [...keywordControl].sort((a, b) => b.length - a.length).join('|') + ")";
        const _functions = "(" + [...functions].sort((a, b) => b.length - a.length).join('|') + ")";

        // TODO: find style for metadata
        const _annotations = '(?<=\\[(' + annotations.join('|') + ')]\\s+)[^\\s].*$';

        // get
        return {
            "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
            "name": "Rhino",
            "patterns": [
                {
                    "include": "#keywords"
                }
            ],
            "repository": {
                "keywords": {
                    "patterns": [
                        {
                            "name": "entity.name.class",
                            "match": _nameClass
                        },
                        {
                            "name": "keyword.control",
                            "match": _keywordControl
                        },
                        {
                            "name": "entity.name.function",
                            "match": _functions
                        },
                        {
                            "name": "string.quoted.double",
                            "match": "(\\{)"
                        },
                        {
                            "name": "string.quoted.double",
                            "match": "(\\})"
                        },
                        {
                            "name": "string.quoted.double",
                            "match": "\\s`$"
                        },
                        {
                            "name": "markup.heading",
                            "match": "(?<=^\\[).*?(?=])|\\{|}"
                        },
                        {
                            "name": "entity.name.class",
                            "match": "(?<=\\{{)\\$"
                        },
                        {
                            "name": "entity.name.class",
                            "match": "(?<=\\{\\{\\$)\\w+(?=\\s+|})"
                        },
                        {
                            "name": "variable.parameter",
                            "match": "(--\\w+:)"
                        },
                        {
                            "name": "support.constant",
                            "match": "(?<=--\\w+:(\\s+)?).*?(?=(\\s+--)|})"
                        },
                        {
                            "name": "entity.name.function",
                            "match": "^\\d+(\.)?"
                        },
                        {
                            "name": "comment.line",
                            "match": "(\\s+)?/\\*\\*.*"
                        },
                        {
                            "name": "markup.heading",
                            "match": "(?<=\\|\\s+)(Example|Description|Parameter|Default|Name|Value|Type|Comment)\\s+(?=\\|)"
                        },
                        {
                            "name": "entity.name.class",
                            "match": "\\|?(-+)\\|"
                        },
                        {
                            "name": "entity.name.class",
                            "match": "\\|"
                        }
                    ]
                }
            },
            "scopeName": "source.rhino"
        };
    }
}
