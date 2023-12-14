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
    // The logger instance used for logging HTTP client-related information.
    private readonly _logger: Logger;

    // The base URL of the Internet resource used when sending requests.
    private readonly _baseUrl: string;

    /**
     * Creates a new instance of an HttpClient.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(baseUrl: string) {
        // Initialize the base URL
        this._baseUrl = baseUrl;

        // Initialize the logger with the appropriate channel and context
        this._logger = new ExtensionLogger(Channels.extension, 'HttpClient');
    }

    /**
     * Asynchronously sends an HTTP request based on the provided HttpCommand.
     * 
     * @param httpCommand The HttpCommand object containing request details.
     * @returns A Promise that resolves with the response data.
     */
    public async sendAsync(httpCommand: HttpCommand): Promise<any> {
        return new Promise((resolve) => {
            // Extract logger, URL, and request options
            const logger = this._logger;
            const url = `${this._baseUrl}${httpCommand.command}`;
            const options = HttpClient.getOptions(this._baseUrl, httpCommand);

            // Create the client request
            const clientRequest = request(options, (response) => {
                let data = '';

                // Handle incoming data
                response.on('data', (incomingData) => data += incomingData);

                // Handle errors during the response
                response.on('error', (error) => HttpClient.onError(logger, error, resolve));

                // Handle the end of the response
                response.on('end', () => HttpClient.onEnd(logger, response, data, resolve));
            });

            // Handle timeout events
            clientRequest.on('timeout', () => HttpClient.onTimeout(logger, url, options.timeout, resolve));

            // Handle errors during the request
            clientRequest.on('error', (error: any) => HttpClient.onError(logger, error, resolve));

            // Write request body if applicable
            const isBody = httpCommand.body !== null && httpCommand.body !== undefined;
            const isJson = 'Content-Type' in httpCommand.headers && httpCommand.headers['Content-Type'] === 'application/json';

            if (isBody && isJson) {
                // If the request body is provided and is in JSON format, write it as a JSON string
                clientRequest.write(JSON.stringify(httpCommand.body));
            }
            else if (isBody && !isJson) {
                // If the request body is provided and is not in JSON format, write it as a string
                clientRequest.write(httpCommand.body.toString());
            }

            // End the request
            clientRequest.end();
        });
    }

    // Gets the request options based on the provided base URL and HttpCommand.
    private static getOptions(baseUrl: string, httpCommand: HttpCommand): RequestOptions {
        // Parse the base URL to extract host and port information
        const url = new URL(baseUrl);
        const uriSegments = url.host.split(':');
        const host = uriSegments[0];
        const port = uriSegments.length === 2 ? Number.parseInt(uriSegments[1].toString()) : -1;

        // Create the RequestOptions object with essential properties
        const options: RequestOptions = {
            hostname: host,
            path: httpCommand.command,
            method: httpCommand.method,
            timeout: httpCommand.timeout
        };

        // Add port information if available
        if (port !== -1) {
            options['port'] = port;
        }

        // Add custom headers if provided in the HttpCommand
        if (httpCommand.headers) {
            options.headers = httpCommand.headers;
        }

        // Return the constructed RequestOptions object
        return options;
    }

    // Handles the 'end' event of an HTTP response.
    private static onEnd(logger: Logger, response: IncomingMessage, data: string, resolve: any) {
        // Check if the response data is in JSON format
        const isJson = Utilities.assertJson(data);

        // Parse the response body accordingly
        const responseBody = isJson ? JSON.parse(data) : data;

        // Check if the HTTP status code indicates a successful response (2xx range)
        if (response?.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
            // Resolve the Promise with the parsed response body
            resolve(responseBody);
            return;
        }

        // If the response has an error status code, handle the error
        const errorMessage = isJson ? JSON.stringify(responseBody, null, 4) : responseBody;
        const error = new Error(`Send-HttpRequest -Url ${response.url} = (${response.statusCode})`);
        error.stack = errorMessage;

        // Call the onError method to handle and log the error
        this.onError(logger, error, resolve);
    }

    // Handles the 'timeout' event of an HTTP request.
    private static onTimeout(logger: Logger, url: string, timeout: number | undefined, resolve: any) {
        // Format the timeout threshold for logging purposes
        let formattedThreshold = "";
        if (timeout) {
            formattedThreshold = timeout > 60000
                ? `${(timeout / 60000).toPrecision(2)} minutes`
                : `${timeout} milliseconds`;
        }

        // Create an error for the timeout situation
        const error = new Error(`Request to ${url} timed out after ${formattedThreshold}. Please check your network connection or try again.`);

        // Call the onError method to handle and log the timeout error
        this.onError(logger, error, resolve);
    }

    // Handles errors that occur during an HTTP request.
    private static onError(logger: Logger, error: any, resolve: any) {
        // Log the error using the provided logger
        logger?.error(`HTTP Request Error: ${error.message}`, error);

        // Resolve the Promise with the error stack trace
        resolve(error.stack);
    }
}

/**
 * Represents an HTTP command with details for making an HTTP request.
 */
export class HttpCommand {
    /**
     * The endpoint command for the HTTP request.
     */
    public command: string;

    /**
     * The request body for the HTTP request.
     */
    public body: any;

    /**
     * The headers for the HTTP request.
     */
    public headers: any;

    /**
     * The HTTP method for the request (e.g., 'GET', 'POST').
     */
    public method: string;

    /**
     * The URI schema for the HTTP request (e.g., 'http', 'https').
     */
    public schema: string;

    /**
     * The timeout threshold for the HTTP request in milliseconds.
     */
    public timeout: number;

    /**
     * Creates a new instance of the HttpCommand class with default values.
     */
    constructor() {
        // Default values for the HttpCommand properties
        this.command = '/';
        this.body = null;
        this.headers = {};
        this.method = 'GET';
        this.schema = 'http';
        this.timeout = 180000;
    }

    /**
     * Adds a header to the HTTP request.
     * 
     * @param name The name of the header.
     * @param value The value of the header.
     * @returns The current instance of HttpCommand for method chaining.
     */
    public addHeader(name: string, value: any): HttpCommand {
        // Set the specified header name and value in the headers object
        this.headers[name] = value;

        // Return the current instance of HttpCommand for method chaining
        return this;
    }

    /**
     * Clears all headers from the HTTP request.
     * 
     * @returns The current instance of HttpCommand for method chaining.
     */
    public clearHeaders(): HttpCommand {
        // Set the headers property to an empty object to clear all headers
        this.headers = {};

        // Return the current instance of HttpCommand for method chaining
        return this;
    }

    /**
     * Adds default headers for JSON content type to the HTTP request.
     * 
     * @returns The current instance of HttpCommand for method chaining.
     */
    public addDefaultHeaders(): HttpCommand {
        // Set the default Content-Type header for JSON
        this.headers["Content-Type"] = "application/json";

        // Return the current instance of HttpCommand for method chaining
        return this;
    }
}
