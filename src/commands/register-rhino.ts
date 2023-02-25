/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * WORK ITEMS
 * TODO: create a register which automatically resolves all commands/providers in the domain.
 */
import * as vscode from 'vscode';
import { CommandBase } from "./command-base";
import { ConnectServerCommand } from './connect-server';
import { InvokeTestCaseCommand } from './invoke-test-case';
import { RegisterPluginsCommand } from './register-plugins';
import { RegisterResourcesCommand } from './register-resources';
import { RegisterTestCaseCommand } from './register-test-case';
import { RegisterModelsCommand } from './register-models';
import { GetTestCaseCommand } from './get-test-case';
import { RegisterEnvironmentCommand } from './register-environment';
import { GetDocumentationCommand } from './get-documentation';
import { DocumentsProvider } from '../providers/documents-provider';
import { PipelinesProvider } from '../providers/pipelines-provider';
import { ScriptsProvider } from '../providers/scripts-provider';
import { RhinoDefinitionProvider } from '../providers/rhino-definition-provider';
import { UpdateSymbolsCommand } from './update-symbols';
import { CreateProjectCommand } from './create-project';
import { TmLanguageCreateModel } from '../models/tm-create-model';
import { TestCaseFormatter } from '../formatters/test-case-formatter';
import { Logger } from '../logging/logger';
import { InvokeTestCasesCommand } from './invoke-test-cases';
import { RhinoDocumentSymbolProvider } from '../providers/rhino-document-symbol-provider';

export class RegisterRhinoCommand extends CommandBase {
    // members: static
    private readonly _logger: Logger;

    // members: state
    private readonly _createModel: TmLanguageCreateModel | Promise<TmLanguageCreateModel>;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext, createModel: TmLanguageCreateModel | Promise<TmLanguageCreateModel>) {
        super(context);

        // build
        this._logger = super.logger?.newLogger('RegisterRhinoCommand');
        this._createModel = createModel;
        this.command = 'Register-Rhino';
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
        // setup
        const createModel = await this._createModel;
        const logger = this._logger;

        // register command
        let command = vscode.commands.registerCommand(this.command, async () => {
            await this.invokeCommand();
        });

        // register formatters
        let annotations = createModel.annotations;
        let testCaseFormatter = new TestCaseFormatter(this.context, annotations);

        vscode.languages.registerDocumentFormattingEditProvider('rhino', {
            provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                return testCaseFormatter.format(document, () => {
                    logger?.trace('Format-Document = OK');
                });
            }
        });

        // set
        this.context.subscriptions.push(command);
    }

    /**
     * Summary. Implement the command invoke pipeline.
     */
    protected async onInvokeCommand(): Promise<any> {
        // setup
        const createModel = await this._createModel;
        const context = this.context;
        const subscriptions = context.subscriptions;

        // clear
        for (let i = 0; i < subscriptions.length; i++) {
            subscriptions[i].dispose();
        }
        subscriptions.splice(0, subscriptions.length);

        // TODO: get by reflection
        // commands list
        let connectCommand = new ConnectServerCommand(context, createModel);
        let commands = [
            // main command (must be first)
            new CreateProjectCommand(context),
            new RegisterRhinoCommand(context, Promise.resolve(createModel)),

            // explorer views
            new DocumentsProvider(context),
            new PipelinesProvider(context),
            new ScriptsProvider(context),

            // symbols
            new RhinoDocumentSymbolProvider(context),

            // context
            new RhinoDefinitionProvider(context),

            // commands
            new GetDocumentationCommand(context),
            new GetTestCaseCommand(context),
            new InvokeTestCasesCommand(context),
            new InvokeTestCaseCommand(context),
            new RegisterEnvironmentCommand(context),
            new RegisterModelsCommand(context, createModel),
            new RegisterPluginsCommand(context, createModel),
            new RegisterResourcesCommand(context, createModel),
            new RegisterTestCaseCommand(context),
            new UpdateSymbolsCommand(context),
            connectCommand.syncData(true)
        ];

        // register
        for (const command of commands) {
            try {
                command.register();
            } catch (error: any) {
                console.warn(error);
                this._logger?.warning(error.message, error);
            }
        }
    }
}
