import * as fs from 'fs';
import * as vscode from 'vscode';
import path = require('path');
import { ServerConfiguration } from '../models/server-configuration';
import { TreeItem } from '../components/tree-item';
import { RhinoClient } from '../clients/rhino-client';
import { TmLanguageCreateModel } from '../models/tm-create-model';

export class Utilities {
    public static assertJson(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        }
        catch {
            return false;
        }
    }

    /**
     * Summary. Get an indication if an object is null or undefined.
     * 
     * @returns true if null or undefined, otherwise false.
     */
    public static assertNullOrUndefined(obj: any) {
        return this.assertUndefinedOrNull(obj);
    }

    /**
     * Summary. Normalize a test case document before sending it for invocation.
     */
    public static formatRhinoSpec(spec: String): string {
        // constants
        const multilineRegex = /\s`$/g;

        // setup
        const rawLines = spec.split('\n');
        const lines = [];

        // normalize
        for (let i = 0; i < rawLines.length; i++) {
            let line = rawLines[i];
            const previousLine = rawLines[(i - 1 < 0 ? 0 : i - 1)];
            const isMatch = line.trim().match(multilineRegex) !== null;
            const isPreviousMatch = previousLine.trim().match(multilineRegex) !== null;

            if (!isMatch && !isPreviousMatch || (isMatch && !isPreviousMatch)) {
                lines.push(line);
                continue;
            }

            const index: number = lines.length - 1;
            let multiline: string = lines[index];

            line = ' ' + line.trim().replace(multilineRegex, '');
            multiline = multiline.trim().replace(multilineRegex, '') + line;

            lines[index] = multiline;
        }

        // get
        return lines.map(i => i.trim().replace(/^\d+\.\s+/, '')).join('\n');
    }

    /**
     * Summary. Get a flat list of all files under a directory including all sub-directories.
     */
    public static getFiles(directory: string): string[] {
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
        return list;
    }

    /**
     * Summary. Get a flat list of all files under a directory including all sub-directories by file names.
     */
    public static getFilesByFileNames(directory: string, arrayOfNames: string[]): string[] {
        // setup
        const list: string[] = [];
        const patternToExtractName = /(?!\\)\w+(?=.json)/;

        // local
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

        // get
        return list;
    }

    /**
     * Summary. Get a flat list of all files and folders sorted by folders > a-z > files a-z.
     */
    public static getFilesAndFolders(
        folderPath: string,
        excludeFolders: string[] = [],
        includeFiles: string[] = []): string[] {

        return this.resolveFilesAndFolders(folderPath, excludeFolders, includeFiles);
    }

    /**
     * Gets the first result from the RegExPMatchArray if exists, otherwise returns an empty string.
     * @param regexMatch The regular expressions match array.
     * @returns First element of the array.
    */
    public static getFirstMatch(regexMatch: RegExpMatchArray | null): string {
        return regexMatch ? regexMatch[0] : "";
    }

    /**
     * Summary. Gets RhinoServer configuration from the project manifest.
     * 
     * @returns RhinoServer endpoint.
     */
    public static getLogConfiguration(): LogConfiguration {
        // setup
        const manifest = this.resolveProjectManifest();
        const isManifest = !this.assertUndefinedOrNull(manifest);
        const isConfiguration = isManifest && !this.assertUndefinedOrNull(manifest.clientLogConfiguration);

        // get
        if (isConfiguration) {
            return manifest.clientLogConfiguration;
        }

        // default
        return {
            agentLogConfiguration: {
                enabled: true,
                interval: 3000
            },
            logLevel: "information",
            sourceOptions: {
                filter: "include",
                sources: []
            }
        };
    }

    /**
     * Summary. Gets the project manifest object or default if not found.
     * 
     * @returns Project manifest.
     */
    public static getManifest(): any {
        return this.resolveProjectManifest();
    }

    public static getOpenDocumentRange(): vscode.Range {
        // setup
        let document = vscode.window.activeTextEditor?.document;

        // not found
        if (!document) {
            let position = new vscode.Position(0, 0);
            return new vscode.Range(position, position);
        }

        // build
        let firstLine = document.lineAt(0);
        let lastLine = document.lineAt(document.lineCount - 1);

        // get
        return new vscode.Range(firstLine.range.start, lastLine.range.end);
    }

    public static getOpenDocumentText(): string {
        // setup
        let editor = vscode.window.activeTextEditor;

        // bad request
        if (!editor) {
            return '';
        }

        // get
        return editor.document.getText();
    }

    /**
     * Summary. Gets a pattern to identify all available plugins in a single text line.
     * 
     * @returns A pattern to identify all available plugins.
     */
    public static getPluginsPattern(manifests: any): string {
        // setup
        const patterns: string[] = [];

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

    public static getResource(resourceName: string) {
        return this.resolveResource(resourceName);
    }

    /**
     * Summary. Gets RhinoServer endpoint from the project manifest.
     * 
     * @returns RhinoServer endpoint.
     */
    public static getRhinoEndpoint(): string {
        return this.resolveRhinoEndpoint();
    }

    /**
     * Summary. Gets RhinoServer configuration from the project manifest.
     * 
     * @returns RhinoServer endpoint.
     */
    public static getRhinoServer(): ServerConfiguration {
        return this.resolveRhinoServer();
    }

    public static getSystemFolderPath(folder: 'Configurations' | 'Environments' | 'Models' | 'Plugins' | 'Resources' | 'Tests'): string {
        // setup
        let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined
            ? ''
            : workspace;
        let modelsFolder = path.join(workspace, folder);

        // get
        return modelsFolder.startsWith('\\')
            ? modelsFolder.substring(1, modelsFolder.length)
            : modelsFolder;
    }

    public static getSystemUtilityFolderPath(folder: 'build' | 'docs' | 'scripts'): string {
        // setup
        let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
        workspace = workspace === undefined
            ? ''
            : workspace;
        let pluginsFolder = path.join(workspace, '..', folder);

        // get
        return pluginsFolder.startsWith('\\')
            ? pluginsFolder.substring(1, pluginsFolder.length)
            : pluginsFolder;
    }

    public static getTimestamp(): string {
        // setup
        var date = new Date();
        var options: Intl.DateTimeFormatOptions = {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        };

        // get
        return `${date.toLocaleString('en-GB', options)}.${date.getMilliseconds()}`;
    }

    public static async getTmCreateObject(): Promise<TmLanguageCreateModel> {
        // setup
        const baseUrl = this.resolveRhinoEndpoint();
        const client = new RhinoClient(baseUrl);
        const configuration = Utilities.newConfigurationByManifest();

        // create new configuration (to get external plugins - if any)
        const id = (await client.configurations.newConfiguration(configuration))?.id;
        const isConfiguration = id !== null && id !== undefined && id !== '';

        // collect data (runs in parallel)
        const annotations = client.meta.getAnnotations();
        const assertions = client.meta.getAssertions();
        const attributes = client.meta.getAttributes();
        const locators = client.meta.getLocators();
        const macros = client.meta.getMacros();
        const models = client.meta.getModels();
        const operators = client.meta.getOperators();
        const plugins = isConfiguration ? client.meta.getPlugins(id) : client.meta.getPlugins();
        const verbs = client.meta.getVerbs();

        // invoke
        const createModel: TmLanguageCreateModel = {
            annotations: await annotations,
            assertions: await assertions,
            attributes: await attributes,
            locators: await locators,
            macros: await macros,
            models: await models,
            operators: await operators,
            plugins: await plugins,
            verbs: await verbs
        };

        // clean
        if (isConfiguration) {
            await client.configurations.deleteConfiguration(id);
        }

        // get
        return createModel;
    }

    public static getTreeItems(
        directory: string,
        excludeFolders: string[] = [],
        includeFiles: string[] = [],
        openItemCommand?: string): Thenable<TreeItem[]> {

        const getFromDirectory: any = (directoryPath: any, parent: TreeItem) => {
            // setup
            const folderPath = path.basename(directoryPath);
            const files = this.resolveFilesAndFolders(directoryPath, excludeFolders, includeFiles);

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
    public static newConfigurationByManifest(): any {
        // setup
        const manifest = this.resolveProjectManifest();

        // build
        let integration = !this.assertUndefinedOrNull(manifest.integration)
            ? manifest.integration
            : null;
        let attempts = !this.assertUndefinedOrNull(manifest.attempts)
            ? manifest.attempts
            : 1;
        let engineConfiguration = !this.assertUndefinedOrNull(manifest.engineConfiguration)
            ? manifest.engineConfiguration
            : {
                maxParallel: 1,
                elementSearchingTimeout: 15000,
                pageLoadTimeout: 60000
            };
        let reportConfiguration = !this.assertUndefinedOrNull(manifest.reportConfiguration)
            ? manifest.reportConfiguration
            : {
                reporters: [
                    "ReporterBasic"
                ],
                archive: false,
                localReport: true,
                addGravityData: true
            };
        let screenshotsConfiguration = !this.assertUndefinedOrNull(manifest.screenshotsConfiguration)
            ? manifest.screenshotsConfiguration
            : {
                keepOriginal: false,
                returnScreenshots: false,
                onExceptionOnly: false
            };
        let connectorConfiguration = !this.assertUndefinedOrNull(manifest.connectorConfiguration)
            ? manifest.connectorConfiguration
            : {
                connector: "ConnectorText"
            };
        let externalRepositories = !this.assertUndefinedOrNull(manifest.externalRepositories)
            ? manifest.externalRepositories
            : [];

        // get
        return {
            name: "VS Code - Standalone Test Run",
            testsRepository: [],
            attempts: attempts,
            integration: integration,
            driverParameters: manifest.driverParameters,
            authentication: manifest.authentication,
            screenshotsConfiguration: screenshotsConfiguration,
            reportConfiguration: reportConfiguration,
            engineConfiguration: engineConfiguration,
            connectorConfiguration: connectorConfiguration,
            externalRepositories: externalRepositories
        };
    }

    /**
     * Summary. Updates the TM Language configuration on runtime.
     * 
     * @returns Default project manifest.
     */
    public static updateTmConfiguration(context: vscode.ExtensionContext, tmConfiguration: string) {
        // setup
        let tmFile = path.join(context.extensionPath, 'rhino-tm-language.json');

        // build
        try {
            fs.writeFileSync(tmFile, tmConfiguration);
        } catch (error: any) {
            console.error(error);
        }
    }

    public static waitAsync(ms = 1000): Promise<any> {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    // Utilities
    private static assertUndefinedOrNull(obj: any): boolean {
        try {
            return obj === null || obj === undefined;
        } catch {
            return true;
        }
    }

    private static resolveFilesAndFolders(
        folderPath: string,
        excludeFolders: string[] = [],
        includeFiles: string[] = []): string[] {

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

    private static resolveRhinoEndpoint(): string {
        // setup
        let server = this.resolveRhinoServer();

        // get
        return server === null || server === undefined
            ? ''
            : server.schema + '://' + server.host + ':' + server.port;
    }

    private static resolveRhinoServer(): ServerConfiguration {
        // setup
        let projectManifest = this.resolveProjectManifest(false);

        // get
        return projectManifest?.rhinoServer;
    }

    private static resolveProjectManifest(getDefault: boolean = true): any {
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
            return JSON.parse(data);
        } catch (error: any) {
            // ignore errors
        }

        // default
        return getDefault ? this.newProjectManifest() : undefined;
    }

    private static newProjectManifest(): any {
        // setup
        const manifest = this.resolveResource('BaseManifest.json');

        // get
        return JSON.parse(manifest);
    }

    private static resolveResource(resourceName: string) {
        // get
        try {
            const directorypath = path.resolve(__dirname, '../..');
            const filePath = path.join(directorypath, 'resources', resourceName);

            return fs.readFileSync(filePath, 'utf8');
        } catch (error: any) {
            // ignore errors
        }

        // default
        return '';
    }
}
