# Rhino API - Language & Integration Extension

19/07/2021 - 45 minutes to read

> Important
>
> You can create a free Rhino Account on: <https://g-api.azurewebsites.net/identity/account/register>.
>  
> **We support open source** if you have an open source project, you can gain an unlimited FREE access to Rhino.
> Please send your open source project URL to rhino.api@gmail.com and your Rhino user name to get a sponsored account.

## In This Article

* [Commands](#commands)
* Connect to Rhino Server
* [Create a New Project](#create-project)
* Submit (Register) Test Case(s)
* Submit (Register) Plugin(s)
* Run Test
* Format Document

### [Basics](#basics)

* [Rhino API - Language & Integration Extension](#rhino-api---language--integration-extension)
  * [In This Article](#in-this-article)
    * [Basics](#basics)
    * [Advanced](#advanced)
  * [Commands](#commands)
    * [Create-Project](#create-project)
  * [Basics](#basics-1)
    * [Create New Project](#create-new-project)
    * [Manifest Overview](#manifest-overview)
    * [Create Your First Test Using Test Snippet](#create-your-first-test-using-test-snippet)
    * [Run Your Test](#run-your-test)
  * [See Also](#see-also)

### Advanced

* [Deploy Rhino Server](https://github.com/savanna-projects/rhino-agent/blob/master/docs/pages/GettingStarted/Deployment.md)
* Manifest in Depth

Rhino as an open source [W3C Web Driver](https://www.w3.org/TR/webdriver/) based client (much like selenium) for executing various automation scenarios. Rhino is based on [Gravity API Engine](https://github.com/gravity-api) which manipulates Selenium, Appium and other automation technologies in order to execute unified, single interface abstract automation.  

> Rhino is a full W3C Web Driver compliant which means it can connect out of the box to any other Web Driver either locally, cloud or remote.

## Commands

You can activate the command panel when pressing `CTRL+SHIFT+P` keys combination. This will open the **Command Palette** from which you select and run extensions commands.  

Once the **Command Palette** is open, type `Rhino:` into the **Command Palette** text-box to filter out Rhino only commands.

### Create-Project

The `Create-Project` command opens the `Select Folder` dialog, from which you can select the folder to create Rhino Project under.  

Upon creating a project, the following folders and files will be created:

1. `Configurations` a folder under which you can create configurations to run your tests with. Test can run on multiple configurations.
2. `Models` a folder under which you can create page objects map for a quick access to UI elements or reuseable data.
3. `Plugins` a folder under which you can create a resuable plugin for a quick access to common functionality.
4. `TestCases` a folder under which you can create test cases for integration into ALM or for a direct execution.
5. `manifest.json`, default project manifest.

## Basics

### Create New Project

When you first open Visual Studio Code, the start window appears, and from there, you can run the ```Create a new project``` command.  

1. Launch VS Code.
2. Open the **Command Palette** (`CTRL+SHIFT+P`).
3. Type 'Rhino' to find the ```Rhino: Creates a New Rhino Project``` command.  

![image 1.1](https://raw.githubusercontent.com/savanna-projects/rhino-vscode-extension/master/images/create_new_project_1.png "Command Palette")  

1. From the **Select Folder** dialog, select the folder where you want to place Rhino project.
2. Click on **Select Folder** button.  

> Tip  
> You can create a new folder directly from the **Select Folder** dialog and select that new folder to host Rhino project files.
>
> Rhino Project contains several default folders for the different Rhino components and a ```Manifest.json``` file.

### Manifest Overview

Every project has a JSON-formatted manifest file, named ```manifest.json```, that provides important information. The following code shows the supported manifest fields for Rhino Project.

> Tip
> A default manifest is created when you create a project.

```js
{
    "rhinoServer": {
        "schema": "http",
        "host": "localhost",
        "port": "9000"
    },
    "connectorConfiguration": {
        "collection": "<application url e.g. https://myjira.atlassian.net>",
        "connector": "<connector type>",
        "password": "<application password>",
        "project": "<application project>",
        "userName": "<application user name>"
    },
    "authentication": {
        "username": "<rhino user>",
        "password": "<rhino password>"
    },
    "driverParameters": [
        {
            "driver": "ChromeDriver",
            "driverBinaries": "."
        }
    ]
}
```

|Field                 |Type  |Description                                                                                               |
|----------------------|------|----------------------------------------------------------------------------------------------------------|
|rhinoServer           |object|The endpoint of Rhino server. This is the server where tests are sent when executing.                     |
|connectorConfiguration|object|Provides the configuration for integrating Rhino with 3rd party project managements such as Jira or Azure.|
|driverParameters      |array |A collection of driver names their location.                                                              |

### Create Your First Test Using Test Snippet

The easiest way to create a spec file, is to use the built in snippet. Please follow these steps to create your first spec file:  

1. Right click on ```TestCases``` folder.
2. Select ```New File```.  

![image 2.1](https://raw.githubusercontent.com/savanna-projects/rhino-vscode-extension/master/images/create_test_1.png "Context Menu")  

1. Name your file ```myFirstTestCase.rhino```.  

![image 2.2](https://raw.githubusercontent.com/savanna-projects/rhino-vscode-extension/master/images/create_test_2.png "Rhino Spec File")  

1. Open command palette by pressing ```CRTL+SHIFT+P```.
2. Type ```Rhino``` to find Rhino Commands.
3. Select and run the command ```Rhino: Connect to Rhino, fetch Metadata & activate commands```.  

![image 2.3](https://raw.githubusercontent.com/savanna-projects/rhino-vscode-extension/master/images/create_test_3.png "Command Palette")

1. If Rhino Server is up and running and accessible in the address provided in the project manifest.json, the following confirmation will be displayed.  

![image 2.4](https://raw.githubusercontent.com/savanna-projects/rhino-vscode-extension/master/images/create_test_4.png "Connection Confirmation")  

1. Start type ```rhino``` in the test file you have created on step no.#3, the ```rhinotest``` snippet is now visible and can be selected.  

![image 2.5](https://raw.githubusercontent.com/savanna-projects/rhino-vscode-extension/master/images/create_test_5.png "Rhino Snippet")  

1. Once selected, a basic Rhino Spec will be generated and displayed.
2. Use the ```TAB``` key to cycle the different argument and parameters in the spec.
3. Save your file.  

![image 2.6](https://raw.githubusercontent.com/savanna-projects/rhino-vscode-extension/master/images/create_test_7.png "Rhino Snippet")

### Run Your Test

Rhino can run the test spec directly from the VS Code document, by executing the invoke command. Please follow these steps to run your test:  

1. Open command palette by pressing ```CRTL+SHIFT+P```.
2. Type ```Rhino``` to find Rhino Commands.
3. Select and run the command ```Rhino: Runs the automation test(s) from the currently open document```.
4. A progress indication will show in VS Code status bar.  

![image 3.1](https://raw.githubusercontent.com/savanna-projects/rhino-vscode-extension/master/images/run_test_1.png "Command Palette")  

1. When test is complete, open your browser and navigate to <http://localhost:9000/reports>.
2. Select your run from the runs list to see your run report.  

![image 3.1](https://raw.githubusercontent.com/savanna-projects/rhino-vscode-extension/master/images/run_test_2.png "Rhino Report")

## See Also

* [Rhino Agent - Documentation](https://github.com/savanna-projects/rhino-agent/blob/master/docs/pages/Home.md)
* [Deploy Rhino Server - As Process](https://github.com/savanna-projects/rhino-agent/blob/master/docs/pages/GettingStarted/Deployment.md)
* [Rhino - Configuration](https://github.com/savanna-projects/rhino-agent/blob/master/docs/pages/ApiReference/Configurations.md#get-configuration)
