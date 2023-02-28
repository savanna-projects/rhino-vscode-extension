import { ResourceModel } from "../models/register-data-model";
import { HttpClient, HttpCommand } from "./http-client";

export class RhinoClient {
    // properties
    public readonly httpClient: HttpClient;
    public readonly configurations: ConfigurationsClient;
    public readonly environments: EnvironmentsClient;
    public readonly integration: IntegrationClient;
    public readonly logs: LogsClient;
    public readonly meta: MetaClient;
    public readonly models: ModelsClient;
    public readonly plugins: PluginsClient;
    public readonly resources: ResourcesClient;
    public readonly rhino: RhinoSyncClient;
    public readonly status: PingClient;

    /**
     * Summary. Creates a new instance of RhinoClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(baseUrl: string, version: number = 3) {
        // setup
        const client = new HttpClient(baseUrl);

        // build
        this.httpClient = client;
        this.configurations = new ConfigurationsClient(client, version);
        this.environments = new EnvironmentsClient(client, version);
        this.integration = new IntegrationClient(client, version);
        this.meta = new MetaClient(client, version);
        this.models = new ModelsClient(client, version);
        this.logs = new LogsClient(client, version);
        this.plugins = new PluginsClient(client, version);
        this.resources = new ResourcesClient(client, version);
        this.rhino = new RhinoSyncClient(client, version);
        this.status = new PingClient(client, version);
    }
}

class ConfigurationsClient {
    // properties
    private readonly _httpClient: HttpClient;
    private readonly _version: number;

    /**
     * Summary. Creates a new instance of ConfigurationsClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(httpClient: HttpClient, version: number) {
        this._httpClient = httpClient;
        this._version = version;
    }

    public deleteConfiguration(configuration: any): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/configurations/${configuration}`;
        httpCommand.method = 'DELETE';

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    public newConfiguration(requestBody: any): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/configurations`;
        httpCommand.addHeader('Content-Type', 'application/json');
        httpCommand.method = 'POST';
        httpCommand.body = requestBody;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }
}

class EnvironmentsClient {
    // properties
    private readonly _httpClient: HttpClient;
    private readonly _version: number;

    /**
     * Summary. Creates a new instance of EnvironmentsClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(httpClient: HttpClient, version: number) {
        this._httpClient = httpClient;
        this._version = version;
    }

    public addEnvironment(requestBody: any): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/environment`;
        httpCommand.addHeader('Content-Type', 'application/json');
        httpCommand.method = 'POST';
        httpCommand.body = requestBody;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    public syncEnvironment(): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/environment/sync`;
        httpCommand.method = 'GET';

        // get
        return this._httpClient.sendAsync(httpCommand);
    }
}

class IntegrationClient {
    // properties
    private readonly _httpClient: HttpClient;
    private readonly _version: number;

    /**
     * Summary. Creates a new instance of IntegrationClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(httpClient: HttpClient, version: number) {
        this._httpClient = httpClient;
        this._version = version;
    }

    /**
     * Summary. Creates a new Test Case entity on the integrated application.
     * 
     * @param requestBody Integrated Test Case create model.
     */
    public newTestCase(requestBody: any): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/integration/test/create`;
        httpCommand.addHeader('Content-Type', 'application/json');
        httpCommand.method = 'POST';
        httpCommand.body = requestBody;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Gets a collection of test case specifications from the integrated application.
     * 
     * @param requestBody Integrated Test Case get model.
     */
    public getTestCases(requestBody: any): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/integration/test/spec`;
        httpCommand.addHeader('Content-Type', 'application/json');
        httpCommand.method = 'POST';
        httpCommand.body = requestBody;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }
}

class LogsClient {
    // properties
    private readonly _httpClient: HttpClient;
    private readonly _version: number;

    /**
     * Summary. Creates a new instance of MetaClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(httpClient: HttpClient, version: number) {
        this._httpClient = httpClient;
        this._version = version;
    }

    /**
     * Summary. Returns a single available test case annotation.
     */
    public getLogs(): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/logs`;
        httpCommand.method = 'GET';

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Returns a single available test case annotation.
     */
    public getLog(id: string): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/logs/${id}`;
        httpCommand.method = 'GET';

        // get
        return this._httpClient.sendAsync(httpCommand);
    }
}

class MetaClient {
    // properties
    private readonly _httpClient: HttpClient;
    private readonly _version: number;

    /**
     * Summary. Creates a new instance of MetaClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(httpClient: HttpClient, version: number) {
        this._httpClient = httpClient;
        this._version = version;
    }

    /**
     * Summary. Returns a single available test case annotation.
     */
    public getAnnotations(): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/meta/annotations`;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Returns a collection of available assertions.
     */
    public getAssertions(): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/meta/assertions`;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Returns a collection of available element special attributes.
     */
    public getAttributes(): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/meta/attributes`;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Returns a list of available locators.
     */
    public getLocators(): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/meta/locators`;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Returns a list of available Macro Plugins.
     */
    public getMacros(): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/meta/macros`;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Returns a list of available Rhino Page Models.
     */
    public getModels(): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/meta/models`;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Returns a collection of available assertions.
     */
    public getOperators(): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/meta/operators`;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Returns a list of available Action Plugins (both Rhino and Code).
     */
    public getPlugins(): Promise<any>;
    public getPlugins(configuration: string): Promise<any>;
    public getPlugins(configuration?: string): Promise<any> {
        // setup
        const isConfiguration = configuration !== null && configuration !== undefined && configuration !== '';
        const httpCommand = new HttpCommand();
        httpCommand.command = isConfiguration
            ? `/api/v${this._version}/meta/plugins/configurations/${configuration}`
            : `/api/v${this._version}/meta/plugins`;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Gets a collection of RhinoTestSymbolModel based on the RhinoTestCase spec provided.
     */
    public getSymbols(requestBody: string): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/meta/tests/symbols`;
        httpCommand.addHeader('Content-Type', 'text/plain');
        httpCommand.method = 'POST';
        httpCommand.body = requestBody;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Returns a list of available Rhino Keywords.
     */
    public getVerbs(): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/meta/verbs`;
        httpCommand.method = 'GET';

        // get
        return this._httpClient.sendAsync(httpCommand);
    }
}

class ModelsClient {
    // properties
    private readonly _httpClient: HttpClient;
    private readonly _version: number;

    /**
     * Summary. Creates a new instance of ModelsClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(httpClient: HttpClient, version: number) {
        this._httpClient = httpClient;
        this._version = version;
    }

    /**
     * Summary. Delete all models under the user domain.
     */
    public async deleteModels(): Promise<any> {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/models`;
        httpCommand.method = 'DELETE';

        // get
        return this._httpClient.sendAsync(httpCommand);
    }

    /**
     * Summary. Creates a collection of Rhino Models.
     * 
     * @param requestBody Rhino models request (an array of models).
     */
    public newModels(requestBody: string): Promise<any>;
    public newModels(requestBody: any[]): Promise<any>;
    public newModels(requestBody: any[] | string): Promise<any> {
        // setup
        const command = typeof requestBody === 'string'
            ? `/api/v${this._version}/models/md`
            : `/api/v${this._version}/models`;
        const media = typeof requestBody === 'string' ? 'text/plain' : 'application/json';

        // build
        const httpCommand = new HttpCommand();
        httpCommand.command = command;
        httpCommand.addHeader('Content-Type', media);
        httpCommand.method = 'POST';
        httpCommand.body = requestBody;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }
}

class PingClient {
    // properties
    private readonly _httpClient: HttpClient;
    private readonly _version: number;

    /**
     * Summary. Creates a new instance of PluginsClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(httpClient: HttpClient, version: number) {
        this._httpClient = httpClient;
        this._version = version;
    }

    public ping() {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/ping/rhino`;
        httpCommand.method = 'GET';
        httpCommand.timeout = 3000;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }
}

class PluginsClient {
    // properties
    private readonly _httpClient: HttpClient;
    private readonly _version: number;

    /**
     * Summary. Creates a new instance of PluginsClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(httpClient: HttpClient, version: number) {
        this._httpClient = httpClient;
        this._version = version;
    }

    /**
     * Summary. Creates a collection of Rhino Plugins using Rhino Plugins spec.
     * 
     * @param requestBody Rhino Plugins spec.
     */
    public addPlugins(requestBody: string): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/plugins`;
        httpCommand.addHeader('Content-Type', 'text/plain');
        httpCommand.method = 'POST';
        httpCommand.body = requestBody;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }
}

class ResourcesClient {
    // properties
    private readonly _httpClient: HttpClient;
    private readonly _version: number;

    /**
     * Summary. Creates a new instance of ResourcesClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(httpClient: HttpClient, version: number) {
        this._httpClient = httpClient;
        this._version = version;
    }
    /**
     * Summary. Creates a collection of Rhino Resources using Rhino Resources spec.
     * 
     * @param requestBody Rhino Resources spec.
     */
    public async newResources(requestBody: ResourceModel[]) {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.command = `/api/v${this._version}/resources/bulk`;
        httpCommand.addHeader('Content-Type', 'application/json');
        httpCommand.method = 'POST';
        httpCommand.body = requestBody;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }
}

class RhinoSyncClient {
    // properties
    private readonly _httpClient: HttpClient;
    private readonly _version: number;

    /**
     * Summary. Creates a new instance of RhinoSyncClient object.
     * 
     * @param baseUrl The base address of the Internet resource used when sending requests.
     */
    constructor(httpClient: HttpClient, version: number) {
        this._httpClient = httpClient;
        this._version = version;
    }

    /**
     * Summary. Invoke Rhino Configuration against Rhino Server.
     * 
     * @param requestBody The Rhino Configuration object to invoke.
     */
    public invokeConfiguration(requestBody: any): Promise<any> {
        // setup
        const httpCommand = new HttpCommand();
        httpCommand.timeout = 900000;
        httpCommand.command = `/api/v${this._version}/rhino/configurations/invoke`;
        httpCommand.addHeader('Content-Type', 'application/json');
        httpCommand.method = 'POST';
        httpCommand.body = requestBody;

        // get
        return this._httpClient.sendAsync(httpCommand);
    }
}
