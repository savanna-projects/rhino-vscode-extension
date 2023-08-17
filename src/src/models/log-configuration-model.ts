type LogConfiguration = {
    agentLogConfiguration: AgentLogConfiguration,
    logLevel: 'none' | 'trace' | 'debug' | 'information' | 'warning' | 'error' | 'fatal';
    sourceOptions?: SourceOptions;
};

type SourceOptions = {
    filter: "include" | "exclude";
    sources: []
};

type AgentLogConfiguration = {
    enabled: boolean,
    interval: number
};