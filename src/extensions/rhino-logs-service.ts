import { RhinoClient } from "../framework/rhino-client";
import * as os from 'os';
import { GravityLogMessage, RhinoLogMessage } from "./log-messages";
import { ServerLogParser } from "../Formatters/server-log-parser";

export class RhinoLogsService{
    startLogList = ['DBG', 'ERR', 'FTL', 'INF', 'TRC', 'WRN', 'Rhino.Agent'];
    private rhinoClient:RhinoClient;
    private messagesCache : Set<GravityLogMessage | RhinoLogMessage> = new Set<GravityLogMessage | RhinoLogMessage>();

    /**
     *
     */
    constructor(rhinoClient: RhinoClient) {
        this.rhinoClient = rhinoClient;
    }

    public async getLogsList(): Promise<string[] | undefined>{
        return await this.rhinoClient.getServerLogs().then((result) => {
            if(typeof result == 'string'){
                let logNames: string[] = JSON.parse(result);
                return logNames;
            }
        });
    }
    public async getLatestLogId() {
        let logFileNames = await this.getLogsList();
        if(!logFileNames){
            console.error('Rhino Logs list empty | not found');
            return '';
        } else {
            let latestLog = logFileNames[logFileNames.length - 1];
            return RhinoLogsService.extractServerLogId(latestLog);
        }
    }

    public async getLog(log_id: string, numberOfLines?: number): Promise<any>{
        return await this.rhinoClient.getServerLog(log_id, numberOfLines).then((result) => {
            if(typeof result == 'string'){
                return result;
            }
        });
    }

    public async getLatestLog(numberOfLines?: number): Promise<any>{
        let log_id: string = await this.getLatestLogId();
        return await this.rhinoClient.getServerLog(log_id, numberOfLines).then((result) => {
            if(typeof result == 'string'){
                return result;
            }
        });
    }


    public static extractServerLogId(logFileName: string){
        let start = logFileName.indexOf('-') + 1;
        let end = logFileName.indexOf('.');
        return logFileName.substring(start, end);
    }

    public parseLog(log: string): Set<GravityLogMessage | RhinoLogMessage>{
        let logMessages = new Set<GravityLogMessage | RhinoLogMessage>();
        ServerLogParser.parseServerLog(log).forEach((logMessage) => {
            if(!this.messagesCache.has(logMessage)){
                logMessages.add(logMessage);
                this.messagesCache.add(logMessage);
            }
        });
        return logMessages;
    }

    public parseLogToMessages(serverLog: string, messages? : Set<string>): Set<string>{
        let logMessages: Set<string> = new Set<string>();
        let logMessage: string;
        let lines = serverLog.split(/\r\n|\r|\n/);
        lines.forEach((line) => {
            let isMessageStart = this.startLogList.some(element => {
                return line.startsWith(element);
            });
            if(isMessageStart){
                if(logMessage && !messages?.has(logMessage)){
                    logMessages.add(logMessage + os.EOL);
                }
                logMessage = line;
            }
            else if(logMessage){
                logMessage += line + os.EOL;
            }
        });
        return logMessages;
    }
}