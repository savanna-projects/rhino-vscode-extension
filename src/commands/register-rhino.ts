/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * WORK ITEMS
 * TODO: create a register which automatically resolves all commands/providers in the domain.
 */
import * as vscode from 'vscode';
import { Command } from "./command";
import { ConnectServerCommand } from './connect-server';
import { InvokeTestCaseCommand } from './invoke-test-case';
import { RegisterPluginsCommand } from './register-plugins';
import { RegisterResourcesCommand } from './register-resources';
import { RegisterTestCaseCommand } from './register-test-case';
import { RegisterModelsCommand } from './register-models';
import { GetTestCaseCommand } from './get-test-case';
import { InvokeAllTestCasesCommand } from './invoke-all-test-cases';
import { RegisterEnvironmentCommand } from './register-environment';
import { GetDocumentationCommand } from './get-documentation';
import { TestCaseFormatter } from '../formatters/test-case-formatter';
import { DocumentsProvider } from '../providers/documents-provider';
import { PipelinesProvider } from '../providers/pipelines-provider';
import { ScriptsProvider } from '../providers/scripts-provider';
import { RhinoDocumentSymbolProvider } from '../providers/rhino-symbol-provider';
import { RhinoDefinitionProvider } from '../providers/rhino-definition-provider';
import { UpdateSymbolsCommand } from './update-symbols';
import { CreateProjectCommand } from './create-project';

export class RegisterRhinoCommand extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Register-Rhino');
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
        // register command
        let command = vscode.commands.registerCommand(this.getCommandName(), () => {
            this.invoke();
        });

        // register formatters
        this.getRhinoClient().getAnnotations((annotationsResponse: any) => {
            let annotations = JSON.parse(annotationsResponse);
            let testCaseFormatter = new TestCaseFormatter(this.getContext(), annotations);

            vscode.languages.registerDocumentFormattingEditProvider('rhino', {
                provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                    return testCaseFormatter.format(document, () => {
                        console.log('Format-Document = OK');
                    });
                }
            });
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
        let context = this.getContext();
        let subscriptions = context.subscriptions;

        // clear
        for (let i = 0; i < subscriptions.length; i++) {
            subscriptions[i].dispose();
        }
        subscriptions.splice(0, subscriptions.length);

        // TODO: get by reflection
        // commands list
        let commands = [
            // main command (must be first)
            new CreateProjectCommand(context),
            new RegisterRhinoCommand(context),

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
            new InvokeAllTestCasesCommand(context),
            new InvokeTestCaseCommand(context),
            new RegisterEnvironmentCommand(context),
            new RegisterModelsCommand(context),
            new RegisterPluginsCommand(context),
            new RegisterResourcesCommand(context),
            new RegisterTestCaseCommand(context),
            new UpdateSymbolsCommand(context),
            new ConnectServerCommand(context)
        ];

        // register
        commands.forEach(element => {
            try {
                element.register();   
            } catch (error) {
                console.warn(error);
            }
        });
    }
}
