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
import { ClientRequest, IncomingMessage, request} from 'http';

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
    isFunction(functionToCheck: any): boolean {
        // Possibly won't work for async functions - needs further testing
        return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';

        // return functionToCheck instanceof Function;
    }
    /**
     * Summary. Send an HTTP request as an asynchronous operation.
     * 
     * @param httpCommand The HttpCommand to send.
     */
    public invokeWebRequest(httpCommand: HttpCommand, callback: any) {
        // constants
        // const http = require('http');
        console.debug(`${new Date().getTime()} - START Invoke-WebRequest -> ${httpCommand.method} ${httpCommand.command}`);
        // setup
        let options = this.getOptions(httpCommand);
        // build
        const clientRequest = new ClientRequest(options, (response: IncomingMessage) => {
            let data = '';
            response.on('data', (d: any) => data += this.onData(d));
            response.on('end', () => {
                console.debug(`${new Date().getTime()} - END  Invoke-WebRequest -> ${httpCommand.method} ${httpCommand.command}`);
                if (!response?.statusCode || response.statusCode < 200 || response.statusCode > 299) {
                    var errorMessage = JSON.parse(data);
                    var error = new Error();
                    error.message = `${errorMessage?.statusCode} - ${errorMessage?.message}`;
                    this.onError(error);
                }
                return callback(data);
            });
        });
        clientRequest.on('error', (error: any) => this.onError(error));

        // send
        let isBody = httpCommand.body !== null && httpCommand.body !== undefined;
        let isJson = 'Content-Type' in httpCommand.headers && httpCommand.headers['Content-Type'] === 'application/json';
        if (isBody && isJson) {
            clientRequest.write(JSON.stringify(httpCommand.body));
        }
        else if (isBody && !isJson) {
            clientRequest.write(httpCommand.body.toString());
        }
        
        clientRequest.end(); 
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
        console.log(`${new Date().getTime()} - Invoke-WebRequest -> Processing data`);
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

