import fs = require('fs');
import os = require('os');

import * as vscode from 'vscode';
import * as ph from 'path';

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
        var manifastObjt = {
            "rhinoServer": {
                "schema": "http",
                "host": "localhost",
                "port": "5000"
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
}