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
        // setup
        var dialogOptions = {
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
        var path = '';
        if (userPath && userPath[0]) {
            path = userPath[0].path;
        }
        path = os.platform() === 'win32' ? path.replaceAll('/', '\\').substr(1, path.length - 1) : path;

        // create folders
        var folders = [
            ph.join(path, 'Configurations'),
            ph.join(path, 'Models'),
            ph.join(path, 'Plugins'),
            ph.join(path, 'TestCases')
        ];
        for (let i = 0; i < folders.length; i++) {
            if (!fs.existsSync(folders[i])) {
                fs.mkdirSync(folders[i], { recursive: true });
            }
        }
    }

    // take the input from openDialog
    private static createProjectManifest(userPath: any) {
        var manifastObjt = Utilities.getDefaultProjectManifest();
        var manifastData = JSON.stringify(manifastObjt, null, '\t');

        // setup path
        var path = '';
        if (userPath && userPath[0]) {
            path = userPath[0].path;
        }
        path = os.platform() === 'win32' ? path.replaceAll('/', '\\').substr(1, path.length - 1) : path;

        // create manifest
        var manifestPath = ph.join(path, 'manifest.json');
        fs.writeFile(manifestPath, manifastData, (err) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            }
        });
    }

    // open a folder in VS Code workspace
    private static openFolder(userPath: any) {
        // build
        var path = '';
        if (userPath && userPath[0]) {
            path = userPath[0].path;
        }
        path = os.platform() === 'win32' ? path.replaceAll('/', '\\').substr(1, path.length - 1) : path;

        // setup
        var uri = vscode.Uri.file(path);

        // invoke
        vscode.commands.executeCommand('vscode.openFolder', uri);
    }
}