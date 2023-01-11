import { RhinoClient } from "../framework/rhino-client";
import { GravityLogMessage, LogMessage, RhinoLogMessage } from "./log-models";
import { ServerLogParser } from "./server-log-parser";

export class RhinoLogsService{
    private rhinoClient:RhinoClient;
    private messagesCache : Map<string, LogMessage> = new Map<string, LogMessage>();

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

    public async getLog(log_id: string, numberOfLines?: number): Promise<string | undefined>{
        return await this.rhinoClient.getServerLog(log_id, numberOfLines).then((result) => {
            if(typeof result == 'string'){
                return result;
            }
        });
    }

    public async getLatestLog(numberOfLines?: number): Promise<string | undefined>{
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

    public parseLog(log: string): LogMessage[]{
        let logMessages: LogMessage[] = [];
        let messages = ServerLogParser.parseServerLog(log);
        for(let logMessage of messages){
            if(!this.messagesCache.has(logMessage.timeStamp)){
                logMessages.push(logMessage);
                this.messagesCache.set(logMessage.timeStamp, logMessage);
            }
            else if(this.messagesCache.get(logMessage.timeStamp)?.message != logMessage.message){
                console.info(`Found different messages with identical timestamp:\nMessage1:\n${JSON.stringify(logMessage)}\n\n\nMessage2:\n${JSON.stringify(this.messagesCache.get(logMessage.timeStamp))}`);
                logMessage.timeStamp += "0";
                logMessages.push(logMessage);
                this.messagesCache.set(logMessage.timeStamp, logMessage);
            }
        }
        return logMessages;
    }
}