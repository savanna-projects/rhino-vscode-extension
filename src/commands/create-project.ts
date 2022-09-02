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
            // TODO: implement switch from user
            if (true) {
                CreateProjectCommand.createSampleTest(folderUri);
                CreateProjectCommand.createSamplePlugin(folderUri);
                CreateProjectCommand.createSampleDocumentation(folderUri);
            }
            CreateProjectCommand.openFolder(folderUri);
        });
    }

    // take the input from openDialog
    private static createProjectFolder(userPath: any) {
        // setup path
        let path = this.getPath(userPath);

        // create folders
        let folders = [
            ph.join(path, 'docs'),
            ph.join(path, 'docs/Examples'),
            ph.join(path, 'build'),
            ph.join(path, 'scripts'),
            ph.join(path, 'src/Configurations'),
            ph.join(path, 'src/Environments'),
            ph.join(path, 'src/Models'),
            ph.join(path, 'src/Plugins'),
            ph.join(path, 'src/Plugins/Examples'),
            ph.join(path, 'src/Tests'),
            ph.join(path, 'src/Tests/Examples')
        ];
        for (const folder of folders) {
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
            }
        }
    }

    // take the input from openDialog
    private static createProjectManifest(userPath: any) {
        // setup
        let manifastObjt = Utilities.getDefaultProjectManifest();
        let content = JSON.stringify(manifastObjt, null, '\t');
        let path = ph.join(this.getPath(userPath), 'src');

        // write
        this.writeFile(path, 'Manifest.json', content);
    }

    private static createSampleTest(userPath: any) {
        // setup
        let body = [
            "/**┌─[ General Information ]──────────────────────────────────────────────────────────────────────",
            "/**│",
            "/**│ Connect & Invoke Test Case",
            "/**│ ==========================",
            "/**│ 1. Use [Ctrl]+[Shift]+[P] to bring up the commands pallete.",
            "/**│ 2. Type 'Rhino' to filter out all 'Rhino' commands.",
            "/**│ 3. Click on the command 'Rhino: Connect to Rhino, fetch Metadata & activate commands'.",
            "/**│ 4. Use [Ctrl]+[Shift]+[P] to bring up the commands pallete.",
            "/**│ 4. Type 'Rhino' to filter out all 'Rhino' commands.",
            "/**│ 5. Click on the command 'Rhino: Runs the automation test(s) from the currently open document'.",
            "/**│",
            "/**│ View Documentation",
            "/**│ ==================",
            "/**│ 1. Right-Click to bring up the context menu.",
            "/**│ 2. Click on 'Rhino: Show Documentation' command.",
            "/**│",
            "/**└──────────────────────────────────────────────────────────────────────────────────────────────",
            "/**",
            "[test-id]         EXAMPLE-01",
            "[test-scenario]   verify that results can be retrieved when searching by any keyword",
            "[test-categories] Sanity, Ui, Search",
            "[test-priority]   1 - critical",
            "[test-severity]   1 - critical",
            "[test-tolerance]  0%",
            "",
            "[test-actions]",
            "1. go to url {https://www.google.com}",
            "2. send keys {automation is fun} into {//input[@name='q']}",
            "3. click on {//ul[@role='listbox']/li}",
            "4. wait {1500}",
            "5. close browser",
            "",
            "[test-expected-results]",
            "[1] verify that {url} match {google}"
        ]
        let content = body.join('\n');
        let path = ph.join(this.getPath(userPath), 'src', 'Tests', 'Examples');

        // write
        this.writeFile(path, 'FindSomethingOnGoogle.rhino', content);
    }

    private static createSamplePlugin(userPath: any) {
        // setup
        let body = [
            "/**┌─[ General Information ]───────────────────────────────────────────────────────────────",
            "/**│",
            "/**│ Connect & Register Plugins",
            "/**│ ==========================",
            "/**│ 1. Use [Ctrl]+[Shift]+[P] to bring up the commands pallete.",
            "/**│ 2. Type 'Rhino' to filter out all 'Rhino' commands.",
            "/**│ 3. Click on the command 'Rhino: Connect to Rhino, fetch Metadata & activate commands'.",
            "/**│ 4. Use [Ctrl]+[Shift]+[P] to bring up the commands pallete.",
            "/**│ 4. Type 'Rhino' to filter out all 'Rhino' commands.",
            "/**│ 5. Click on the command 'Rhino: Register all the plugins under 'Plugins' folder'.",
            "/**│",
            "/**│ View Documentation",
            "/**│ ==================",
            "/**│ 1. Right-Click to bring up the context menu.",
            "/**│ 2. Click on 'Rhino: Show Documentation' command.",
            "/**│",
            "/**└───────────────────────────────────────────────────────────────────────────────────────",
            "/**",
            "[test-id]         GoogleSearch",
            "[test-scenario]   invoke the 'Search Google' routine",
            "",
            "[test-actions]",
            "/**",
            "/** Takes the 'onAttribute' field from the action as provided by the user and pass it into the plugin.",
            "1. send keys {@attribute} into {//input[@name='q']}",
            "2. click on {//ul[@role='listbox']/li}",
            "3. wait {1500}",
            "",
            "[test-expected-results]",
            "[1] verify that {attribute} of {//input[@name='q']} from {value} match {(?i)automation}",
            "",
            "",
            "/** You must provide at-least one example or you will not be able to register the plugin.",
            "[test-examples]",
            "| Example                    | Description                                            |",
            "|----------------------------|--------------------------------------------------------|",
            "| google search {Automation} | Finds results when searching for `Automation` keyword. |"
        ];
        let content = body.join('\n');
        let path = ph.join(this.getPath(userPath), 'src', 'Plugins', 'Examples');

        // write
        this.writeFile(path, 'GoogleSearch.rhino', content);
    }

    private static createSampleDocumentation(userPath: any) {
        // setup
        let bodyHome = [
            "# Table Of Content",
            "",
            "* **Plugins**",
            "  * [Examples](./Examples/Home.md)",
            "",
            "---",
            "",
            "* **Resources**",
            "  * [Rhino Tutorials](https://github.com/savanna-projects/rhino-docs)",
            "  * [Rhino on GitHub](https://github.com/savanna-projects)",
            "  * [Gravity on GitHub](https://github.com/gravity-api)",
        ];
        let bodyExamplesHome = [
            "# Examples",
            "",
            "[Home](../Home.md)",
            "* **Plugins**",
            "  * [Google Search](./GoogleSearch.md)"

        ];
        let bodyExample = [
            "# Google Search",
            "",
            "[Home](../Home.md) · [Table of Content](./Home.md)  ",
            "",
            "5 min · Unit · [Roei Sabag](https://www.linkedin.com/in/roei-sabag-247aa18/) · Level ★★★☆☆",
            "",
            "## Definition",
            "",
            "| <!-- -->            | <!-- -->                       |",
            "|---------------------|--------------------------------|",
            "| **Namespace:**      | `Plugins.Examples`             |",
            "| **File:**           | `GoogleSearch.rhino`           |",
            "| **Specifications:** | `/api/v3/plugins/GoogleSearch` |",
            "",
            "## Description",
            "",
            "Invokes the `GoogleSearch` routine.  ",
            "",
            "1. Type a keywork into the `Google Search` text-box.",
            "2. Click on the first `auto-complete` item.",
            "3. Wait for the results to be retrieved.",
            "",
            "## Prerequisites",
            "",
            "1. Stable internet connection.",
            "2. Access to `google.com` is not restricted by a proxy or firewall.",
            "",
            "## Nested Plugins",
            "",
            "None.",
            "",
            "## Scope",
            "",
            "1. Google Search Engine",
            "",
            "## Properties",
            "",
            "| Property    | Description                                        |",
            "|-------------|----------------------------------------------------|",
            "|`onAttribute`|The keyword to use when invoking the search routine.|",
            "",
            "## Parameters",
            "",
            "None.",
            "",
            "## Examples",
            "",
            "### Example No.1",
            "",
            "The following example demonstrate how to find results when searching for `Automation` keyword.  ",
            "",
            "```none",
            "google search {Automation}",
            "```"
        ];

        // set content
        let contentHome = bodyHome.join('\n');
        let pathHome = ph.join(this.getPath(userPath), 'docs');
        let pathExamples = ph.join(this.getPath(userPath), 'docs', 'Examples');
        let contentExamplesHome = bodyExamplesHome.join('\n');
        let contentExample = bodyExample.join('\n');

        // write
        this.writeFile(pathHome, 'Home.md', contentHome);
        this.writeFile(pathExamples, 'Home.md', contentExamplesHome);
        this.writeFile(pathExamples, 'GoogleSearch.md', contentExample);
    }

    private static createSampleScripts(userPath: any) {
    }

    private static createSamplePipeline(userPath: any) {
    }

    private static createSampleModel(userPath: any) {
    }

    // open a folder in VS Code workspace
    private static openFolder(userPath: any) {
        // build
        let path = this.getPath(userPath);
        path = os.platform() === 'win32'
            ? path.replaceAll('/', '\\').substring(0, path.length)
            : path;
        path = os.platform() === 'win32' && path.startsWith('/')
            ? path.substring(1, path.length)
            : path;

        // setup
        let uri = vscode.Uri.file(ph.join(path, 'src'));

        // invoke
        vscode.commands.executeCommand('vscode.openFolder', uri);
    }

    private static writeFile(path: string, fileName: string, content: string) {
        // write
        let manifestPath = ph.join(path, fileName);
        fs.writeFile(manifestPath, content, (err) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
            }
        });
    }

    private static getPath(userPath: any) {
        // setup path
        let path = '';
        if (userPath && userPath[0]) {
            path = userPath[0].path;
        }
        return os.platform() === 'win32' ? path.replaceAll('/', '\\').substring(1, path.length) : path;
    }
}
