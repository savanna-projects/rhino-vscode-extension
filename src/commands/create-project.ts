/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://code.visualstudio.com/api/references/commands
 */
import fs = require('fs');
import os = require('os');

import * as ph from 'path';
import * as vscode from 'vscode';

import { Command } from "./command";
import { Utilities } from '../extensions/utilities';

export class CreateProjectCommand extends Command {
    /**
     * Summary. Creates a new instance of VS Command for Rhino API.
     * 
     * @param context The context under which to register the command.
     */
    constructor(context: vscode.ExtensionContext) {
        super(context);

        // build
        this.setCommandName('Create-Project');
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

    private invoke() {
        // setup
        let dialogOptions = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        };

        // build
        vscode.window.showOpenDialog(dialogOptions).then(folderUri => {
            CreateProjectCommand.createProjectFolder(folderUri);
            CreateProjectCommand.createProjectManifest(folderUri);
            CreateProjectCommand.openFolder(folderUri);
        });
    }

    // take the input from openDialog
    private static createProjectFolder(userPath: any) {
        // setup path
        let path = '';
        if (userPath && userPath[0]) {
            path = userPath[0].path;
        }
        path = os.platform() === 'win32' ? path.replaceAll('/', '\\').substring(1, path.length - 1) : path;

        // create folders
        let folders = [
            ph.join(path, 'Configurations'),
            ph.join(path, 'Models'),
            ph.join(path, 'Plugins'),
            ph.join(path, 'TestCases')
        ];
        for (const folder of folders) {
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
            }
        }
    }

    // take the input from openDialog
    private static createProjectManifest(userPath: any) {
        let manifastObjt = Utilities.getDefaultProjectManifest();
        let manifastData = JSON.stringify(manifastObjt, null, '\t');

        // setup path
        let path = '';
        if (userPath && userPath[0]) {
            path = userPath[0].path;
        }
        path = os.platform() === 'win32' ? path.replaceAll('/', '\\').substring(1, path.length - 1) : path;

        // create manifest
        let manifestPath = ph.join(path, 'Manifest.json');
        fs.writeFile(manifestPath, manifastData, (err) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            }
        });
    }

    // open a folder in VS Code workspace
    private static openFolder(userPath: any) {
        // build
        let path = '';
        if (userPath && userPath[0]) {
            path = userPath[0].path;
        }
        path = os.platform() === 'win32' ? path.replaceAll('/', '\\').substring(1, path.length - 1) : path;

        // setup
        let uri = vscode.Uri.file(path);

        // invoke
        vscode.commands.executeCommand('vscode.openFolder', uri);
    }
}