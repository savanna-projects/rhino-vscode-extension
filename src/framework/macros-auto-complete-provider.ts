export class MacrosAutoCompleteProvider {
    // members
    private manifests: any[];

    /**
     * Creates a new instance of CommandsProvider
     */
    constructor() {
        this.manifests = [];
    }

    /*┌─[ SETTERS ]────────────────────────────────────────────
      │
      │ A collection of functions to set object properties
      │ to avoid initializing members in the object signature.
      └────────────────────────────────────────────────────────*/
    /**
     * Summary. Sets the collection of plugins references as returns by Rhino Server.
     * 
     * @param manifests A collection of plugins references as returns by Rhino Server.
     * @returns Self reference.
     */
    public setManifests(manifests: any[]): MacrosAutoCompleteProvider {
        // setup
        this.manifests = manifests;
        
        // get
        return this;
    }
}