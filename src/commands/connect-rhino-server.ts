/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';

import { Utilities } from "../extensions/utilities";
import { ActionsAutoCompleteProvider } from '../framework/actions-auto-complete-provider';
import { MacrosAutoCompleteProvider } from '../framework/macros-auto-complete-provider';
import { RhinoClient } from "../framework/rhino-client";
import { Command } from "./command-base";

export class ConnectRhinoServer extends Command {
    // members
    private projectManifest: any;
    private client: RhinoClient;
    private options: any;
    
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
     constructor(context: vscode.ExtensionContext) {
         super(context);

         // build
         this.projectManifest = Utilities.getProjectManifest();
         var server = this.projectManifest.rhinoServer;
         var rhinoEndpont = this.setEndpoint(server.schema + '://' + server.host + ':' + server.port).getEndpoint();
         this.client = new RhinoClient(rhinoEndpont);
         this.setCommandName('Connect-RhinoServer');
         this.options = {
             scheme: 'file',
             language: 'rhino'
        };
    }

    /**
     * Summary. Sets the Rhino Project manifest to use with the command.
     * 
     * @param projectManifest The Rhino Project manifest (found in the project root).
     * @returns Self reference.
     */
    public setProjectManifest(projectManifest: any): ConnectRhinoServer {
        // setup
        this.projectManifest = projectManifest;

        // get
        return this;
    }

    /**
     * Summary. Register a command for connecting the Rhino Server and loading all
     *          Rhino Language metadata.
     */
    public register(): any {      
        // notification
        vscode.window.showInformationMessage('Connect-RhinoServer -> Processing...');

        // build
        this.client.getPlugins((plugins: any[]) => {
            this.client.getMacros((macros: any[]) => {
                this.client.getLocators((locators: any[]) => {
                     this.client.getProperties((attributes: any[]) => {
                        var pattern = ConnectRhinoServer.getPluginsPattern(plugins);
                        var macrosProvider = new MacrosAutoCompleteProvider().setManifests(macros);
                        var actionsProvider = new ActionsAutoCompleteProvider()
                            .setManifests(plugins)
                            .setLocators(locators)
                            .setAttributes(attributes)
                            .setPattern(pattern);

                        var items = [
                            this.getActions(actionsProvider),
                            this.getActionsParamters(actionsProvider),
                            this.getAnnotations(actionsProvider, attributes),
                            this.getMacros(macrosProvider),
                            this.getMacroParameters(macrosProvider)
                        ];
                        this.getContext().subscriptions.push(...items);
                        
						var message = 'Connect-RhinoServer -> (Status: Ok, NumberOfPlugins: ' + plugins.length + ')';
						vscode.window.showInformationMessage(message);
                    });
                });
            });
        });
    }

    // register actions auto-complete
    private getActions(provider: ActionsAutoCompleteProvider): vscode.Disposable {
        return vscode.languages.registerCompletionItemProvider(this.options, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getActionsCompletionItems(document, position);
            }
        });
    }

    // register parameters auto-complete
    private getActionsParamters(provider: ActionsAutoCompleteProvider) {
        return vscode.languages.registerCompletionItemProvider(this.options, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getParametersCompletionItems(document, position);
            }
        }, '-');
    }

    // register parameters auto-complete
    private getAnnotations(provider: ActionsAutoCompleteProvider, attributes: any[]) {
        return vscode.languages.registerCompletionItemProvider(this.options, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getAnnotationsCompletionItems(attributes, document, position);
            }
        }, '[');
    }

    // register macros auto-complete
    private getMacros(provider: MacrosAutoCompleteProvider): vscode.Disposable {
        return vscode.languages.registerCompletionItemProvider(this.options, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getMacrosCompletionItems(document, position);
            }
        }, '$');
    }

    //register macros parameter auto-complete
    private getMacroParameters(provider: MacrosAutoCompleteProvider): vscode.Disposable {
        return vscode.languages.registerCompletionItemProvider(this.options, {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return provider.getMacrosParameters(document, position);
            }
        }, '-');
    }

    // Utilities
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