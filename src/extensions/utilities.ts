/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import path = require('path');

export class Utilities {
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
        } catch(e) {
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
            "connector": {
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
            "drivers": [
                {
                    driver: "ChromeDriver",
                    driverBinaries: "."
                }
            ]
        };
    }
}