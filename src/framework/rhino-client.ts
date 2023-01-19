/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 * 
 * WORK ITEMS
 * TODO: split actions inside different calsses which represents the backend structure.
 */
import { HttpCommand } from "./http-command";
import { HttpClient } from "./http-client";
import { ResourceModel } from "../contracts/register-data-model";

export class RhinoClient {
    // members
    private httpClient: HttpClient;

    /**
     * Summary. Creates a new instance of RhinoClient.
     */
    constructor(baseUrl: string) {
        this.httpClient = new HttpClient(baseUrl);
    }

    public addEnvironment(environment: any, callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(environment)
            .setCommand('/api/v3/environment')
            .addHeader('Content-Type', 'application/json');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    public syncEnvironment(callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('GET')
            .setCommand('/api/v3/environment/sync');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a list of available Action Plugins (both Rhino and Code).
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getPlugins(callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/plugins';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a list of available Action Plugins (both Rhino and Code).
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getPluginsByConfiguration(configuration: string, callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = `/api/v3/meta/plugins/configurations/${configuration}`;

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a list of available Macro Plugins.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getMacros(callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/macros';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a single available test case annotation.
     * 
     * @param key      The unique identifier by which to find the requested resource.
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getAnnotation(key: string, callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/annotations/' + key;

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns the list of available Rhino log files.
     * 
     */
    public async getServerLogs() {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/logs';

        // get
        return await this.httpClient.invokeAsyncWebRequest(httpCommand);
    }

    /**
     * Summary. Returns a Rhino log.
     * @param logId        The unique identifier by which to find the requested log.
     * @param numberOfLines An optional value to limit the number of lines returned.
     */
    public async getServerLog(logId: string, numberOfLines?: number) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = numberOfLines ? `/api/v3/logs/${logId}/size/${numberOfLines}` : `/api/v3/logs/${logId}`;

        // get
        return await this.httpClient.invokeAsyncWebRequest(httpCommand);
    }

    /**
     * Summary. Returns a list of available test case annotations.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getAnnotations(callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/annotations';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a single available locator.
     * 
     * @param key      The unique identifier by which to find the requested resource.
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getLocator(key: string, callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/locators/' + key;

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a list of available locators.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getLocators(callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/locators';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a collection of available assertions.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getAssertions(callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/assertions';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a collection of available assertions.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getOperators(callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/operators';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a list of available Plugins (both Rhino and Code).
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getPluginsReferences(callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/plugins/references';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Gets a collection of RhinoTestSymbolModel based on the RhinoTestCase spec provided.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getSymbols(input: string, callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/Meta/tests/symbols';
        httpCommand.addHeader('Content-Type', 'text/plain');
        httpCommand.method = 'POST';
        httpCommand.body = input;

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a single available Plugin (both Rhino and Code).
     * 
     * @param key      The unique identifier by which to find the requested resource.
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getPlugin(key: string, callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/plugins/' + key;

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a collection of available element special attributes.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getAttributes(callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/attributes';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a single available Plugin (both Rhino and Code).
     * 
     * @param key      The unique identifier by which to find the requested resource.
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getPluginReference(key: string, callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/plugins/references/' + key;

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Invoke Rhino Configuration against Rhino Server.
     * 
     * @param configuration The Rhino Configuration object to invoke.
     * @param callback      An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public invokeConfiguration(configuration: any, callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(configuration)
            .setCommand('/api/v3/rhino/configurations/invoke')
            .addHeader('Content-Type', 'application/json');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Creates a new Test Case entity on the integrated application.
     * 
     * @param createModel Integrated Test Case create model.
     * @param callback    An argument, which is then invoked inside the outer function to complete some kind of routine or action. 
     */
    public createTestCase(createModel: any, callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(createModel)
            .setCommand('/api/v3/integration/test/create')
            .addHeader('Content-Type', 'application/json');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Creates a new Test Case entity on the integrated application.
     * 
     * @param integrationModel Integrated Test Case get model.
     * @param callback         An argument, which is then invoked inside the outer function to complete some kind of routine or action. 
     */
    public getTestCase(integrationModel: any, callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(integrationModel)
            .setCommand('/api/v3/integration/test/spec')
            .addHeader('Content-Type', 'application/json');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Creates a new Test Case entity on the integrated application.
     * 
     * @param integrationModel Integrated Test Case get model.
     * @param callback         An argument, which is then invoked inside the outer function to complete some kind of routine or action. 
     */
    public getTestCases(integrationModel: any, callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(integrationModel)
            .setCommand('/api/v3/integration/test/spec')
            .addHeader('Content-Type', 'application/json');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Creates a collection of Rhino Plugins using Rhino Plugins spec.
     * 
     * @param createModel Rhino Plugins spec.
     * @param callback    An argument, which is then invoked inside the outer function to complete some kind of routine or action. 
     */
    public createPlugins(createModel: string, callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(createModel)
            .setCommand('/api/v3/plugins')
            .addHeader('Content-Type', 'text/plain');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Creates a collection of Rhino Resources using Rhino Resources spec.
     * 
     * @param createModel Rhino Resources spec.
     */
    public async createResources(createModel: ResourceModel[]) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(createModel)
            .setCommand('/api/v3/resources/bulk')
            .addHeader('Content-Type', 'application/json');

        // get
        return await this.httpClient.invokeAsyncWebRequest(httpCommand);
    }

    /**
     * Summary. Creates a collection of Rhino Models.
     * 
     * @param createModel Rhino models request (an array of models).
     * @param callback    An argument, which is then invoked inside the outer function to complete some kind of routine or action. 
     */
    public createModelsMd(createModel: string, callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(createModel)
            .setCommand('/api/v3/models/md')
            .addHeader('Content-Type', 'text/plain');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    public createModels(createModel: any[], callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(createModel)
            .setCommand('/api/v3/models')
            .addHeader('Content-Type', 'application/json');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a list of available Rhino Page Models.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getModels(callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/models';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Delete all models under the user domain.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public deleteModels(callback: any) {
        // setup
        let httpCommand = new HttpCommand().setMethod('DELETE').setCommand('/api/v3/models');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a list of available Rhino Keywords.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getVerbs(callback: any) {
        // setup
        let httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/verbs';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    public createConfiguration(configuration: any, callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(configuration)
            .setCommand('/api/v3/configurations')
            .addHeader('Content-Type', 'application/json');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    public deleteConfiguration(configuration: any, callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('DELETE')
            .setCommand(`/api/v3/configurations/${configuration}`);

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    public getActions(body: string, callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('POST')
            .setCommand(`/api/v3/meta/tests/actions`)
            .setBody(body)
            .addHeader('Content-Type', 'text/plain');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    public getStatus(callback: any) {
        // setup
        let httpCommand = new HttpCommand()
            .setMethod('GET')
            .setCommand(`/api/v3/ping/rhino`);

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }
}
