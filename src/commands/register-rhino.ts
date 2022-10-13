/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import { Command } from "./command";
import { ConnectServerCommand } from './connect-server';
import { CreateProjectCommand } from './create-project';
import { InvokeTestCaseCommand } from './invoke-test-case';
import { RegisterPluginsCommand } from './register-plugins';
import { RegisterTestCaseCommand } from './register-test-case';
import { RegisterModelsCommand } from './register-models';
import { GetTestCaseCommand } from './get-test-case';
import { InvokeAllTestCasesCommand } from './invoke-all-test-cases';
import { RegisterEnvironmentCommand } from './register-environment';
import { GetDocumentationCommand } from './get-documentation';
import { TestCaseFormatter } from '../formatters/test-case-formatter';

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
        for (let i = 1; i < subscriptions.length; i++) {
            subscriptions[i].dispose();
        }
        subscriptions.splice(1, subscriptions.length);

        // TODO: create a register which automatically resolves all commands in the domain.
        // build
        new RegisterTestCaseCommand(context).register();
        new CreateProjectCommand(context).register();
        new InvokeTestCaseCommand(context).register();
        new InvokeAllTestCasesCommand(context).register();
        new RegisterPluginsCommand(context).register();
        new RegisterModelsCommand(context).register();
        new GetTestCaseCommand(context).register();
        new RegisterEnvironmentCommand(context).register();
        new GetDocumentationCommand(context).register();
        new ConnectServerCommand(context).invokeCommand();
    }
}
