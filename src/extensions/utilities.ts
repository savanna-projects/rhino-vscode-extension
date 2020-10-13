import fs = require('fs');
import os = require('os');

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

        // create folders
        var folders = [
            path + "/Configurations",
            path + "/Models",
            path + "/Plugins",
            path + "/TestCases"
        ];
        for (let i = 0; i < folders.length; i++) {
            var onPath = os.platform() === 'win32'
                ? Utilities.replaceAll(folders[i], "/", "\\").substr(1, folders[i].length - 1)
                : folders[i].replace(":", "");

            if (!fs.existsSync(onPath)) {
                fs.mkdirSync(onPath, { recursive: true });
            }
        }        
    }

    // take the input from openDialog
    public static createProjectManifest(userPath: any) {
        var manifastObjt = {
            "rhinoServer": "http://localhost:5001"
        };
        var manifastData = JSON.stringify(manifastObjt, null, '\t');
        
        // setup path
        var path = "";
        if(userPath && userPath[0]) {
            path = userPath[0].path;
        }

        // create manifest
        path = os.platform() === 'win32'
            ? Utilities.replaceAll(path, "/", "\\").substr(1, path.length - 1)
            : path.replace(":", "");
        fs.writeFile(path + "/manifest.json", manifastData, (err) => {
            if(err) {
                console.log("Manifest file was not created " + err);
            }
        });
    }    
}