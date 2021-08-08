/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/commands
 */
import { Command } from "./command";
import * as vscode from 'vscode';
import { Utilities } from "../extensions/utilities";

export class CreateTm extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Create-TmLanguage');
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
    public register(): any {
        // setup
        var command = vscode.commands.registerCommand(this.getCommandName(), () => {
            this.invoke();
        });

        // set
        this.getContext().subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    public invokeCommand() {
        this.invoke();
    }

    private invoke() {
        // notification
        vscode.window.setStatusBarMessage('$(sync~spin) Creating TM Language...');

        // setup
        var client = this.getRhinoClient();

        // build
        client.getPlugins((plugins: any) => {
            client.getOperators((operators: any) => {
                client.getVerbs((verbs: any) => {
                    const _plugins = JSON.parse(plugins);
                    const _operators = JSON.parse(operators);
                    const _verbs = JSON.parse(verbs);

                    // build
                    var nameClass = _plugins.map((i: any) => i.literal);
                    var keywordControl = [];
                    keywordControl.push(..._operators.map((i: any) => i.literal));
                    keywordControl.push(..._verbs.map((i: any) => i.literal));

                    // create
                    var tmLanguage = this.getTmConfiguration(nameClass, keywordControl);
                    Utilities.updateTmConfiguration(this.getContext(), JSON.stringify(tmLanguage));

                    vscode.window.setStatusBarMessage('$(testing-passed-icon) TM Language loaded');
                });
            });
        });
    }

    private getTmConfiguration(nameClass: string[], keywordControl: string[]) {
        // build
        var _nameClass = "\\b(" + nameClass.filter(i => i !== '').sort((a, b) => b.length - a.length).join('|') + ")\\b";
        var _keywordControl = "\\b(" + keywordControl.sort((a, b) => b.length - a.length).join('|') + ")\\b";

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
                            "name": "string.quoted.double",
                            "match": "(?<=\\{)[^\\$,\\{].*?(?=})"
                        },
                        {
                            "name": "entity.name.function",
                            "match": "(?<=\\{{)\\$.*?(?=}})"
                        },
                        {
                            "name": "markup.heading",
                            "match": "(?<=^\\[).*?(?=])|\\{|}"
                        },
                        {
                            "name": "comment.line",
                            "match": "(\\s+)?/\\*\\*.*"
                        },
                        {
                            "name": "entity.name.class",
                            "match": "(\\|)"
                        },
                        {
                            "name": "entity.name.class",
                            "match": "(-{3,})"
                        }
                    ]
                }
            },
            "scopeName": "source.rhino"
        };
    }
}