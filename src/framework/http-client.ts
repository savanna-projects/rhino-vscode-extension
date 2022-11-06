/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://make.wordpress.org/core/handbook/best-practices/inline-documentation-standards/javascript/
 * https://nodejs.dev/learn/making-http-requests-with-nodejs
 */
import * as vscode from 'vscode';
import { HttpCommand } from './http-command';
import { URL } from "url";

/**
 * Provides a base class for sending HTTP requests and receiving HTTP responses
 * from a resource identified by a URI.
 */
export class HttpClient {
    // members
    private baseUrl: string;

    /**
     * Summary. Creates a new instance of an HttpClient.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Summary. Send an HTTP request as an asynchronous operation.
     * 
     * @param httpCommand The HttpCommand to send.
     */
    public invokeWebRequest(httpCommand: HttpCommand, callback: any) {
        // constants
        const http = require('http');

        // setup
        let options = this.getOptions(httpCommand);

        // build
        const request = http.request(options, (response: any) => {
            let data = '';
            response.on('data', (d: any) => data += this.onData(d));
            response.on('end', () => callback(data));
        });
        request.on('error', (error: any) => this.onError(error));

        // send
        let isBody = httpCommand.body !== null && httpCommand.body !== undefined;
        let isJson = 'Content-Type' in httpCommand.headers && httpCommand.headers['Content-Type'] === 'application/json';
        if (isBody && isJson) {
            request.write(JSON.stringify(httpCommand.body));
        }
        else if (isBody && !isJson) {
            request.write(httpCommand.body.toString());
        }
        request.end();
    }

    // Utilities
    private getOptions(httpCommand: HttpCommand) {
        // setup
        let url = new URL(this.baseUrl);
        let uriSegments = url.host.split(':');
        let host = uriSegments[0];
        let port = uriSegments.length === 2 ? Number.parseInt(uriSegments[1].toString()) : -1;

        // build
        let options: any = {
            host: host,
            path: httpCommand.command,
            method: httpCommand.method
        };
        if (port !== -1) {
            options['port'] = port;
        }
        if (httpCommand.headers) {
            options.headers = httpCommand.headers;
        }

        // get
        return options;
    }

    private onData(data: any) {
        // log
        console.debug('Invoke-WebRequest -> Processing');

        // get
        return data;
    }

    private onError(error: any) {
        vscode.window.setStatusBarMessage("$(testing-error-icon) " + error.message);
        if(`${error.message}`.match('ECONNREFUSED')) {
            return;
        }
        console.error(error);
    }
}
