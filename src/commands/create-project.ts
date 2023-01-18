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
            CreateProjectCommand.createSampleTests(folderUri);
            CreateProjectCommand.createSamplePlugins(folderUri);
            CreateProjectCommand.createSampleDocumentation(folderUri);
            CreateProjectCommand.createSampleScripts(folderUri);
            CreateProjectCommand.createSamplePipelines(folderUri);
            CreateProjectCommand.createSampleModels(folderUri);
            CreateProjectCommand.createSampleEnvironment(folderUri);
            CreateProjectCommand.createSampleResource(folderUri);
            // user switch ends
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
            ph.join(path, 'build/Examples'),
            ph.join(path, 'scripts'),
            ph.join(path, 'scripts/Examples'),
            ph.join(path, 'src/Configurations'),
            ph.join(path, 'src/Environments'),
            ph.join(path, 'src/Models'),
            ph.join(path, 'src/Models/Json'),
            ph.join(path, 'src/Models/Markdown'),
            ph.join(path, 'src/Plugins'),
            ph.join(path, 'src/Plugins/Examples'),
            ph.join(path, 'src/Tests'),
            ph.join(path, 'src/Tests/Examples'),
            ph.join(path, 'src/Resources'),
            ph.join(path, 'src/Resources/Examples')
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
        let manifestObj = Utilities.getDefaultProjectManifest();
        let content = JSON.stringify(manifestObj, null, '\t');
        let path = ph.join(this.getPath(userPath), 'src');

        // write
        this.writeFile(path, 'Manifest.json', content);
    }

    private static createSampleTests(userPath: any) {
        // setup
        let bodyBasic = [
            "/**┌─[ General Information ]──────────────────────────────────────────────────────────────────────",
            "/**│",
            "/**│ Connect & Invoke Test Case",
            "/**│ ==========================",
            "/**│ 1. Use [Ctrl]+[Shift]+[P] to bring up the commands palette.",
            "/**│ 2. Type 'Rhino' to filter out all 'Rhino' commands.",
            "/**│ 3. Click on the command 'Rhino: Connect to Rhino, fetch Metadata & activate commands'.",
            "/**│ 4. Use [Ctrl]+[Shift]+[P] to bring up the commands palette.",
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
        ];
        let bodyWithModels = [
            "/**┌─[ General Information ]──────────────────────────────────────────────────────────────────────",
            "/**│",
            "/**│ Connect & Invoke Test Case",
            "/**│ ==========================",
            "/**│ 1. Use [Ctrl]+[Shift]+[P] to bring up the commands palette.",
            "/**│ 2. Type 'Rhino' to filter out all 'Rhino' commands.",
            "/**│ 3. Click on the command 'Rhino: Connect to Rhino, fetch Metadata & activate commands'.",
            "/**│ 4. Use [Ctrl]+[Shift]+[P] to bring up the commands palette.",
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
            "[test-id]         EXAMPLE-02",
            "[test-scenario]   verify that results can be retrieved when searching by any keyword",
            "[test-categories] Sanity, Ui, Search",
            "[test-priority]   1 - critical",
            "[test-severity]   1 - critical",
            "[test-tolerance]  0%",
            "",
            "[test-actions]",
            "1. go to url {https://www.google.com}",
            "2. send keys {automation is fun} into {search text-box}",
            "3. click on the first {auto-complete item}",
            "4. wait {1500}",
            "5. close browser",
            "",
            "[test-expected-results]",
            "[1] verify that {url} match {google}"
        ];
        let bodyWithEnvironment = [
            "/**┌─[ General Information ]──────────────────────────────────────────────────────────────────────",
            "/**│",
            "/**│ Connect & Invoke Test Case",
            "/**│ ==========================",
            "/**│ 1. Use [Ctrl]+[Shift]+[P] to bring up the commands palette.",
            "/**│ 2. Type 'Rhino' to filter out all 'Rhino' commands.",
            "/**│ 3. Click on the command 'Rhino: Connect to Rhino, fetch Metadata & activate commands'.",
            "/**│ 4. Use [Ctrl]+[Shift]+[P] to bring up the commands palette.",
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
            "[test-id]         EXAMPLE-03",
            "[test-scenario]   verify that results can be retrieved when searching by any keyword",
            "[test-categories] Sanity, Ui, Search",
            "[test-priority]   1 - critical",
            "[test-severity]   1 - critical",
            "[test-tolerance]  0%",
            "",
            "[test-actions]",
            "1. go to url {{$getparam --name:ApplicationUrl}}",
            "2. send keys {automation is fun} into {search text-box}",
            "3. click on the first {auto-complete item}",
            "4. wait {1500}",
            "5. close browser",
            "",
            "[test-expected-results]",
            "[1] verify that {url} match {google}"
        ];
        let bodyWithPlugins = [
            "/**┌─[ General Information ]──────────────────────────────────────────────────────────────────────",
            "/**│",
            "/**│ Connect & Invoke Test Case",
            "/**│ ==========================",
            "/**│ 1. Use [Ctrl]+[Shift]+[P] to bring up the commands palette.",
            "/**│ 2. Type 'Rhino' to filter out all 'Rhino' commands.",
            "/**│ 3. Click on the command 'Rhino: Connect to Rhino, fetch Metadata & activate commands'.",
            "/**│ 4. Use [Ctrl]+[Shift]+[P] to bring up the commands palette.",
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
            "[test-id]         EXAMPLE-04",
            "[test-scenario]   verify that results can be retrieved when searching by any keyword",
            "[test-categories] Sanity, Ui, Search",
            "[test-priority]   1 - critical",
            "[test-severity]   1 - critical",
            "[test-tolerance]  0%",
            "",
            "[test-actions]",
            "1. go to url {{$getparam --name:ApplicationUrl}}",
            "2. google search {automation is fun}",
            "3. close browser"
        ];
        let contentBasic = bodyBasic.join('\n');
        let contentWithModels = bodyWithModels.join('\n');
        let contentWithEnvironment = bodyWithEnvironment.join('\n');
        let contentWithPlugins = bodyWithPlugins.join('\n');
        let path = ph.join(this.getPath(userPath), 'src', 'Tests', 'Examples');

        // write
        this.writeFile(path, 'FindSomethingOnGoogle.rhino', contentBasic);
        this.writeFile(path, 'FindSomethingOnGoogleWithModels.rhino', contentWithModels);
        this.writeFile(path, 'FindSomethingOnGoogleWithEnvironment.rhino', contentWithEnvironment);
        this.writeFile(path, 'FindSomethingOnGoogleWithPlugins.rhino', contentWithPlugins);
    }

    private static createSamplePlugins(userPath: any) {
        // setup
        let body = [
            "/**┌─[ General Information ]───────────────────────────────────────────────────────────────",
            "/**│",
            "/**│ Connect & Register Plugins",
            "/**│ ==========================",
            "/**│ 1. Use [Ctrl]+[Shift]+[P] to bring up the commands palette.",
            "/**│ 2. Type 'Rhino' to filter out all 'Rhino' commands.",
            "/**│ 3. Click on the command 'Rhino: Connect to Rhino, fetch Metadata & activate commands'.",
            "/**│ 4. Use [Ctrl]+[Shift]+[P] to bring up the commands palette.",
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
            "/** Takes the 'argument' field from the action as provided by the user and pass it into the plugin.",
            "1. send keys {@argument} into {//input[@name='q']}",
            "2. click on {//ul[@role='listbox']/li}",
            "3. wait {1500}",
            "",
            "[test-expected-results]",
            "[3] verify that {count} of {//div[@class='g']} is greater than {0}",
            "",
            "[test-examples]",
            "/**",
            "/** You must provide at-least one example or you will not be able to register the plugin.",
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
            "1. Type a keyword into the `Google Search` text-box.",
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
        // setup
        let body = [
            "#┌[General Information ───────────────────────────────────────────────────",
            "#│",
            "#│ 1. To run with non-windows OS, please install Powershell Core.",
            "#│ 2. The script can be used on CI/CD as script file or inline script.",
            "#│ 3. User the Command Line parameters to control the invocation behavior.",
            "#│",
            "#└────────────────────────────────────────────────────────────────────────",
            "#",
            "# Setup: User Parameters",
            "param(",
            "    [string] $HttpProtocol    = $null,",
            "    [string] $RhinoServer     = $null,",
            "    [int]    $RhinoPort       = 0,",
            "    [string] $TestsRepository = $null,",
            "    [string] $RhinoUsername   = $null,",
            "    [string] $RhinoPassword   = $null,",
            "    [string] $DriverBinaries  = $null",
            ")",
            "#",
            "# Setup: Rhino Endpoints Default",
            "$_httpProtocol   = \"http\"",
            "$_rhinoServer    = \"localhost\"",
            "$_rhinoPort      = 9000",
            "$_driverBinaries = \".\"",
            "#",
            "# Setup: Tests Location (absolute/relative file or folder path)",
            "$projectRoot      = [System.IO.Directory]::GetParent($PSScriptRoot)",
            "$_testsRepository = [System.IO.Path]::Combine($projectRoot, 'src', 'Tests', 'Examples', 'FindSomethingOnGoogle.rhino')",
            "#",
            "# Setup: Rhino Credentials",
            "$rhinoUsername = \"<rhinoUsername>\"",
            "$rhinoPassword = \"<rhinoPassword>\"",
            "#",
            "# Build: User Parameters Value",
            "$HttpProtocol    = if (($null -eq $HttpProtocol)    -or ($HttpProtocol    -eq [string]::Empty)) { $_httpProtocol }    else { $HttpProtocol }",
            "$RhinoServer     = if (($null -eq $RhinoServer)     -or ($RhinoServer     -eq [string]::Empty)) { $_rhinoServer }     else { $RhinoServer }",
            "$RhinoPort       = if (($null -eq $RhinoPort)       -or ($RhinoPort       -eq 0))               { $_rhinoPort }       else { $RhinoPort }",
            "$TestsRepository = if (($null -eq $TestsRepository) -or ($TestsRepository -eq [string]::Empty)) { $_testsRepository } else { $TestsRepository }",
            "$RhinoUsername   = if (($null -eq $RhinoUsername)   -or ($RhinoUsername   -eq [string]::Empty)) { $_rhinoUsername }   else { $RhinoUsername }",
            "$RhinoPassword   = if (($null -eq $RhinoPassword)   -or ($RhinoPassword   -eq [string]::Empty)) { $_rhinoPassword }   else { $RhinoPassword }",
            "$DriverBinaries  = if (($null -eq $DriverBinaries)  -or ($DriverBinaries  -eq [string]::Empty)) { $_driverBinaries }  else { $DriverBinaries }",
            "#",
            "# Build: Invocation Values",
            "$rhinoAction   = \"rhino/configurations/invoke\"",
            "$rhinoEndpoint = \"$($HttpProtocol)://$($RhinoServer):$($RhinoPort)/api/v3/$($rhinoAction)\"",
            "#",
            "# Build: Rhino Configuration Basic (the request body) - must be camelCase convention",
            "$configuration = @{",
            "    connectorConfiguration = @{",
            "        connector = \"ConnectorText\"",
            "    }",
            "    authentication = @{",
            "        username = $RhinoUsername",
            "        password = $RhinoPassword",
            "    }",
            "    driverParameters = @(",
            "        @{",
            "            driver         = \"ChromeDriver\"",
            "            driverBinaries = $DriverBinaries",
            "        }",
            "    )",
            "    engineConfiguration = @{",
            "        maxParallel             = 1",
            "        elementSearchingTimeout = 15000",
            "        pageLoadTimeout         = 60000",
            "    }",
            "    testsRepository = @(",
            "        $TestsRepository",
            "    )",
            "};",
            "#",
            "# Invoke Configuration",
            "Write-Host \"Invoking configuration on $($rhinoEndpoint), please wait...\"",
            "$body = ConvertTo-Json $configuration",
            "$response = Invoke-WebRequest `",
            "    -Method Post `",
            "    -ContentType \"application/json\" `",
            "    -Uri $rhinoEndpoint `",
            "    -Body $body",
            "#",
            "# Error From the Server",
            "if ($response.StatusCode -ge 400) {",
            "    Write-Error $response",
            "    exit 10",
            "}",
            "#",
            "# Assert That All Tests Passed",
            "$responseObj = ($response.Content | ConvertFrom-Json)",
            "if ($responseObj.actual) {",
            "    Write-Host \"All {$($responseObj.testCases.Length)} test(s) passed\"",
            "    exit 0",
            "}",
            "exit 10"
        ];

        // set content
        let contentHome = body.join('\n');
        let path = ph.join(this.getPath(userPath), 'scripts', 'Examples');

        // write
        this.writeFile(path, 'RunExamplesStandalone.ps1', contentHome);
    }

    private static createSamplePipelines(userPath: any) {
        // setup
        let bodyGitHub = [
            "# Basic GitHub action pipeline to invoke the automation using a script.",
            "name: Invoke Automation Testing",
            "on: push",
            "jobs:",
            "  build:",
            "    runs-on: ubuntu-latest",
            "    steps:",
            "      - name: Checkout Automation Repository ",
            "        uses: actions/checkout@v2",
            "      - run: |",
            "          ./scripts/RunExamplesStandalone.ps1",
            "        shell: pwsh",
        ];
        let bodyAzure = [
            "# Basic GitHub action pipeline to invoke the automation using a script.",
            "trigger:",
            "- master",
            "",
            "pool:",
            "  vmImage: ubuntu-latest",
            "",
            "stages:",
            "  - stage: InvokeAutomation",
            "    jobs:",
            "    - job: 'InvokeAutomationScript'",
            "      displayName: 'Invoke Automation Script'",
            "      steps:",
            "      - task: PowerShell@2",
            "        displayName: 'Invoke Powershell Script'",
            "        inputs:",
            "          filePath: './scripts/RunExamplesStandalone.ps1'",
            "          failOnStderr: true",
            "          pwsh: true"
        ];

        // set content
        let contentGitHub = bodyGitHub.join('\n');
        let contentAzure = bodyAzure.join('\n');
        let path = ph.join(this.getPath(userPath), 'build', 'Examples');

        // write
        this.writeFile(path, 'GitActions.yaml', contentGitHub);
        this.writeFile(path, 'AzurePipeline.yaml', contentAzure);
    }

    private static createSampleModels(userPath: any) {
        // setup
        let bodyMarkdown = [
            "[test-models] Google Search Home Page (Markdown)",
            "| Name               | Value                    | Type  | Comment                                      |",
            "|--------------------|--------------------------|-------|----------------------------------------------|",
            "| search text-box    | //input[@name='q']       | xpath | Finds the Google search text-box.            |",
            "| auto-complete item | //ul[@role='listbox']/li | xpath | Finds the first auto-complete item.          |",
            "| search results     | //div[@class='g']        | xpath | Finds all search results under results page. |",
        ];
        let bodyJson = {
            "name": "Google Search Home Page (JSON)",
            "entries": [
                {
                    "name": "search text-box",
                    "value": "//input[@name='q']",
                    "type": "xpath",
                    "comment": "Finds the Google search text-box."
                },
                {
                    "name": "auto-complete item",
                    "value": "//ul[@role='listbox']/li",
                    "type": "xpath",
                    "comment": "Finds the first auto-complete item."
                },
                {
                    "name": "search results",
                    "value": "//div[@class='g']",
                    "type": "xpath",
                    "comment": "Finds all search results under results page."
                }
            ]
        };

        // set content
        let contentMarkdown = bodyMarkdown.join('\n');
        let contentJson = JSON.stringify(bodyJson, null, 4);
        let pathMarkdown = ph.join(this.getPath(userPath), 'src', 'Models', 'Markdown');
        let pathJson = ph.join(this.getPath(userPath), 'src', 'Models', 'Json');

        // write
        this.writeFile(pathMarkdown, 'GoogleSearchHomePage.rmodel', contentMarkdown);
        this.writeFile(pathJson, 'GoogleSearchHomePage.json', contentJson);
    }

    private static createSampleEnvironment(userPath: any) {
        // setup
        let body = `{
            "ApplicationUrl": "https://www.google.com"
        }`;

        // set content
        let content = JSON.stringify(JSON.parse(body), null, 4);
        let path = ph.join(this.getPath(userPath), 'src', 'Environments');

        // write
        this.writeFile(path, 'GoogleSearchEnvironment.json', content);
    }

    private static createSampleResource(userPath: any) {
        // setup
        let content = `Demo Resource File.`;

        // set content
        let path = ph.join(this.getPath(userPath), 'src', 'Resources', 'Examples');

        // write
        this.writeFile(path, 'DemoResource.txt', content);
    }

    // open a folder in VS Code workspace
    private static openFolder(userPath: any) {
        // build
        let path = this.getPath(userPath);
        path = os.platform() === 'win32' && path.startsWith('/')
            ? path.substring(1, path.length)
            : path;
        path = os.platform() === 'win32'
            ? path.replaceAll('/', '\\').substring(0, path.length)
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
