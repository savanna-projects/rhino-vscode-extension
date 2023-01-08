interface String {
    isJson(): boolean;
    replaceAll(oldValue: string, newValue: string): string;
}

interface RhinoServerConfig {
    schema: string;
    host: string;
    port: string;
}