import { GravityLogMessage, gravityLogStartText, RhinoLogMessage, rhinoLogStartText } from "../extensions/log-messages";
import * as os from 'os';


type LogType = 'Gravity' | 'Rhino';

interface SplitLogLine {
    logType: LogType;
    message: string;
}

export class ServerLogParser{


    public static parseServerLog(log: string): Set<RhinoLogMessage | GravityLogMessage>{
        let messages = new Set<RhinoLogMessage|GravityLogMessage>();
        if(!log){
            console.warn('Warning - Log is null or empty!');
            return messages;
        }
        
        let splitLogLines = this.splitServerLog(log);

        splitLogLines.forEach(splitLogLine => 
            messages.add(this.buildLogMessage(splitLogLine)));
    
    
        return messages;
    }

    private static buildLogMessage(splitLogLine: SplitLogLine) : RhinoLogMessage | GravityLogMessage{
        switch(splitLogLine.logType){
            case 'Gravity':
                return this.buildGravityLog(splitLogLine.message);
            case 'Rhino':
                return this.buildRhinoLog(splitLogLine.message);
        }
    }

    private static buildRhinoLog(logMessage: string): RhinoLogMessage {
        
        try{
            let rhinoLog: RhinoLogMessage = {
                loggerName: this.getFirstRegexMatch(logMessage.match(/(?<=Logger(\s)*: ).*$/gm)),
                timeStamp: this.getFirstRegexMatch(logMessage.match(/(?<=TimeStamp(\s)*: ).*$/gm)),
                machineName: this.getFirstRegexMatch(logMessage.match(/(?<=MachineName(\s)*: ).*$/gm)),
                source: this.getFirstRegexMatch(logMessage.match(/(?<=Application(\s)*: ).*$/gm)),
                //TODO: Implement check for correct log levels per message type.
                level: this.getFirstRegexMatch(logMessage.match(/(?<=LogLevel(\s)*: ).*$/gm)),
                message: this.getFirstRegexMatch(logMessage.match(/(?<=Message(\s)*: ).*$/gm)),
                formattedMessage: logMessage
            };

            return rhinoLog;
        }
        catch(error){
            console.error(`Failed to build Rhino Log message\n${error}`);
            let emptyMessage: RhinoLogMessage = {
                loggerName: "",
                timeStamp: "",
                machineName: "",
                source: "",
                level: "",
                message: "",
                formattedMessage: ""
            }
            return emptyMessage;
        }
        
    }

    private static getFirstRegexMatch(regexMatch: RegExpMatchArray | null): string{
        return regexMatch ? regexMatch[0] : "";
    }

    private static buildGravityLog(logMessage: string): GravityLogMessage{
        
        try{
            let source = this.getFirstRegexMatch(logMessage.match(/^([^\s]+)/g));
            if(!gravityLogStartText.some(element => gravityLog.source == element)){
                console.warn(`${source} is an unrecognized Gravity Log Source`);
            }
            //TODO: Implement check for correct log levels per message type.
            let level = this.getFirstRegexMatch(logMessage.match(/(?<=(\s))\w+(?=:)/gm));
            let message = this.getFirstRegexMatch(logMessage.match(/(?<=(: )).*/gs));

            let gravityLog: GravityLogMessage = {
                source: source,
                
                level: level,
                message: message,
                formattedMessage: logMessage
            };
            return gravityLog;
        }
        catch(error){
            console.error(`Failed to build Gravity Log message\n${error}`);
            let emptyMessage: GravityLogMessage = {
                source: "",
                level: "",
                message: "",
                formattedMessage: ""
            }
            return emptyMessage;
        }

        
    }

    private static splitServerLog(log: string): SplitLogLine[]{
        let separatedMessages: SplitLogLine[] = [];
        
        if(!log){
            console.warn('Warning - Log is null or empty!');
            return separatedMessages;
        }
        let logMessage: SplitLogLine;
        let logLines = log.split(/\r\n|\r|\n/);

        logLines.forEach((line) => {
            let logType = this.findLogType(line);
            if(logType){
                if(logMessage){
                    separatedMessages.push(logMessage);
                }
                
                logMessage = {logType: logType, message: line + os.EOL};
            }
            else if(logMessage?.message){
                logMessage.message += line + os.EOL;
            }          
        });

        return separatedMessages;
    }

    private static findLogType(logLine: string) : LogType | undefined{
        if(this.isRhinoLogStart(logLine)){
            return 'Rhino';
        }
        else if(this.isGravityLogStart(logLine)){
            return 'Gravity';
        }
    }
    
    private static isRhinoLogStart(logLine: string): boolean{
        return rhinoLogStartText.some(element => logLine.startsWith(element));
    }

    private static isGravityLogStart(logLine: string): boolean{
        return gravityLogStartText.some(element => logLine.startsWith(element));
    }
}