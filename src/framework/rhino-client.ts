/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import { HttpCommand } from "./http-command";
import { HttpClient } from "./http-client";
import { DH_UNABLE_TO_CHECK_GENERATOR } from "constants";

export class RhinoClient {
    // members
    private httpClient: HttpClient;

    /**
     * Summary. Creates a new instance of RhinoClient.
     */
    constructor(baseUrl: string) {
        this.httpClient = new HttpClient(baseUrl);
    }

    /**
     * Summary. Returns a list of available Action Plugins (both Rhino and Code).
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getPlugins(callback: any) {
        // setup
        var httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/plugins';

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
        var httpCommand = new HttpCommand();
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
        var httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/annotations/' + key;

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Returns a list of available test case annotations.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getAnnotations(callback: any) {
        // setup
        var httpCommand = new HttpCommand();
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
        var httpCommand = new HttpCommand();
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
        var httpCommand = new HttpCommand();
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
        var httpCommand = new HttpCommand();
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
        var httpCommand = new HttpCommand();
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
        var httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/plugins/references';

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
        var httpCommand = new HttpCommand();
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
        var httpCommand = new HttpCommand();
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
        var httpCommand = new HttpCommand();
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
        var httpCommand = new HttpCommand()
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
        var httpCommand = new HttpCommand()
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
     * @param createModel Integrated Test Case create model.
     * @param callback    An argument, which is then invoked inside the outer function to complete some kind of routine or action. 
     */
    public getTestCase(integrationModel: any, callback: any) {
        // setup
        var httpCommand = new HttpCommand()
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
        var httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(createModel)
            .setCommand('/api/v3/plugins')
            .addHeader('Content-Type', 'text/plain');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    /**
     * Summary. Creates a collection of Rhino Models.
     * 
     * @param createModel Rhino models request (an array of models).
     * @param callback    An argument, which is then invoked inside the outer function to complete some kind of routine or action. 
     */
    public createModelsMd(createModel: string, callback: any) {
        // setup
        var httpCommand = new HttpCommand()
            .setMethod('POST')
            .setBody(createModel)
            .setCommand('/api/v3/models/md')
            .addHeader('Content-Type', 'text/plain');

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }

    public createModels(createModel: any[], callback: any) {
        // setup
        var httpCommand = new HttpCommand()
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
        var httpCommand = new HttpCommand();
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
        var httpCommand = new HttpCommand().setMethod('DELETE').setCommand('/api/v3/models');

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
        var httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/verbs';

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);
    }
}
