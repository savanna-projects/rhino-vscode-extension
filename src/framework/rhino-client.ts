/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
import { HttpCommand } from "../contracts/http-command";
import { HttpClient } from "./http-client";

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
     * Summary. Returns a single available test case property.
     * 
     * @param key      The unique identifier by which to find the requested resource.
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
     public getProperty(key: string, callback: any) {
        // setup
        var httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/properties/' + key;

        // get
        this.httpClient.invokeWebRequest(httpCommand, callback);        
    }

    /**
     * Summary. Returns a list of available test case properties.
     * 
     * @param callback An argument, which is then invoked inside the outer function to complete some kind of routine or action.
     */
    public getProperties(callback: any) {
        // setup
        var httpCommand = new HttpCommand();
        httpCommand.command = '/api/v3/meta/properties';

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
}