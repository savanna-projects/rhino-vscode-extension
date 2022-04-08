/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import path = require('path');

export class Utilities {
    /**
     * Summary. Gets a pattern to identify all available plugins in a single text line.
     * 
     * @returns A pattern to identify all available plugins.
     */
    public static getPluginsPattern(manifests: any): string {
        // setup
        var patterns: string[] = [];

        // build
        for (var i = 0; i < manifests.length; i++) {
            patterns.push("(?<!['])" + manifests[i].literal);

            if (!manifests[i].hasOwnProperty('aliases')) {
                continue;
            }

            for (var j = 0; j < manifests[i].aliases.length; j++) {
                patterns.push(manifests[i].aliases[j]);
            }
        }

        // get
        return patterns.join('|');
    }

    /**
     * Summary. Gets the project manifest object or default if not found.
     * 
     * @returns Project manifest.
     */
    public static getProjectManifest(): any {
        // setup
        var workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;
        var manifest = path.join(workspace, 'manifest.json');
        manifest = manifest.startsWith('\\') ? manifest.substr(1, manifest.length) : manifest;

        // build
        const fs = require('fs');
        try {
            var data = fs.readFileSync(manifest, 'utf8');
            return JSON.parse(data);
        } catch (e: any) {
            console.log('Error:', e.stack);
        }

        // default
        return Utilities.buildProjectManifest();
    }

    /**
     * Summary. Gets the default project manifest object.
     * 
     * @returns Default project manifest.
     */
    public static getDefaultProjectManifest(): any {
        return Utilities.buildProjectManifest();
    }

    // factor the default project manifest
    private static buildProjectManifest(): any {
        return {
            "rhinoServer": {
                "schema": "http",
                "host": "localhost",
                "port": "9000"
            },
            "connectorConfiguration": {
                "connector": "ConnectorText"
            },
            "authentication": {
                "userName": "<rhino username>",
                "password": "<rhino password>"
            },
            "driverParameters": [
                {
                    "driver": "ChromeDriver",
                    "driverBinaries": "."
                }
            ],
            "engineConfiguration": {
                "maxParallel": 1,
                "elementSearchingTimeout": 15000,
                "pageLoadTimeout": 60000
            }
        }
    }

    /**
     * Summary. Updates the TM Language configuration on runtime.
     * 
     * @returns Default project manifest.
     */
    public static updateTmConfiguration(context: vscode.ExtensionContext, tmConfiguration: string) {
        // setup
        var tmFile = path.join(context.extensionPath, 'rhino-tmLanguage.json')

        // build
        const fs = require('fs');
        try {
            fs.writeFileSync(tmFile, tmConfiguration);
        } catch (e: any) {
            console.log('Error:', e.stack);
        }
    }

    /**
     * Summary. Get an indication if an object is null or undefined.
     * 
     * @returns true if null or undefined, otherwise false.
     */
    public static isNullOrUndefined(obj: any) {
        try {
            return obj === null || obj === undefined;
        } catch {
            return true;
        }
    }

    /**
     * Summary. Get a flat list of all files under a directory including all sub-directories.
     */
    public static getFiles(directory: string, callback: any) {
        // setup
        const fs = require('fs');
        const path = require('path');
        const list: string[] = [];

        // iterate
        const getFilesFromDirectory: any = (directoryPath: any) => {
            const files = fs.readdirSync(directoryPath);
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const filePath = path.join(directoryPath, file);
                const stats = fs.statSync(filePath);

                if(stats.isDirectory()) {
                    getFilesFromDirectory(filePath);
                }
                else{
                    list.push(filePath);
                }
            }

            callback(list);
        };

        // get
        return getFilesFromDirectory(directory)
    }
}
