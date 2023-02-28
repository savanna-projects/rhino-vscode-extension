/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * https://make.wordpress.org/core/handbook/best-practices/inline-documentation-standards/javascript/
 * https://nodejs.dev/learn/making-http-requests-with-nodejs
 */
import { IncomingMessage, request, RequestOptions } from 'http';
import { Channels } from "../constants/channels";
import { Utilities } from '../extensions/utilities';
import { ExtensionLogger } from '../logging/extensions-logger';
import { Logger } from '../logging/logger';

/**
 * Provides a base class for sending HTTP requests and receiving HTTP responses
 * from a resource identified by a URI.
 */
export class HttpClient {
    // members
    private readonly _logger: Logger;
    private readonly _baseUrl: string;

    /**
     * Summary. Creates a new instance of an HttpClient.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(baseUrl: string) {
        this._baseUrl = baseUrl;
        this._logger = new ExtensionLogger(Channels.extension, 'HttpClient');
    }

    /**
     * Summary. Send an HTTP request as an asynchronous operation.
     * 
     * @param httpCommand The HttpCommand to send.
     * 
     * @returns A new Promise<any> instance.
     */
    public async sendAsync(httpCommand: HttpCommand): Promise<any> {
        return new Promise((resolve) => {
            // setup
            const logger = this._logger;
            const url = `${this._baseUrl}${httpCommand.command}`;
            const options = HttpClient.getOptions(this._baseUrl, httpCommand);
            const clientRequest = request(options, (response) => {
                let data = '';

                response.on('data', (incomingData) => data += incomingData);
                response.on('error', (error) => HttpClient.onError(logger, error, resolve));
                response.on('end', () => HttpClient.onEnd(logger, response, data, resolve));
            });
            clientRequest.on('timeout', () => HttpClient.onTimeout(logger, url, options.timeout, resolve));
            clientRequest.on('error', (error: any) => HttpClient.onError(logger, error, resolve));

            // send
            const isBody = httpCommand.body !== null && httpCommand.body !== undefined;
            const isJson = 'Content-Type' in httpCommand.headers && httpCommand.headers['Content-Type'] === 'application/json';

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
    private static getOptions(baseUrl: string, httpCommand: HttpCommand): RequestOptions {
        // setup
        const url = new URL(baseUrl);
        const uriSegments = url.host.split(':');
        const host = uriSegments[0];
        const port = uriSegments.length === 2 ? Number.parseInt(uriSegments[1].toString()) : -1;

        // build
        const options: RequestOptions = {
            hostname: host,
            path: httpCommand.command,
            method: httpCommand.method,
            timeout: httpCommand.timeout
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

    private static onEnd(logger: Logger, response: IncomingMessage, data: string, resolve: any) {
        // setup
        const isJson = Utilities.assertJson(data);
        const responseBody = isJson ? JSON.parse(data) : data;

        // complete with success
        if (response?.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
            resolve(responseBody);
            return;
        }

        // no success
        const errorMessage = isJson ? JSON.stringify(responseBody, null, 4) : responseBody;
        const error = new Error(`Send-HttpRequest -Url ${response.url} = (${response.statusCode})`);
        error.stack = errorMessage;
        this.onError(logger, error, resolve);
    }

    private static onTimeout(logger: Logger, url: string, timeout: number | undefined, resolve: any) {
        var formattedThreshold = "";
        if(timeout){
            formattedThreshold = timeout > 60000 
            ? `after ${(timeout/60000).toPrecision(2)} minutes`
            : `after ${timeout} milliseconds`;
        }
        // no success
        const error = new Error(`Send-HttpRequest -Url ${url} = (408) Request Timeout ${formattedThreshold}`);
        this.onError(logger, error, resolve);
    }

    private static onError(logger: Logger, error: any, resolve: any) {
        logger?.channel.show();
        logger?.error(error.message, error);
        resolve(error.stack);
    }
}

export class HttpCommand {
    // properties
    public command: string;
    public body: any;
    public headers: any;
    public method: string;
    public schema: string;
    public timeout: number;

    /**
     * Summary. Creates a new instance of HttpCommand.
     */
    constructor() {
        this.command = '/';
        this.body = null;
        this.headers = {};
        this.method = 'GET';
        this.schema = 'http';
        this.timeout = 180000;
    }

    /**
     * Summary. Adds the specified header and its values into the HttpHeaders collection.
     * 
     * @param name  The header to add to the collection. 
     * @param value The header values to add to the collection.
     */
    public addHeader(name: string, value: any) {
        // build
        this.headers[name] = value;

        // get
        return this;
    }

    /**
     * Summary. Removes all headers from the HttpHeaders collection.
     */
    public clearHeaders() {
        // build
        this.headers = {};

        // get
        return this;
    }

    /**
     * Summary. Apply default headers into the HttpHeaders collection 
     */
    public addDefaultHeaders() {
        // build
        this.headers["Content-Type"] = "application/json";

        // get
        return this;
    }
}
