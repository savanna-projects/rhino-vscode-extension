/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { Logger } from '../logging/logger';
import { TmLanguageCreateModel } from '../models/tm-create-model';
import { ActionsAutoCompleteProvider } from '../providers/actions-auto-complete-provider';
import { AnnotationsAutoCompleteProvider } from '../providers/annotations-auto-complete-provider';
import { AssertionsAutoCompleteProvider } from '../providers/assertions-auto-complete-provider';
import { DataAutoCompleteProvider } from '../providers/data-auto-complete-provider';
import { MacrosAutoCompleteProvider } from '../providers/macros-auto-complete-provider';
import { ModelsAutoCompleteProvider } from '../providers/models-auto-complete-provider';
import { ParametersAutoCompleteProvider } from '../providers/parameters-auto-complete-provider';
import { CommandBase } from "./command-base";
import { CreateTmLanguageCommand } from './create-tm-language';
import { RegisterRhinoCommand } from './register-rhino';

export class ConnectServerCommand extends CommandBase {
    // members: static
    private readonly _logger: Logger;

    // members: state
    private _createModel: TmLanguageCreateModel | Promise<TmLanguageCreateModel>;
    private _refresh: boolean = true;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext, createModel: TmLanguageCreateModel) {
        super(context);

        // build
        this._logger = super.logger?.newLogger('ConnectServerCommand');
        this.command = 'Connect-Server';
        this._createModel = createModel;
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
    protected async onRegister(): Promise<any> {
        // build
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
        const createModel = this._refresh
            ? await Utilities.getTmCreateObject()
            : await this._createModel;

        try {
            // clean
            const model = await Promise.resolve(this._createModel);
            await new RegisterRhinoCommand(context, model).invokeCommand();

            // register
            ConnectServerCommand.registerActionsAutoCompleteProvider(context, createModel);
            ConnectServerCommand.registerAnnotationsAutoCompleteProvider(context, createModel);
            ConnectServerCommand.registerAssertionsAutoCompleteProvider(context, createModel);
            ConnectServerCommand.registerMacrosAutoCompleteProvider(context, createModel);
            ConnectServerCommand.registerDataAutoCompleteProvider(context, createModel);
            ConnectServerCommand.registerModelsAutoCompleteProvider(context, createModel);

            // create language
            new CreateTmLanguageCommand(context, createModel).invokeCommand();
        } catch (error: any) {
            // internal server error
            this._logger?.error(error.message, error);
            vscode.window.setStatusBarMessage(`$(testing-error-icon) ${error.message}...`);
        }
    }

    public syncData(sync: boolean): ConnectServerCommand {
        // set
        this._refresh = sync;

        // get
        return this;
    }

    //#region *** Providers    ***
    private static async registerActionsAutoCompleteProvider(
        context: vscode.ExtensionContext,
        createModel: TmLanguageCreateModel): Promise<void> {
        // setup
        const manifests = createModel.plugins;
        const provider = new ActionsAutoCompleteProvider(context);

        // build
        provider.manifests = manifests;
        provider.locators = createModel.locators;
        provider.attributes = createModel.attributes;
        provider.annotations = createModel.annotations;
        provider.pattern = Utilities.getPluginsPattern(manifests);

        // register
        provider.register();
    }

    private static async registerAnnotationsAutoCompleteProvider(
        context: vscode.ExtensionContext,
        createModel: TmLanguageCreateModel): Promise<void> {
        // setup
        const annotations = createModel.annotations;
        const annotationsProvider = new AnnotationsAutoCompleteProvider(context);
        const parametersProvider = new ParametersAutoCompleteProvider(context);

        // register
        annotationsProvider.manifests = annotations;
        annotationsProvider.register();

        parametersProvider.manifests = annotations;
        parametersProvider.register();
    }

    private static async registerAssertionsAutoCompleteProvider(
        context: vscode.ExtensionContext,
        createModel: TmLanguageCreateModel): Promise<void> {
        // setup
        const provider = new AssertionsAutoCompleteProvider(context);

        // build
        provider.manifests = createModel.assertions;
        provider.annotations = createModel.annotations;
        provider.attributes = createModel.attributes;
        provider.locators = createModel.locators;
        provider.operators = createModel.operators;

        // register
        provider.register();
    }

    private static async registerMacrosAutoCompleteProvider(
        context: vscode.ExtensionContext,
        createModel: TmLanguageCreateModel): Promise<any> {
        // setup
        const provider = new MacrosAutoCompleteProvider(context);

        // build
        provider.manifests = createModel.macros;

        // register
        provider.register();
    }

    private static async registerDataAutoCompleteProvider(
        context: vscode.ExtensionContext,
        createModel: TmLanguageCreateModel): Promise<any> {
        // setup
        const provider = new DataAutoCompleteProvider(context);

        // build
        provider.annotations = createModel.annotations;

        // register
        provider.register();
    }

    private static async registerModelsAutoCompleteProvider(
        context: vscode.ExtensionContext,
        createModel: TmLanguageCreateModel): Promise<any> {
        // setup
        const provider = new ModelsAutoCompleteProvider(context);

        // build
        provider.manifests = createModel.models;

        // register
        provider.register();
    }
    //#endregion
}
