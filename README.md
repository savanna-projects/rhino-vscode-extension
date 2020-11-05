# Rhino API - Language & Integration Extension
10/12/2020 - 0 minutes to read

## In This Article
### Basics
* [Create New Project](#create-new-project)
* [Manifest Overview](#manifest-overview)
* Create Rhino Spec File
* Create Your First Test, Using Test Snippet
* Run Your Test

### Advanced
* Deploy Rhino Server
* Manifest in Depth
* Connect to Application Lifecycle Management
    - Create Test
    - Import Test
    - Update Test

### References
* VS Code Content
    - Rhino Snippets
    - Rhino Commands  

Rhino as an open source [W3C Web Driver](https://www.w3.org/TR/webdriver/) based client (much like selenium) for executing various automation scenarios. Rhino is based on [Gravity API Engine](https://github.com/gravity-api) which manipulates Selnium, Appium and other automation technologies in order to execute unified, single interface abstract automation.  

> Rhino is a full W3C Web Driver compliant which means it can connect out of the box to any other Web Driver either locally, cloud or remote.

## Basics
### Create New Project
When you first open Visual Studio Code, the start window appears, and from there, you can run the ```Create a new project``` command.  

1. Launch VS Code.
2. Open the **Command Palette** (```Ctrl+Shift+P```).
3. Type 'shell command' to find the Shell Command: Install 'code' command in PATH command.  

[![image 1.1](https://github.com/savanna-projects/rhino-vscode-extension/tree/master/images/create_new_project_1.png "Command Palette")]  

4. From the **Select Folder** dialog, select the folder where you want to place Rhino project.
5. Click on **Select Folder** button.  

> Tip  
> You can create a new folder directly from the **Select Folder** dialog and select that new folder to host Rhino project files.  

[![image 1.2](https://github.com/savanna-projects/rhino-vscode-extension/tree/master/images/create_new_project_2.png "Select Folder Dialog")]  

6. Click on ```File > Open Folder...```.  

[![image 1.3](https://github.com/savanna-projects/rhino-vscode-extension/tree/master/images/create_new_project_3.png "Select Folder Dialog")]  

7. Select the folder under which you have created Rhino project.
8. Click on **Select Folder** button.  

[![image 1.3](https://github.com/savanna-projects/rhino-vscode-extension/tree/master/images/create_new_project_3.png "Select Folder Dialog")]  

> Rhino Project contains several default folders for the different Rhino components and a ```Manifest.json``` file.

### Manifest Overview
Every project has a JSON-formatted manifest file, named ```Manifest.json```, that provides important information. The following code shows the supported manifest fields for Rhino Project.

```js
{
  "rhinoServer": "http://localhost:5001",
  "connectorConfiguration": {
    "bugManager": false,
    "collection": null,
    "connector": "connector_text",
    "password": null,
    "project": null,
    "userName": null
  },
  "driverParameters": [
    {
      "driver": "ChromeDriver",
      "driverBinaries": "<folder where the web drivers are>"
    }
  ]
}
```

|Field                 |Type  |Description                                                                                               |
|----------------------|------|----------------------------------------------------------------------------------------------------------|
|rhinoServer           |string|The endpoint of Rhino server. This is the server where tests are sent when executing.                     |
|connectorConfiguration|object|Provides the configuration for integrating Rhino with 3rd party project managements such as Jira or Azure.|
|driverParameters      |array |A collection of driver names thier location.                                                              |

## See Also
* [Deploy Rhino Server - As Process](https://github.com/savanna-projects/rhino-agent/blob/master/docs/pages/GettingStarted/Deployment.md)
* [Rhino Agent - Novice to Ninja](https://github.com/savanna-projects/rhino-agent/blob/master/docs/pages/Home.md)