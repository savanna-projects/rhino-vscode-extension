/*
 * CHANGE LOG - keep only last 5 threads
 * 
 * RESOURCES
 */
export class RhinoSnippet {
    // properties
    public name: string;
    public snippet: string;
    public documentation: string;
    public detail: string;

    /**
     * Summary. Creates a new instance of HttpCommand.
     */
    constructor() {
        this.name = '';
        this.snippet = '';
        this.documentation = '';
        this.detail = '';
    }

    /**
     * Summary. Sets the name of the snippet.
     * 
     * @param name The name of the snippet.
     */
    public setName(name: string) {
        // build
        this.name = name;
        
        // get
        return this;
    }

    /**
     * Summary. Sets the snippet code template.
     * 
     * @param snippet The snippet code template.
     */
    public setSnippet(snippet: any) {
        // build
        this.snippet = snippet;

        // get
        return this;
    }

    /**
     * Summary. Sets the snippet detail.
     * 
     * @param detail The snippet detail.
     */
     public setDetail(detail: any) {
        // build
        this.detail = detail;

        // get
        return this;
    }    

    /**
     * Summary. Sets the tooltip of the snippet.
     * 
     * @param documentation The documentation markdown of the snippet.
     */
    public setDocumentation(documentation: string) {
        // setup
        this.documentation = documentation;

        // get
        return this;
    }    
}
