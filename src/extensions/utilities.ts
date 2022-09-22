/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');

export class Utilities {
    /**
     * Summary. Gets a pattern to identify all available plugins in a single text line.
     * 
     * @returns A pattern to identify all available plugins.
     */
    public static getPluginsPattern(manifests: any): string {
        // setup
        let patterns: string[] = [];

        // build
        for (const manifest of manifests) {
            patterns.push("(?<!['])" + manifest.literal);

            if (!manifest.hasOwnProperty('aliases')) {
                continue;
            }

            for (const alias of manifest.aliases) {
                patterns.push(alias);
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
        return this.invokeGetProjectManifest();
    }

    /**
     * Summary. Gets the default project manifest object.
     * 
     * @returns Default project manifest.
     */
    public static getDefaultProjectManifest(): any {
        return Utilities.buildProjectManifest();
    }

    /**
     * Summary. Updates the TM Language configuration on runtime.
     * 
     * @returns Default project manifest.
     */
    public static updateTmConfiguration(context: vscode.ExtensionContext, tmConfiguration: string) {
        // setup
        let tmFile = path.join(context.extensionPath, 'rhino-tmLanguage.json');

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
    public static isNullOrUndefined(obj: any): boolean {
        return this.invokeIsNullOrUndefined(obj);
    }

    /**
     * Summary. Get a flat list of all files under a directory including all sub-directories.
     */
    public static getFiles(directory: string, callback: any) {
        // setup
        const list: string[] = [];

        // iterate
        const getFilesFromDirectory: any = (directoryPath: any) => {
            const files = fs.readdirSync(directoryPath);

            for (const file of files) {
                const filePath = path.join(directoryPath, file);
                const stats = fs.statSync(filePath);

                if (stats.isDirectory()) {
                    getFilesFromDirectory(filePath);
                }
                else {
                    list.push(filePath);
                }
            }
        };

        // build
        getFilesFromDirectory(directory);

        // callback
        callback(list);
    }

    /**
     * Summary. Get a default configuration based on the current Manifest.json file.
     */
    public static getConfigurationByManifest(): any {
        // setup
        let projectManifest = this.getProjectManifest();

        // build
        let engineConfiguration = !this.invokeIsNullOrUndefined(projectManifest.engineConfiguration)
            ? projectManifest.engineConfiguration
            : {
                maxParallel: 1,
                elementSearchingTimeout: 15000,
                pageLoadTimeout: 60000
            };
        let reportConfiguration = !this.invokeIsNullOrUndefined(projectManifest.reportConfiguration)
            ? projectManifest.reportConfiguration
            : {
                reporters: [
                    "ReporterBasic"
                ],
                archive: false,
                localReport: true,
                addGravityData: true
            };
        let screenshotsConfiguration = !this.invokeIsNullOrUndefined(projectManifest.screenshotsConfiguration)
            ? projectManifest.screenshotsConfiguration
            : {
                keepOriginal: false,
                returnScreenshots: false,
                onExceptionOnly: false
            };
        let connectorConfiguration = !this.invokeIsNullOrUndefined(projectManifest.connectorConfiguration)
            ? projectManifest.connectorConfiguration
            : {
                connector: "ConnectorText"
            };
        let externalRepositories = !this.invokeIsNullOrUndefined(projectManifest.externalRepositories)
            ? projectManifest.externalRepositories
            : [];

        // get
        return {
            name: "VS Code - Standalone Test Run",
            testsRepository: [],
            driverParameters: projectManifest.driverParameters,
            authentication: projectManifest.authentication,
            screenshotsConfiguration: screenshotsConfiguration,
            reportConfiguration: reportConfiguration,
            engineConfiguration: engineConfiguration,
            connectorConfiguration: connectorConfiguration,
            externalRepositories: externalRepositories
        };
    }

    private static invokeGetProjectManifest(): any {
        // setup
        let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined ? '' : workspace;
        let manifest = workspace.endsWith('src')
            ? path.join(workspace, 'Manifest.json')
            : path.join(workspace, 'src', 'Manifest.json');
        manifest = manifest.startsWith('\\') ? manifest.substring(1, manifest.length) : manifest;

        // build
        try {
            let data = fs.readFileSync(manifest, 'utf8');
            console.log(`Get-Manifest -Uri '${manifest}' = OK`);
            return JSON.parse(data);
        } catch (e: any) {
            console.log(`Get-Manifest -Uri '${manifest}' = NotFound`);
        }

        // default
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
                "username": "<rhino username>",
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
        };
    }

    private static invokeIsNullOrUndefined(obj: any) {
        try {
            return obj === null || obj === undefined;
        } catch {
            return true;
        }
    }
}
