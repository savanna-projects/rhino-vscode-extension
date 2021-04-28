import fs = require('fs');
import os = require('os');

import * as vscode from 'vscode';
import * as ph from 'path';
import path = require('path');

export class Utilities {
    public static replaceAll(str: string, oldValue: string, newValue: string) {
        // iterate
        while (str.includes(oldValue)) {
            str = str.replace(oldValue, newValue);
        }
    
        // get
        return str;
    }

    // take the input from openDialog
    public static createProjectFolder(userPath: any) {
        // setup path
        var path = "";
        if(userPath && userPath[0]) {
            path = userPath[0].path;
        }
        path = os.platform() === "win32" ? this.replaceAll(path, "/", "\\").substr(1, path.length - 1) : path;

        // create folders
        var folders = [
            ph.join(path, "Configurations"),
            ph.join(path, "Models"),
            ph.join(path, "Plugins"),
            ph.join(path, "TestCases")
        ];
        for (let i = 0; i < folders.length; i++) {
            if (!fs.existsSync(folders[i])) {
                fs.mkdirSync(folders[i], { recursive: true });
            }
        }
    }

    // take the input from openDialog
    public static createProjectManifest(userPath: any) {
        var manifastObjt = this.getDefaultProjectManifest();
        var manifastData = JSON.stringify(manifastObjt, null, '\t');
        
        // setup path
        var path = "";
        if(userPath && userPath[0]) {
            path = userPath[0].path;
        }
        path = os.platform() === "win32" ? this.replaceAll(path, "/", "\\").substr(1, path.length - 1) : path;

        // create manifest
        var manifestPath = ph.join(path, "manifest.json");
        fs.writeFile(manifestPath, manifastData, (err) => {
            if(err) {
                vscode.window.showErrorMessage("Manifest file was not created " + err);
            }
        });
    }

    // execute a test case based on manifest string
    public static execute(test: string, manifest: any) {
        // setup
        var configuration = {
            testsRepository: [
                test
            ],
            driverParameters: manifest.drivers,
            connectorConfiguration: manifest.connector
        };
        var requestBody = JSON.stringify(configuration);

        // post
        this.post(manifest, "/api/v3/rhino/execute", requestBody);
    }

    public static isNotDefinedOrNullOrEmpty(object: any, propertyName: string) {
        if(object[propertyName] === 'undefined') {
            return true;
        }
        if(object[propertyName] === null) {
            return true;
        }
        if(typeof object[propertyName] === 'string' && !object[propertyName].length) {
            return true;
        }
        return false;
    }

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
        return this.getDefaultProjectManifest();
    }

    public static getActionManifest(rhinoEndpoint: string, action: string) {
        // setup
        const http = require('http');
        const options = {
            host: rhinoEndpoint,
            port: 9000,
            path: '/api/v3/meta/plugins/' + action,
            method: 'GET'
        };

        // build
        const request = http.request(options, (response: any) => {
            let data = '';
            
            response.on('data', (chunk: any) => {
                data += chunk;
            });

            response.on('end', () => {
                return JSON.parse(data);
            });
        });

        request.on('error', (error: any) => {
            console.error(error);
        });

        // get
        request.write();
        var r = request.end();
        return r;
    }

    public static getPluginsPattern(plugins: any[]): string {
        // setup
        var patterns: string[] = [];
        
        // build
        for (var i = 0; i < plugins.length; i++) {
            patterns.push("(?<!['])" + plugins[i].literal);
            
            if(!plugins[i].hasOwnProperty('aliases')) {
                continue;
            }
            
            for (var j = 0; j < plugins[i].aliases.length; j++) {
                patterns.push(plugins[i].aliases[j]);
            }
        }
        
        // get
        return patterns.join('|');
    }

    private static post(manifest: any, command: string, requestBody: string) {
        // setup
        const https = require('http');        
        const options = {
            host: manifest.rhinoServer.host,
            port: manifest.rhinoServer.port,
            path: command,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': requestBody.length
            }
        };
        const req = https.request(options, (res: any) => {
            let data = '';
            console.log('Status Code:', res.statusCode);
            res.on('data', (chunk: any) => {
                data += chunk;
            });     
            res.on('end', () => {
                console.log('Body: ', JSON.parse(data));
            });       
        })
        .on("error", (err: any) => {
            console.log("Error: ", err.message);
        });
        
        // post
        req.write(requestBody);
        req.end();
    }

    private static getDefaultProjectManifest() {
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
            "drivers": [
                {
                    driver: "ChromeDriver",
                    driverBinaries: "."
                }
            ]
        };
    }
}