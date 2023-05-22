/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/commands
 */
import fs = require('fs');
import os = require('os');
import * as path from 'path';
import * as vscode from 'vscode';
import { Utilities } from '../extensions/utilities';
import { Logger } from '../logging/logger';
import { CommandBase } from './command-base';

export class CreateProjectCommand extends CommandBase {
    // members: static
    private readonly _logger: Logger;

    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this._logger = super.logger?.newLogger('CreateProjectCommand');
        this.command = 'Create-Project';
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
        let dialogOptions = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        };

        // build
        vscode.window.showOpenDialog(dialogOptions).then(folderUri => {
            this.createProjectFolder(folderUri);
            this.createProjectManifest(folderUri);
            // TODO: implement switch from user
            this.createSampleTests(folderUri);
            this.createSamplePlugins(folderUri);
            this.createSampleDocumentation(folderUri);
            this.createSampleScripts(folderUri);
            this.createSamplePipelines(folderUri);
            this.createSampleModels(folderUri);
            this.createSampleEnvironment(folderUri);
            this.createSampleResource(folderUri);
            // user switch ends
            this.openFolder(folderUri);
        });
    }

    // take the input from openDialog
    private createProjectFolder(userPath: any) {
        // setup path
        const projectPath = this.getPath(userPath);

        // create folders
        const folders = [
            path.join(projectPath, 'docs'),
            path.join(projectPath, 'docs/Examples'),
            path.join(projectPath, 'build'),
            path.join(projectPath, 'scripts'),
            path.join(projectPath, 'src/Configurations'),
            path.join(projectPath, 'src/Environments'),
            path.join(projectPath, 'src/Models'),
            path.join(projectPath, 'src/Models/Json'),
            path.join(projectPath, 'src/Models/Markdown'),
            path.join(projectPath, 'src/Plugins'),
            path.join(projectPath, 'src/Plugins/Examples'),
            path.join(projectPath, 'src/Tests'),
            path.join(projectPath, 'src/Tests/Examples'),
            path.join(projectPath, 'src/Resources'),
            path.join(projectPath, 'src/Resources/Examples')
        ];
        for (const folder of folders) {
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
            }
        }
    }

    // take the input from openDialog
    private createProjectManifest(userPath: any) {
        // setup
        const manifestObj = Utilities.getManifest();
        const content = JSON.stringify(manifestObj, null, '\t');
        const projectPath = path.join(this.getPath(userPath), 'src');

        // write
        this.writeFile(projectPath, 'Manifest.json', content);
    }

    private createSampleTests(userPath: any) {
        // setup
        const contentBasic = Utilities.getResource('DemoTestBasic.txt');
        const contentWithModels = Utilities.getResource('DemoTestModel.txt');
        const contentWithEnvironment = Utilities.getResource('DemoTestEnvironment.txt');
        const contentWithPlugins = Utilities.getResource('DemoTestPlugins.txt');
        const examplesPath = path.join(this.getPath(userPath), 'src', 'Tests', 'Examples');

        // write
        this.writeFile(examplesPath, 'FindSomethingOnGoogle.rhino', contentBasic);
        this.writeFile(examplesPath, 'FindSomethingOnGoogleWithModels.rhino', contentWithModels);
        this.writeFile(examplesPath, 'FindSomethingOnGoogleWithEnvironment.rhino', contentWithEnvironment);
        this.writeFile(examplesPath, 'FindSomethingOnGoogleWithPlugins.rhino', contentWithPlugins);
    }

    private createSamplePlugins(userPath: any) {
        // setup
        const content = Utilities.getResource('DemoPlugin.txt');
        const examplesPath = path.join(this.getPath(userPath), 'src', 'Plugins', 'Examples');

        // write
        this.writeFile(examplesPath, 'GoogleSearch.rhino', content);
    }

    // TODO: add guidelines document
    private createSampleDocumentation(userPath: any) {
        // set content
        const contentOverview = Utilities.getResource('LanguageOverview.md');
        const contentConventionsOverview = Utilities.getResource('NamingConventionsOverview.md');
        const contentHome = Utilities.getResource('DocumentHome.md');
        const pathHome = path.join(this.getPath(userPath), 'docs');
        const pathExamples = path.join(this.getPath(userPath), 'docs', 'Examples');
        const contentExamplesHome = Utilities.getResource('DocumentExamplesHome.md');
        const contentExample = Utilities.getResource('DocumentExample.md');

        // write
        this.writeFile(pathHome, 'LanguageOverview.md', contentOverview);
        this.writeFile(pathHome, 'NamingConventionsOverview.md', contentConventionsOverview);
        this.writeFile(pathHome, 'Home.md', contentHome);
        this.writeFile(pathExamples, 'Home.md', contentExamplesHome);
        this.writeFile(pathExamples, 'GoogleSearch.md', contentExample);
    }

    private createSampleScripts(userPath: any) {
        // setup
        const contentHome = Utilities.getResource('DemoScript.ps1');
        const scriptsPath = path.join(this.getPath(userPath), 'scripts');

        // write
        this.writeFile(scriptsPath, 'InvokeConfiguration.ps1', contentHome);
    }

    private createSamplePipelines(userPath: any) {
        // set content
        const contentGitHub = Utilities.getResource('DemoGitHubActions.yml');
        const contentAzure = Utilities.getResource('DemoAzureDevOps.yml');
        const buildsPath = path.join(this.getPath(userPath), 'build');

        // write
        this.writeFile(buildsPath, 'GitActions.yaml', contentGitHub);
        this.writeFile(buildsPath, 'AzurePipeline.yaml', contentAzure);
    }

    private createSampleModels(userPath: any) {
        // setup
        const contentMarkdown = Utilities.getResource('DemoModel.txt');
        const contentJson = Utilities.getResource('DemoModel.json');
        const pathMarkdown = path.join(this.getPath(userPath), 'src', 'Models', 'Markdown');
        const pathJson = path.join(this.getPath(userPath), 'src', 'Models', 'Json');

        // write
        this.writeFile(pathMarkdown, 'GoogleSearchHomePage.rmodel', contentMarkdown);
        this.writeFile(pathJson, 'GoogleSearchHomePage.json', contentJson);
    }

    private createSampleEnvironment(userPath: any) {
        // setup
        const body = Utilities.getResource('DemoEnvironment.json');

        // set content
        const content = JSON.stringify(JSON.parse(body), null, 4);
        const environmentsPath = path.join(this.getPath(userPath), 'src', 'Environments');

        // write
        this.writeFile(environmentsPath, 'GoogleSearchEnvironment.json', content);
    }

    private createSampleResource(userPath: any) {
        // setup
        const content = Utilities.getResource('DemoResource.txt');

        // set content
        const resourcesPath = path.join(this.getPath(userPath), 'src', 'Resources', 'Examples');

        // write
        this.writeFile(resourcesPath, 'DemoResource.txt', content);
    }

    // open a folder in VS Code workspace
    private openFolder(userPath: any) {
        // build
        let projectPath = this.getPath(userPath);
        projectPath = os.platform() === 'win32' && projectPath.startsWith('/')
            ? projectPath.substring(1, projectPath.length)
            : projectPath;
        projectPath = os.platform() === 'win32'
            ? projectPath.replaceAll('/', '\\').substring(0, projectPath.length)
            : projectPath;

        // setup
        const uri = vscode.Uri.file(path.join(projectPath, 'src'));

        // invoke
        vscode.commands.executeCommand('vscode.openFolder', uri);
    }

    private writeFile(directoryPath: string, fileName: string, content: string) {
        // setup
        const manifestPath = path.join(directoryPath, fileName);

        // write
        fs.writeFile(manifestPath, content, (error: any) => {
            if (error) {
                this._logger?.error(error.message, error);
            }
        });
    }

    private getPath(userPath: any) {
        // setup
        let path = '';

        // default
        if (userPath && userPath[0]) {
            path = userPath[0].path;
        }

        // get
        return os.platform() === 'win32'
            ? path.replaceAll('/', '\\').substring(1, path.length)
            : path;
    }
}
