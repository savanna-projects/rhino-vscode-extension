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
        } catch (e) {
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
                "collection": null,
                "connector": "connector_text",
                "password": null,
                "project": null,
                "userName": null
            },
            "authentication": {
                "userName": "<rhino user name>",
                "password": "<rhino password>"
            },
            "driverParameters": [
                {
                    driver: "ChromeDriver",
                    driverBinaries: "."
                }
            ]
        };
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
        } catch (e) {
            console.log('Error:', e.stack);
        }
    }
}