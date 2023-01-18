import { GravityLogMessage, LogMessage, RhinoLogMessage } from "./log-models";
import * as os from 'os';
import { RhinoLogParser } from "./rhino-log-parser";
import { GravityLogParser } from "./gravity-log-parser";
import { isRhinoLog } from "./log-models-typeguards";


type LogType = 'Gravity' | 'Rhino';

interface SplitLogLine {
    logType: LogType;
    message: string;
}

export class ServerLogParser {


    public static parseServerLog(log: string): LogMessage[] {
        let messages: LogMessage[] = [];
        if (!log) {
            console.warn('Warning - Log is null or empty!');
            return messages;
        }

        let splitLogLines = this.splitServerLog(log);

        splitLogLines.forEach(splitLogLine => {
            let messageObject = this.buildLogMessage(splitLogLine);
            if (messageObject) {
                messages.push(messageObject);
            }
        });


        return messages;
    }

    private static buildLogMessage(splitLogLine: SplitLogLine): RhinoLogMessage | GravityLogMessage | undefined {
        switch (splitLogLine.logType) {
            case 'Gravity':
                return GravityLogParser.buildGravityLog(splitLogLine.message);
            case 'Rhino':
                return RhinoLogParser.buildRhinoLog(splitLogLine.message);
        }
    }

    private static splitServerLog(log: string): SplitLogLine[] {
        let separatedMessages: SplitLogLine[] = [];

        if (!log) {
            console.warn('Warning - Log is null or empty!');
            return separatedMessages;
        }
        let logMessage: SplitLogLine = {} as any;
        let logLines = log.split(/\r\n|\r|\n/);

        logLines.forEach((line) => {
            let logType = this.findLogType(line);
            if (logType) {
                if (logMessage?.message && logMessage?.logType) {
                    separatedMessages.push(logMessage);
                }
                logMessage = { logType: logType, message: line + os.EOL };
            }
            else if (logMessage?.message) {
                //Temp workaround due to formatting inconsistencies of custom backend plugin logs.
                if (logMessage.logType !== 'Rhino' && RhinoLogParser.findRhinoApplication(line)) {
                    logMessage.logType = 'Rhino';
                }
                logMessage.message += line + os.EOL;
            }
        });
        if (logMessage?.message) {
            separatedMessages.push(logMessage);
        }
        return separatedMessages;
    }

    private static findLogType(logLine: string): LogType | undefined {
        if (RhinoLogParser.isRhinoLogStart(logLine)) {
            return 'Rhino';
        }
        else if (GravityLogParser.isGravityLogStart(logLine)) {
            return 'Gravity';
        }
    }

    public static parseLogTimestamp(message: LogMessage): Date {
        return isRhinoLog(message)
            ? RhinoLogParser.parseRhinoTimestamp(message.timeStamp)
            : GravityLogParser.parseGravityTimestamp(message.timeStamp);
    }

}