/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/commands
 * 
 * WORK ITEMS
 * TODO: implement different style for code, external & infra plugins
 */
import { Command } from "./command";
import * as vscode from 'vscode';
import { Utilities } from "../extensions/utilities";
import { RhinoClient } from "../framework/rhino-client";

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
        let command = vscode.commands.registerCommand(this.getCommandName(), () => {
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
        let client = this.getRhinoClient();

        // setup
        let configuration = Utilities.getConfigurationByManifest();

        // build
        client.createConfiguration(configuration, (data: any) => {
            let response = JSON.parse(data);
            let configurationId = Utilities.isNullOrUndefined(response) || Utilities.isNullOrUndefined(response.id)
                ? ''
                : response.id;
            client.getPluginsByConfiguration(configurationId, (plugins: any) => {
                let hasNoPlugins = Utilities.isNullOrUndefined(plugins) || plugins === '';
                if (hasNoPlugins) {
                    client.getPlugins((plugins: any) => {
                        this.getMetadata(client, plugins, '');
                    });
                }
                else {
                    this.getMetadata(client, plugins, configurationId);
                }
            });
        });
    }

    private getMetadata(client: RhinoClient, plugins: any, configurationId: string) {
        client.getOperators((operators: any) => {
            client.getVerbs((verbs: any) => {
                client.getAssertions((assertions: any) => {
                    client.getLocators((locators: any) => {
                        client.getAnnotations((annotations: any) => {
                            const _plugins = JSON.parse(plugins);
                            const _operators = JSON.parse(operators);
                            const _verbs = JSON.parse(verbs);
                            const _assertions = JSON.parse(assertions);
                            const _locators = JSON.parse(locators);
                            const _annotations = JSON.parse(annotations).map((i: any) => i.key.trim());

                            // build
                            let nameClass = _plugins.map((i: any) => i.literal);

                            let keywordControl = [];
                            keywordControl.push(..._operators.map((i: any) => '\\s+' + i.literal + '\\s+'));
                            keywordControl.push(..._verbs.map((i: any) => '\\s+' + i.literal + '\\s+'));

                            let functions = [];
                            functions.push(..._assertions.map((i: any) => '(?<=\\{)' + i.literal + '(?=})'));
                            functions.push(..._locators.map((i: any) => '(?<=\\{)' + i.literal + '(?=})'))

                            // create
                            let tmLanguage = this.getTmConfiguration(nameClass, keywordControl, functions, _annotations);
                            Utilities.updateTmConfiguration(this.getContext(), JSON.stringify(tmLanguage));
                            vscode.window.setStatusBarMessage('$(testing-passed-icon) TM Language loaded');

                            // cleanup
                            if (configurationId !== null && configurationId !== '') {
                                client.deleteConfiguration(configurationId, null);
                            }
                        });
                    });
                });
            });
        });
    }

    private getTmConfiguration(nameClass: string[], keywordControl: string[], functions: string[], annotations: string[]) {
        // build
        let _nameClass = "\\b(" + nameClass.filter(i => i !== '').sort((a, b) => b.length - a.length).join('|') + ")\\b";
        let _keywordControl = "(" + [...keywordControl].sort((a, b) => b.length - a.length).join('|') + ")";
        let _functions = "(" + [...functions].sort((a, b) => b.length - a.length).join('|') + ")";

        // TODO: find style for metadata
        let _annotations = '(?<=\\[(' + annotations.join('|') + ')]\\s+)[^\\s].*$';

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
                        }
                    ]
                }
            },
            "scopeName": "source.rhino"
        };
    }
}
