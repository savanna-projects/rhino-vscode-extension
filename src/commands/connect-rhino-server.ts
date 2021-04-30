/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';

import { ActionsAutoCompleteProvider } from '../framework/actions-auto-complete-provider';
import { MacrosAutoCompleteProvider } from '../framework/macros-auto-complete-provider';
import { Command } from "./command-base";

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
        client.getPlugins((plugins: any[]) => {
            client.getMacros((macros: any[]) => {
                client.getLocators((locators: any[]) => {
                    client.getAnnotations((annotations: any[]) => {
                        client.getAttributes((attributes: any) => {
                            client.getAnnotations((assertions: any) => {
                                client.getOperators((operators: any) => {                                                     
                                    var pattern = ConnectRhinoServer.getPluginsPattern(plugins);
                                    var macrosProvider = new MacrosAutoCompleteProvider().setManifests(macros);
                                    var actionsProvider = new ActionsAutoCompleteProvider()
                                        .setManifests(plugins)
                                        .setLocators(locators)
                                        .setAnnotations(annotations)
                                        .setPattern(pattern)
                                        .setAttributes(attributes)
                                        .setAssertions(assertions)
                                        .setOperators(operators);

                                    var items = [
                                        this.getActions(actionsProvider),
                                        this.getActionsParamters(actionsProvider),
                                        this.getAnnotations(actionsProvider, annotations),
                                        this.getMacros(macrosProvider),
                                        this.getMacroParameters(macrosProvider)
                                    ];
                                    this.getContext().subscriptions.push(...items);
                                    
                                    var message = 'Connect-RhinoServer -> (Status: Ok, NumberOfPlugins: ' + plugins.length + ')';
                                    vscode.window.showInformationMessage(message);
                                    
                                    message = 'Connect-RhinoServer -> (Status: Ok, NumberOfMacros: ' + macros.length + ')';
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
    private getAnnotations(provider: ActionsAutoCompleteProvider, properties: any[]) {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getAnnotationsCompletionItems(properties, document, position);
            }
        }, '[');
    }

    // register macros auto-complete
    private getMacros(provider: MacrosAutoCompleteProvider): vscode.Disposable {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getMacrosCompletionItems(document, position);
            }
        }, '$');
    }

    //register macros parameter auto-complete
    private getMacroParameters(provider: MacrosAutoCompleteProvider): vscode.Disposable {
        return vscode.languages.registerCompletionItemProvider(this.getOptions(), {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getMacrosParameters(document, position);
            }
        }, '-');
    }

    /*┌─[ UTILITIES ]──────────────────────────────────────────
      │
      │ A list of helper methods, relevant for the command.
      └────────────────────────────────────────────────────────*/
    // gets a pattern to identify all available plugins in a single text line.
    private static getPluginsPattern(plugins: any[]): string {
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
}