/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');
import { TreeItem } from '../contracts/tree-item';
import { LoggerConfig, RhinoServerConfig } from '../rhino/manifest-models';



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
     * Gets the first result from the RegExPMatchArray if exists, otherwise returns an empty string.
     * @param regexMatch The regular expressions match array.
     * @returns First element of the array.
    */
    public static getFirstRegexMatch(regexMatch: RegExpMatchArray | null): string {
        return regexMatch ? regexMatch[0] : "";
    }

    /**
     * Summary. Gets the current timestamp formatted as yy/MM/dd, HH:mm:ss.SSS.
     * 
     * @returns Timestamp as a string.
     */
    public static getTimestamp(): string {

        // return date.toLocaleTimeString(undefined,  'yy-MM-dd HH:mm:ss,SSS');
        var date = new Date();
        var options: Intl.DateTimeFormatOptions = { year: '2-digit', month: '2-digit', day: '2-digit', hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
        return `${date.toLocaleString('en-GB', options)}.${date.getMilliseconds()}`;
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
     * Summary. Gets RhinoServer endpoint from the project manifest.
     * 
     * @returns RhinoServer endpoint.
     */
    public static getRhinoEndpoint(): string {
        // setup
        let server = this.getRhinoServer();

        // get
        return server.schema + '://' + server.host + ':' + server.port;
    }
    /**
     * Summary. Gets RhinoServer configuration from the project manifest.
     * 
     * @returns RhinoServer endpoint.
     */
    public static getRhinoServer(): RhinoServerConfig {
        // setup
        let projectManifest = this.invokeGetProjectManifest();
        let serverConfig: RhinoServerConfig = projectManifest.rhinoServer;

        // get
        return serverConfig;
    }

    /**
     * Summary. Gets RhinoServer configuration from the project manifest.
     * 
     * @returns RhinoServer endpoint.
     */
    public static getLoggerConfig(name: string): LoggerConfig | undefined {
        // setup
        let projectManifest = this.invokeGetProjectManifest();
        let loggerConfig: LoggerConfig[] = projectManifest?.logConfiguration;

        // get
        return loggerConfig?.find(loggerConfig => loggerConfig.name === name);
    }

    /**
     * Summary. Generic polling by a set interval (in milliseconds) until the condition is met.
     * @param polledFunction 
     * @param stopCondition 
     * @param interval 
     * @returns 
     */
    public static async poll(polledFunction: (...args: any) => any, stopCondition: (...args: any) => boolean, interval: number | undefined) {
        let result;
        do {
            if (stopCondition(result)) {
                break;
            }
            result = await polledFunction();
            await this.wait(interval);
        } while (!stopCondition(result));
    }

    public static wait(ms = 1000) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
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
     * Summary. Get a flat list of all files under a directory including all sub-directories by file names.
     */
    public static getFilesByFileNames(directory: string, arrayOfNames: string[], callback: any) {
        // setup
        const list: string[] = [];
        const patternToExtractName = /(?!\\)\w+(?=.json)/;

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

                    for (const name of arrayOfNames) {
                        var matches = filePath.match(patternToExtractName);

                        if (matches !== null && matches[0] === name) {
                            list.push(filePath);
                        }
                    }
                }
            }
        };

        // build
        getFilesFromDirectory(directory);

        // callback
        callback(list);
    }

    /**
     * Summary. Get a flat list of all files and folders sorted by folders > a-z > files a-z.
     */
    public static getSortedFilesAndFolders(
        folderPath: string, excludeFolders: string[] = [], includeFiles: string[] = []): string[] {
        // local
        const sortByName = (list: string[]) => {
            return list.sort((n1: string, n2: string) => {
                if (n1 > n2) {
                    return 1;
                }

                if (n1 < n2) {
                    return -1;
                }

                return 0;
            });
        };

        //bad request
        let folders: string[] = [];
        let files: string[] = [];
        if (!fs.existsSync(folderPath)) {
            return [...folders, ...files];
        }

        // setup
        excludeFolders = excludeFolders.map(i => i.toUpperCase());
        includeFiles = includeFiles.map(i => i.toUpperCase());

        let unsorted = fs.readdirSync(folderPath);


        // sort o-n
        for (let item of unsorted) {
            let file = path.join(folderPath, item);
            let stats = fs.statSync(file);
            if (stats.isDirectory()) {
                let isExcluded = excludeFolders.indexOf(item.toUpperCase()) > -1 && excludeFolders.length !== 0;
                if (isExcluded) {
                    continue;
                }
                folders.push(item);
            }
            else if (stats.isFile()) {
                let suffix = path.extname(item).toUpperCase();
                let isIncluded = includeFiles.length === 0 || includeFiles.indexOf(suffix) > -1;
                if (!isIncluded) {
                    continue;
                }
                files.push(item);
            }
        }

        // sort a-z
        folders = sortByName(folders);
        files = sortByName(files);

        // get
        return [...folders, ...files];
    }

    public static getTreeItems(
        directory: string,
        excludeFolders: string[] = [],
        includeFiles: string[] = [],
        openItemCommand?: string): Thenable<TreeItem[]> {

        const getFromDirectory: any = (directoryPath: any, parent: TreeItem) => {
            // setup
            const folderPath = path.basename(directoryPath);
            const files = Utilities.getSortedFilesAndFolders(directoryPath, excludeFolders, includeFiles);

            // normalize
            if (parent !== null && parent !== undefined) {
                parent.children = parent.children === null || parent.children === undefined
                    ? []
                    : parent.children;
            }
            else {
                parent = new TreeItem(folderPath, vscode.ThemeIcon.Folder);
                parent.children = [];
            }

            for (const file of files) {
                const filePath = path.join(directoryPath, file);
                const stats = fs.statSync(filePath);

                if (stats.isDirectory()) {
                    const item = path.basename(filePath);
                    const section = new TreeItem(item, vscode.ThemeIcon.Folder);
                    section.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                    parent.children?.push(section);
                    getFromDirectory(filePath, section);
                }
                else {
                    let onFile = filePath.replaceAll('\\', '/');
                    onFile = onFile.match(/^[a-z,A-Z]:/) ? `/${onFile}` : onFile;
                    const command = <vscode.Command>{
                        title: "",
                        command: openItemCommand,
                        arguments: [vscode.Uri.file(onFile)]
                    };

                    const item = new TreeItem(file, vscode.ThemeIcon.File, undefined, command);
                    parent.children?.push(item);
                }
            }

            return parent;
        };

        // build
        return new Promise<any>((resolve) => {
            let docs = getFromDirectory(directory);
            if (docs.children === null || docs.children === undefined) {
                resolve([docs]);
            }
            resolve([...docs.children]);
        });
    }

    /**
     * Summary. Get a default configuration based on the current Manifest.json file.
     */
    public static getConfigurationByManifest(): any {
        // setup
        let projectManifest = this.getProjectManifest();

        // build
        let integration = !this.invokeIsNullOrUndefined(projectManifest.integration)
            ? projectManifest.integration
            : null;
        let attempts = !this.invokeIsNullOrUndefined(projectManifest.attempts)
            ? projectManifest.attempts
            : 1;
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
            attempts: attempts,
            integration: integration,
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

    /**
     * Summary. Normalize a test case document before sending it for invocation.
     */
    public static buildRhinoSpec(spec: String): string {
        // constants
        const multilineRegex = /\s`$/g;

        // setup
        let rawLines = spec.split('\n');
        let lines = [];

        // normalize
        for (let i = 0; i < rawLines.length; i++) {
            let line = rawLines[i];
            let previousLine = rawLines[(i - 1 < 0 ? 0 : i - 1)];
            let isMatch = line.trim().match(multilineRegex) !== null;
            let isPreviousMatch = previousLine.trim().match(multilineRegex) !== null;

            if (!isMatch && !isPreviousMatch || (isMatch && !isPreviousMatch)) {
                lines.push(line);
                continue;
            }

            let index: number = lines.length - 1;
            let multiline: string = lines[index];

            line = ' ' + line.trim().replace(multilineRegex, '');
            multiline = multiline.trim().replace(multilineRegex, '') + line;

            lines[index] = multiline;
        }

        // get
        return lines.map(i => i.trim().replace(/^\d+\.\s+/, '')).join('\n');
    }
}
