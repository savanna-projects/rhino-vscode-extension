/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';

import { ActionsAutoCompleteProvider } from '../framework/actions-auto-complete-provider';
import { MacrosAutoCompleteProvider } from '../framework/macros-auto-complete-provider';
import { Command } from "./command-base";
import { RegisterPlugins } from './register-plugins';

export class ConnectRhinoServer extends Command {  
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
         super(context);

         // build
         this.setCommandName('Connect-RhinoServer');
    }

    /*┌─[ REGISTER & INVOKE ]──────────────────────────────────
      │
      │ A command registration pipeline to expose the command
      │ in the command interface (CTRL+SHIFT+P).
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Register a command for connecting the Rhino Server and loading all
     *          Rhino Language metadata.
     */
    public register(): any {
        // build
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
        vscode.window.showInformationMessage('Connect-RhinoServer -> Processing...');

        // setup
        var client = this.getRhinoClient();

        // build
        client.getPlugins((plugins: any) => {
            client.getMacros((macros: any) => {
                client.getLocators((locators: any) => {
                    client.getAnnotations((annotations: any) => {
                        client.getAttributes((attributes: any) => {
                            client.getAssertions((assertions: any) => {
                                client.getOperators((operators: any) => {
                                    new RegisterPlugins(this.getContext()).invokeCommand();
                                    
                                    var _plugins = JSON.parse(plugins);
                                    var _macros = JSON.parse(macros);                               
                                    var pattern = ConnectRhinoServer.getPluginsPattern(_plugins);
                                    var macrosProvider = new MacrosAutoCompleteProvider().setManifests(_macros);
                                    var actionsProvider = new ActionsAutoCompleteProvider()
                                        .setManifests(_plugins)
                                        .setLocators(JSON.parse(locators))
                                        .setAnnotations(JSON.parse(annotations))
                                        .setPattern(pattern)
                                        .setAttributes(JSON.parse(attributes))
                                        .setAssertions(JSON.parse(assertions))
                                        .setOperators(JSON.parse(operators));

                                    var items = [
                                        this.getActions(actionsProvider),
                                        this.getActionsParamters(actionsProvider),
                                        this.getAnnotations(actionsProvider),
                                        this.getMacros(macrosProvider),
                                        this.getMacroParameters(macrosProvider),
                                        this.getAssertions(actionsProvider),
                                        this.getAssertionMethods(actionsProvider),
                                        this.getDataProvider(actionsProvider)
                                    ];
                                    this.getContext().subscriptions.push(...items);
                                    
                                    var message = 'Connect-RhinoServer -> (Status: Ok, NumberOfPlugins: ' + _plugins.length + ')';
                                    vscode.window.showInformationMessage(message);
                                    
                                    message = 'Connect-RhinoServer -> (Status: Ok, NumberOfMacros: ' + _macros.length + ')';
                                    vscode.window.showInformationMessage(message);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    /*┌─[ AUTO-COMPLETE ITEMS ]────────────────────────────────
      │
      │ All auto-complete items - data and behavior.
      └────────────────────────────────────────────────────────*/
    // register actions auto-complete
    private getActions(provider: ActionsAutoCompleteProvider): vscode.Disposable {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getActionsCompletionItems(document, position);
            }
        });
    }

    // register parameters auto-complete
    private getActionsParamters(provider: ActionsAutoCompleteProvider) {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getParametersCompletionItems(document, position);
            }
        }, '-');
    }

    // register annotations auto-complete
    private getAnnotations(provider: ActionsAutoCompleteProvider) {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getAnnotationsCompletionItems(document, position);
            }
        }, '[');
    }

    // register assertions auto-complete
    private getAssertions(provider: ActionsAutoCompleteProvider) {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getAssertionsCompletionItems(document, position);
            }
        });
    }

    private getAssertionMethods(provider: ActionsAutoCompleteProvider) {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getAssertionMethodsCompletionItems(document, position);
            }
        }, '{');
    }

    // register macros auto-complete
    private getMacros(provider: MacrosAutoCompleteProvider): vscode.Disposable {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getMacrosCompletionItems(document, position);
            }
        }, '$');
    }

    // register macros parameter auto-complete
    private getMacroParameters(provider: MacrosAutoCompleteProvider): vscode.Disposable {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getMacrosParameters(document, position);
            }
        }, '-');
    }

    // register data provider auto-complete
    private getDataProvider(provider: ActionsAutoCompleteProvider) {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getDataCompletionItems(document, position);
            }
        });
    }

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A list of helper methods, relevant for the command.
      └────────────────────────────────────────────────────────*/
    // gets a pattern to identify all available plugins in a single text line.
    private static getPluginsPattern(plugins: any): string {
        // setup
        var patterns: string[] = [];
        
        // build
        for (var i = 0; i < plugins.length; i++) {
            patterns.push("(?<!['])" + plugins[i].literal);
            
            if(!plugins[i].hasOwnProperty('aliases')) {
                continue;
            }
            
            for (var j = 0; j < plugins[i].aliases.length; j++) {
                patterns.push(plugins[i].aliases[j]);
            }
        }
        
        // get
        return patterns.join('|');
    }

    // remove all auto-comlete items
    private clearSubscriptions() {
        try {
            this.getContext().subscriptions.splice(0, this.getContext().subscriptions.length);
        } catch (error) {
            var a = error;
        }
    }
}