import * as vscode from 'vscode';
import { RhinoClient } from '../clients/rhino-client';
import { Channels } from '../constants/channels';
import { Utilities } from '../extensions/utilities';
import { AgentLogger } from '../logging/agent-logger';
import { ExtensionLogger } from '../logging/extensions-logger';
import { Logger } from '../logging/logger';
import { LogEvents } from '../logging/logger-base';

export class AgentLogListener {
    // members: static
    private readonly _logger: Logger = new ExtensionLogger(Channels.extension, 'AgentLogListener');
    private readonly _agentLogger: Logger = new AgentLogger(Channels.agent, 'Rhino Agent');

    // members
    private readonly _client: RhinoClient;
    private readonly _logConfiguration: LogConfiguration;
    private _isRunning: boolean = false;

    // properties
    public readonly channel: vscode.OutputChannel;

    constructor(channel: vscode.OutputChannel, client: RhinoClient) {
        // setup: members
        this._client = client;
        this._logConfiguration = Utilities.getLogConfiguration();

        // setup: properties
        this.channel = channel;
    }

    // TODO: clean
    public async start(): Promise<void> {
        // constants
        const rhinoPattern = /(Application|Logger|LogLevel|TimeStamp|MachineName|Message)(\s+)?:\s+.*/gi;
        const gravityPattern = /(Rhino\.Agent\s+\w+:)(\s+\d+\s+:)(\s+(\d+\.?)+)?.*(?<=executed(\n?))/gi;
        const exceptionPattern = /(Rhino\.Agent\s+\w+:\s+\d+\s+:\s+)(.*Exception.*)|(\s{3}at\s+).*|(\s{3})?(?:---)\s+End of.+(?:---)|(\s{2})(\(.*)|(?:\s--->\s)?(\w+\.).*Exception:.*/gi;
        const exceptionMessagePattern = /(?<=--->\s+(.*)Exception:\s+).*/gi;

        // setup
        this._agentLogger?.setLogLevel(this._logConfiguration.logLevel);
        this._isRunning = true;
        const id = await this.getLogId(this._client);

        // build
        let numberOfLines = 0;
        do {
            // refresh
            let agentLog = await this.getLog(this._client, id);
            let lines: string[] = agentLog.replace(/\r/gi, '').split('\n');
            let delta = lines.length - numberOfLines;
            const log = [...lines];

            log.splice(0, numberOfLines === 0 ? delta : lines.length - delta);
            numberOfLines = lines.length;

            // extract
            for (let i = 0; i < log.length; i++) {
                const line = log[i];
                let logEntry = '';

                if (line.match(rhinoPattern) && i < log.length) {
                    let entries = [];

                    while (log[i].match(rhinoPattern)) {
                        entries.push(log[i].trim().replace(/\n|\r/, ' '));
                        i++;
                    }

                    logEntry = entries.join('\n');
                }

                if (line.match(gravityPattern)) {
                    logEntry = line.trim().replace(/\n|\r/, ' ');
                }

                let error: Error | undefined = undefined;
                if (line.match(exceptionPattern)) {
                    let entries = [];
                    let message = 'N/A';

                    while (log[i].match(exceptionPattern) && i < log.length) {
                        const match = log[i].match(exceptionMessagePattern);
                        if (match) {
                            message = Utilities.getFirstMatch(match);
                        }
                        entries.push(log[i].trimEnd());
                        i++;
                    }

                    logEntry = entries.join('\n');
                    error = new Error(message);
                    error.stack = logEntry;
                }

                this.write(logEntry, error);
            }

            // interval
            await Utilities.waitAsync(this._logConfiguration.agentLogConfiguration.interval);
        } while (this._isRunning);
    }

    public async stop(): Promise<void> {
        this._isRunning = false;
    }

    private async getLogId(client: RhinoClient): Promise<string> {
        try {
            // setup
            const logs = await client.logs.getLogs();

            // extract
            const ids = logs
                .map((i: any) => i.match(/\d+/).toString())
                .sort((a: any, b: any) => (a > b ? -1 : 1));

            // get
            return ids.length > 0 ? ids[0] : '';
        } catch (error: any) {
            this._logger?.error(error.message, error);
        }
        return '';
    }

    private async getLog(client: RhinoClient, id: string): Promise<string> {
        try {
            return await client.logs.getLog(id);
        } catch (error: any) {
            this._logger?.error(error.message, error);
        }
        return '';
    }

    private write(logEntry: string, error?: Error) {
        // setup
        const logLevelPattern = /(?<=LogLevel\s+:\s+).*|(?<=Rhino\.Agent\s+)(\w+)(?=\:\s+\d+\s+:\s+(\d+\.?)+\s+-\s+)?/gi;
        const match = logEntry.match(logLevelPattern);
        const logLevel = Utilities.getFirstMatch(match).toUpperCase();

        // write
        switch (logLevel) {
            case 'TRC':
            case 'TRAC':
            case 'TRACE':
                this._agentLogger?.trace(logEntry, LogEvents.unknown, error);
                break;
            case 'DBG':
            case 'DBUG':
            case 'DEBUG':
                this._agentLogger?.debug(logEntry, LogEvents.unknown, error);
                break;
            case 'INF':
            case 'INFO':
            case 'INFORMATION':
                this._agentLogger?.information(logEntry, LogEvents.unknown, error);
                break;
            case 'WRN':
            case 'WARN':
            case 'WARNING':
                this._agentLogger?.warning(logEntry, LogEvents.unknown, error);
                break;
            case 'ERR':
            case 'EROR':
            case 'ERROR':
                this._agentLogger?.error(logEntry, LogEvents.unknown, error);
                break;
            case 'FTL':
            case 'FATL':
            case 'FATAL':
                this._logger?.fatal(logEntry, LogEvents.unknown, error);
                break;
            default:
                break;
        }
    }
}
