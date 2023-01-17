import { RhinoClient } from "../framework/rhino-client";
import { LogMessage } from "./log-models";
import { ServerLogParser } from "./server-log-parser";

export class ServerLogService {
    private rhinoClient: RhinoClient;
    private messagesCache: Map<string, LogMessage> = new Map<string, LogMessage>();

    /**
     *
     */
    constructor(rhinoClient: RhinoClient) {
        this.rhinoClient = rhinoClient;
    }

    public async getLogsList(): Promise<string[] | undefined> {
        return await this.rhinoClient.getServerLogs().then((result) => {
            if (typeof result === 'string') {
                let logNames: string[] = JSON.parse(result);
                return logNames;
            }
        });
    }

    public async getLatestLogId() {
        let logFileNames = await this.getLogsList();
        if (!logFileNames) {
            console.error('Rhino Logs list empty | not found');
            return '';
        } else {
            let latestLog = logFileNames[logFileNames.length - 1];
            return ServerLogService.extractServerLogId(latestLog);
        }
    }

    public async getLog(logId: string, numberOfLines?: number): Promise<string | undefined> {
        return await this.rhinoClient.getServerLog(logId, numberOfLines).then((result) => {
            if (typeof result === 'string') {
                return result;
            }
        });
    }

    public async getLatestLog(numberOfLines?: number): Promise<string | undefined> {
        let logId: string = await this.getLatestLogId();
        return await this.rhinoClient.getServerLog(logId, numberOfLines).then((result) => {
            if (typeof result === 'string') {
                return result;
            }
        });
    }


    public static extractServerLogId(logFileName: string) {
        let start = logFileName.indexOf('-') + 1;
        let end = logFileName.indexOf('.');
        return logFileName.substring(start, end);
    }

    public parseLog(log: string): LogMessage[] {
        let logMessages: LogMessage[] = [];
        let messages = ServerLogParser.parseServerLog(log);
        for (let logMessage of messages) {
            if (!this.messagesCache.has(logMessage.timeStamp)) {
                this.messagesCache.set(logMessage.timeStamp, logMessage);
                logMessages.push(logMessage);
            }
        }
        return logMessages;
    }
}