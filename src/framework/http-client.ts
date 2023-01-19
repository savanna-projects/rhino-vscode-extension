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
import { IncomingMessage, request, RequestOptions } from 'http';
import { Utilities } from '../extensions/utilities';
import { log } from 'console';

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
        log(`${Utilities.getTimestamp()} - START Invoke-WebRequest -> ${httpCommand.method} ${httpCommand.command}`);

        // setup
        let options = this.getOptions(httpCommand);

        // build
        const clientRequest = request(options, (response: IncomingMessage) => {
            let data = '';
            response.on('data',
                (d: any) => data += this.onData(d));

            // response.on('error', 
            //     (error: any) => this.onError(error));

            response.on('end', () => {
                log(`${Utilities.getTimestamp()} - END  Invoke-WebRequest -> ${httpCommand.method} ${httpCommand.command}`);
                if (!response?.statusCode || response.statusCode < 200 || response.statusCode > 299) {
                    var errorMessage = JSON.parse(data);
                    var error = new Error();
                    error.message = `${errorMessage?.statusCode ?? response.statusCode} - ${errorMessage?.message ?? response.statusMessage}`;
                    this.onError(error);
                }
                if (this.isFunction(callback)) {
                    return callback(data);
                }
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

    /**
     * Summary. Send an HTTP request as an asynchronous operation.
     * 
     * @param httpCommand The HttpCommand to send.
     * 
     * @returns A new Promise<unknown> instance.
     */
    public async invokeAsyncWebRequest(httpCommand: HttpCommand): Promise<unknown> {
        // constants
        return new Promise((resolve, reject) => {
            log(`${Utilities.getTimestamp()} - START Invoke-AsyncWebRequest -> ${httpCommand.method} ${httpCommand.command}`);
            let options = this.getOptions(httpCommand);
            options.timeout = 60000;
            const clientRequest = request(options, (response) => {
                let data = '';

                response.on('data', (chunk) => (data += chunk));

                response.on('error', (error) =>
                    reject(this.onError(error)));

                response.on('end', () => {
                    log(`${Utilities.getTimestamp()} - END  Invoke-AsyncWebRequest -> ${httpCommand.method} ${httpCommand.command}`);
                    if (response?.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                        // resolve({statusCode: response.statusCode, headers: response.headers, body: data});
                        resolve(data);
                    }
                    else {
                        var errorMessage = JSON.parse(data);
                        var error = new Error(`${errorMessage?.statusCode ?? response.statusCode} - ${errorMessage?.message ?? response.statusMessage}`);
                        reject(this.onError(error));
                        // reject('Request failed. status: ' + response.statusCode + ', body: ' + data);
                    }
                });
            });
            clientRequest.setTimeout(options.timeout, () => {
                let error: Error = new Error(`Request timed out after ${options.timeout} milliseconds`);
                this.onError(error);
                clientRequest.destroy();
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
        });
    }

    // Utilities
    private getOptions(httpCommand: HttpCommand): RequestOptions {
        // setup
        let url = new URL(this.baseUrl);
        let uriSegments = url.host.split(':');
        let host = uriSegments[0];
        let port = uriSegments.length === 2 ? Number.parseInt(uriSegments[1].toString()) : -1;

        // build
        let options: RequestOptions = {
            hostname: host,
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
        // get
        return data;
    }

    private onError(error: any) {
        let errorMessage: string = error.message;
        vscode.window.setStatusBarMessage("$(testing-error-icon) " + errorMessage);
        if (`${errorMessage}`.match('ECONNREFUSED')) {
            return;
        }
        console.error(error);
    }
}

