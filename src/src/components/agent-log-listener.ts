import * as vscode from 'vscode';
import { RhinoClient } from '../clients/rhino-client';
import { Channels } from '../constants/channels';
import { Utilities } from '../extensions/utilities';
import { AgentLogger } from '../logging/agent-logger';
import { ExtensionLogger } from '../logging/extensions-logger';
import { Logger } from '../logging/logger';
import { LogEvents } from '../logging/logger-base';
import { newlineRegex } from '../formatters/formatConstants';

export class AgentLogListener {
    // members: static
    private readonly _logger: Logger = new ExtensionLogger(Channels.extension, 'AgentLogListener');
    private readonly _agentLogger: Logger = new AgentLogger(Channels.agent, 'Rhino Agent');

    // members
    private readonly _client: RhinoClient;
    private readonly _logConfiguration: LogConfiguration;
    private _isRunning: boolean = false;
    private _isLastRun: boolean = false;


    // properties
    public readonly channel: vscode.OutputChannel;

    private readonly rhinoPattern = /(Application|Logger|LogLevel|TimeStamp|MachineName|Message)(\s+)?:\s+.*/gi;

    private readonly gravityPattern = /(Rhino\.Agent\s+\w+:)(\s+\d+\s+:)(\s+(\d+\.?)+)?.*(?<=executed(\n?))/gi;

    private readonly exceptionPattern = /(Rhino\.Agent\s+\w+:\s+\d+\s+:\s+)(.*Exception.*)|(\s{3}at\s+).*|(\s{3})?(?:---)\s+End of.+(?:---)|(\s{2})(\(.*)|(?:\s--->\s)?(\w+\.).*Exception:.*/gi;

    constructor(channel: vscode.OutputChannel, client: RhinoClient) {
        // setup: members
        this._client = client;
        this._logConfiguration = Utilities.getLogConfiguration();

        // setup: properties
        this.channel = channel;
    }

    // TODO: clean
    // TODO: collect Rhino Exceptions
    public async start(previousLinesNum:number): Promise<void> {
        // constants
        

        // setup
        this._agentLogger?.setLogLevel(this._logConfiguration.logLevel);
        const id = await this.getLogId(this._client);
        this._isRunning = true;
        
        // build
        let iter = 0;
        do {
            if(this._isLastRun){
                this._isLastRun = false;
            }
            
            // refresh
            let agentLog = await this.getLog(this._client, id);
            let lines: string[] = this.splitLogToLines(agentLog);
            let currentLinesNum = lines.length;

            let delta = currentLinesNum - previousLinesNum;

            lines.splice(0, previousLinesNum === 0 ? delta : currentLinesNum - delta);
            previousLinesNum = currentLinesNum;

            // extract
            for (let i = 0; i < lines.length; i++) {
                let logEntry = '';
                let error: Error | undefined = undefined;

                let entries: string[] = [];

                // build 'rhino' log
                if(this.isRhinoPattern(lines[i])){
                    entries = this.buildRhinoLog(lines,i);
                }

                // build 'gravity' log
                else if (lines[i].match(this.gravityPattern)) {
                    entries = [lines[i].trim().replace(newlineRegex, ' ')];
                }

                // build 'exception' log
                else if (this.isExceptionPattern(lines[i])) {
                    ({ entries, error} = this.buildExceptionLog(lines, i));
                }
                
                // create log entry
                if(entries.length > 0){
                    logEntry = entries.join('\n');
                    this.write(logEntry, error);

                    // resetting index based on entries found
                    i += entries.length - 1;
                }

            }

            // interval
            await Utilities.waitAsync(this._logConfiguration.agentLogConfiguration.interval);
        } while (this._isRunning || this._isLastRun);
    }

    private splitLogToLines(agentLog: string): string[] {
        return agentLog.split(newlineRegex).filter(Boolean);
    }

    private buildExceptionLog(log: string[], index: number) {
        const exceptionMessagePattern = /(?<=--->\s+(.*)Exception:\s+).*/gi;
        let entries = [];
        let message = 'N/A';
        let error: Error | undefined = undefined;

        while (index < log.length && this.isExceptionPattern(log[index])) {
            const match = log[index].match(exceptionMessagePattern);
            if (match) {
                message = Utilities.getFirstMatch(match);
            }
            entries.push(log[index].trim().replace(newlineRegex, ' '));
            index++;
        }

        let errorEntry = entries.join('\n');
        error = new Error(message);
        error.stack = errorEntry;
        return { entries, error };
    }

    private isExceptionPattern(logLine: string) {
        return logLine.match(this.exceptionPattern);
    }

    public async stop(): Promise<void> {
        this._isRunning = false;
        this._isLastRun = true;
    }

    private buildRhinoLog(log:string[], index:number):string[]{
        let entries = [];
        while (index < log.length && this.isRhinoPattern(log[index])) {
            entries.push(log[index].trim().replace(newlineRegex, ' '));
            index++;
        }
        return entries;
    }

    private isRhinoPattern(logLine: string) {
        return logLine.match(this.rhinoPattern);
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

    public async getLogLines(): Promise<number> {
        const id = await this.getLogId(this._client);
        let agentLog = await this.getLog(this._client, id);
        let lines: string[] = this.splitLogToLines(agentLog);
        return lines.length;
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
