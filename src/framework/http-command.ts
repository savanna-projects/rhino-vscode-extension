/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
export class HttpCommand {
    // properties
    public command: string;
    public body: any;
    public headers: any;
    public method: string;
    public schema: string;

    /**
     * Summary. Creates a new instance of HttpCommand.
     */
    constructor() {
        this.command = '/';
        this.body = null;
        this.headers = {};
        this.method = 'GET';
        this.schema = 'http';
    }

    /**
     * Summary. Sets the HttpCommand (route, query parameters, etc.) to invoke.
     * 
     * @param command The route, query parameters, etc. to use as the command.
     */
    public setCommand(command: string) {
        // build
        this.command = command;

        // get
        return this;
    }

    /**
     * Summary. Sets the HTTP request content sent to the server.
     * 
     * @param body The HTTP request content sent to the server.
     */
    public setBody(body: any) {
        // build
        this.body = body;
        console.log(JSON.stringify(body));

        // get
        return this;
    }

    /**
     * Summary. Sets the HTTP method to use when sent to the server.
     * 
     * @param method The HTTP method to use when sent to the server (default is GET).
     */
    public setMethod(method: string) {
        // setup
        this.method = method;

        // get
        return this;
    }

    /**
     * Summary. Sets the HTTP schema to use when sent to the server.
     * 
     * @param schema The HTTP schema to use when sent to the server.
     */
    public setSchema(schema: string) {
        // setup
        this.schema = schema;

        // get
        return this;
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
