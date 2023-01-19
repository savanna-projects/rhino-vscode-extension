/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * WORK ITEMS
 * TODO: use promises and parallel calls to reduce client creation time
 */
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { RhinoClient } from '../framework/rhino-client';

import { ActionsAutoCompleteProvider } from '../providers/actions-auto-complete-provider';
import { AnnotationsAutoCompleteProvider } from '../providers/annotations-auto-complete-provider';
import { AssertionsAutoCompleteProvider } from '../providers/assertions-auto-complete-provider';
import { DataAutoCompleteProvider } from '../providers/data-auto-complete-provider';
import { MacrosAutoCompleteProvider } from '../providers/macros-auto-complete-provider';
import { ModelsAutoCompleteProvider } from '../providers/models-auto-complete-provider';
import { ParametersAutoCompleteProvider } from '../providers/parameters-auto-complete-provider';
import { Command } from "./command";
import { CreateTm } from './create-tm';
import { RegisterRhinoCommand } from './register-rhino';

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

    // invocation routine
    private invoke() {
        // setup
        let client = this.getRhinoClient();
        let context = this.getContext();

        // clean
        new RegisterRhinoCommand(context).invokeCommand();

        // TODO: optimize calls to run in parallel and create TM when all complete
        // build
        try {
            this.registerActions(client, context, (client: any, context: any) => {
                this.registerAnnotations(client, context, (client: any, context: any) => {
                    this.registerAssertions(client, context, (client: any, context: any) => {
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

        console.log(`${new Date().getTime()} - Start loading actions`);
        // setup
        let configuration = Utilities.getConfigurationByManifest();

        // build
        client.createConfiguration(configuration, (data: any) => {
            console.log(`${new Date().getTime()} - Start register actions create config`, configuration, data);
            let response = JSON.parse(data);
            let configurationId = Utilities.isNullOrUndefined(response) || Utilities.isNullOrUndefined(response.id)
                ? ''
                : response.id;
            client.getPluginsByConfiguration(configurationId, (plugins: any) => {
                console.log(`${new Date().getTime()} - Getting register actions plugins by config`, configurationId);
                let hasNoPlugins = Utilities.isNullOrUndefined(plugins) || plugins === '';
                if (hasNoPlugins) {
                    client.getPlugins((plugins: any) => {
                        console.log(`${new Date().getTime()} - NO PLUGINS - Getting register actions metadata by config`, configurationId);
                        this.getMetadata(client, context, plugins, '', callback);
                    });
                }
                else {
                    console.log(`${new Date().getTime()} - Getting register actions metadata by config`, configurationId);
                    this.getMetadata(client, context, plugins, configurationId, callback);
                }
            });

        });
    }

    private getMetadata(client: RhinoClient, context: vscode.ExtensionContext, plugins: any, configurationId: string, callback: any) {
        client.getLocators((locators: any) => {
            client.getAttributes((attributes: any) => {
                client.getAnnotations((annotations: any) => {
                    let actionsManifests = JSON.parse(plugins);
                    let _locators = JSON.parse(locators);
                    let _attributes = JSON.parse(attributes);
                    let _annotations = JSON.parse(annotations);
                    let pluginsPattern = Utilities.getPluginsPattern(actionsManifests);

                    new ActionsAutoCompleteProvider()
                        .setPattern(pluginsPattern)
                        .setAttributes(_attributes)
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
                    if (configurationId === null || configurationId === '') {
                        callback(client, context);
                    }
                    else {
                        client.deleteConfiguration(configurationId, () => {
                            callback(client, context);
                        });
                    }
                });
            });
        });
    }

    private registerAnnotations(client: RhinoClient, context: vscode.ExtensionContext, callback: any) {
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Loading annotations(s)...');
        console.log(`${new Date().getTime()} - Start loading annotations`);

        // build
        client.getAnnotations((annotations: any) => {
            let manifests = JSON.parse(annotations);
            new AnnotationsAutoCompleteProvider().setManifests(manifests).register(context);

            console.info('Get-Plugins -Type Annotations = (OK, ' + manifests.length + ')');
            let message = '$(testing-passed-icon) Total of ' + manifests.length + ' annotation(s) loaded';
            vscode.window.setStatusBarMessage(message);

            // dependent providers
            new ParametersAutoCompleteProvider().setManifests(manifests).register(context);

            if (callback === null) {
                return;
            }
            callback(client, context);
        });
    }

    private registerAssertions(client: RhinoClient, context: vscode.ExtensionContext, callback: any) {
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Loading assertion method(s)...');
        console.log(`${new Date().getTime()} - Start loading assertions`);

        // build
        client.getAnnotations((annotations: any) => {
            client.getAssertions((assertions: any) => {
                client.getAttributes((attributes: any) => {
                    client.getLocators((locators: any) => {
                        client.getOperators((operators: any) => {
                            let manifests = JSON.parse(assertions);
                            let _annotations = JSON.parse(annotations);
                            let _locators = JSON.parse(locators);
                            let _operators = JSON.parse(operators);
                            let _attributes = JSON.parse(attributes);
                            new AssertionsAutoCompleteProvider()
                                .setManifests(manifests)
                                .setAnnotations(_annotations)
                                .setAttributes(_attributes)
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
        });
    }

    private registerMacros(client: RhinoClient, context: vscode.ExtensionContext, callback: any) {
        // user interface
        vscode.window.setStatusBarMessage('$(sync~spin) Loading macros(s)...');
        console.log(`${new Date().getTime()} - Start loading macros`);

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
        console.log(`${new Date().getTime()} - Start loading data-driven snippet(s)`);

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
        console.log(`${new Date().getTime()} - Start loading page model(s)`);

        // build
        client.getModels((models: any) => {
            let _models = JSON.parse(models);
            new ModelsAutoCompleteProvider().setManifests(_models).register(context);
            vscode.window.setStatusBarMessage('$(testing-passed-icon) Page models loaded');

            if (callback === null) {
                return;
            }
            callback(client, context);
        });
    }
}
