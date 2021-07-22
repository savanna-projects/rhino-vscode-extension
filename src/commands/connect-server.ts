/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { RhinoClient } from '../framework/rhino-client';

import { ActionsAutoCompleteProvider } from '../providers/actions-auto-complete-provider';
import { AnnotationsAutoCompleteProvider } from '../providers/annotations-autom-complete-provider';
import { AssertionsAutoCompleteProvider } from '../providers/assertions-auto-complete-provider';
import { DataAutoCompleteProvider } from '../providers/data-auto-complete-provider';
import { MacrosAutoCompleteProvider } from '../providers/macros-auto-complete-provider';
import { ModelsAutoCompleteProvier } from '../providers/models-auto-complete-provider';
import { ParametersAutoCompleteProvier } from '../providers/parameters-auto-complete-provider';
import { Command } from "./command";
import { CreateTm } from './create-tm';

export class ConnectServerCommand extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Connect-Server');
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

    // invokation routine
    private invoke() {
        // setup
        var client = this.getRhinoClient();
        var context = this.getContext();

        // build
        try {
            this.registerActions(client, context, (client: any, context: any) => {
                this.registerAnnotations(client, context, (client: any, context: any) => {
                    this.registerAssetions(client, context, (client: any, context: any) => {
                        this.registerMacros(client, context, (client: any, context: any) => {
                            this.registerDataDrivenSnippet(client, context, (client: any, context: any) => {
                                this.registerModels(client, context, () => {
                                    new CreateTm(context).invokeCommand();
                                });
                            });
                        });
                    });
                });
            });
        } catch (error) {
            console.error(error);
            vscode.window.setStatusBarMessage("$(testing-error-icon) Errors occurred connecting to Rhino Server");
        }

    }

    private registerActions(client: RhinoClient, context: vscode.ExtensionContext, callback: any) {
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Loading action(s)...');

        // build
        client.getPlugins((plugins: any) => {
            client.getLocators((locators: any) => {
                client.getAttributes((attributes: any) => {
                    client.getAnnotations((annotations: any) => {
                        var actionsManifests = JSON.parse(plugins);
                        var _locators = JSON.parse(locators);
                        var _attribtues = JSON.parse(attributes);
                        var _annotations = JSON.parse(annotations);
                        var pluginsPattern = Utilities.getPluginsPattern(actionsManifests);

                        new ActionsAutoCompleteProvider()
                            .setPattern(pluginsPattern)
                            .setAttributes(_attribtues)
                            .setManifests(actionsManifests)
                            .setLocators(_locators)
                            .setAnnotations(_annotations)
                            .register(context);

                        console.info('Get-Plugins -Type Actions = (OK, ' + actionsManifests.length + ')');
                        let message = '$(testing-passed-icon) Total of ' + actionsManifests.length + ' action(s) loaded';
                        vscode.window.setStatusBarMessage(message);

                        if (callback === null) {
                            return;
                        }
                        callback(client, context);
                    });
                });
            });
        });
    }

    private registerAnnotations(client: RhinoClient, context: vscode.ExtensionContext, callback: any) {
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Loading annotations(s)...');

        // build
        client.getAnnotations((annotations: any) => {
            let manifests = JSON.parse(annotations);
            new AnnotationsAutoCompleteProvider().setManifests(manifests).register(context);

            console.info('Get-Plugins -Type Annotations = (OK, ' + manifests.length + ')');
            let message = '$(testing-passed-icon) Total of ' + manifests.length + ' annotation(s) loaded';
            vscode.window.setStatusBarMessage(message);

            // dependent providers
            new ParametersAutoCompleteProvier().setManifests(manifests).register(context);

            if (callback === null) {
                return;
            }
            callback(client, context);
        });
    }

    private registerAssetions(client: RhinoClient, context: vscode.ExtensionContext, callback: any) {
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Loading assertion method(s)...');

        // build
        client.getAnnotations((annotations: any) => {
            client.getAssertions((assertions: any) => {
                client.getLocators((locators: any) => {
                    client.getOperators((operators: any) => {
                        let manifests = JSON.parse(assertions);
                        let _annotations = JSON.parse(annotations);
                        let _locators = JSON.parse(locators);
                        let _operators = JSON.parse(operators);
                        new AssertionsAutoCompleteProvider()
                            .setManifests(manifests)
                            .setAnnotations(_annotations)
                            .setLocators(_locators)
                            .setOperators(_operators)
                            .register(context);

                        console.info('Get-Plugins -Type AssertionMethod = (OK, ' + manifests.length + ')');
                        let message = '$(testing-passed-icon) Total of ' + manifests.length + ' assertion method(s) loaded';
                        vscode.window.setStatusBarMessage(message);

                        if (callback === null) {
                            return;
                        }
                        callback(client, context);
                    });
                });
            });
        });
    }

    private registerMacros(client: RhinoClient, context: vscode.ExtensionContext, callback: any) {
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Loading macros(s)...');

        // build
        client.getMacros((macros: any) => {
            let manifests = JSON.parse(macros);
            new MacrosAutoCompleteProvider().setManifests(manifests).register(context);

            console.info('Get-Plugins -Type Macro = (OK, ' + manifests.length + ')');
            let message = '$(testing-passed-icon) Total of ' + manifests.length + ' macros(s) loaded';
            vscode.window.setStatusBarMessage(message);

            if (callback === null) {
                return;
            }
            callback(client, context);
        });
    }

    private registerDataDrivenSnippet(client: RhinoClient, context: vscode.ExtensionContext, callback: any) {
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Loading data-driven snippet(s)...');

        // build
        client.getAnnotations((annotations: any) => {
            let _annotations = JSON.parse(annotations);
            new DataAutoCompleteProvider().setAnnotations(_annotations).register(context);
            vscode.window.setStatusBarMessage('$(testing-passed-icon) Data-Driven snippet(s) loaded');

            if (callback === null) {
                return;
            }
            callback(client, context);
        });
    }

    private registerModels(client: RhinoClient, context: vscode.ExtensionContext, callback: any) {
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Loading page model(s)...');

        // build
        client.getModels((models: any) => {
            let _models = JSON.parse(models);
            new ModelsAutoCompleteProvier().setManifests(_models).register(context);
            vscode.window.setStatusBarMessage('$(testing-passed-icon) Page models loaded');

            if (callback === null) {
                return;
            }
            callback(client, context);
        });
    }
}