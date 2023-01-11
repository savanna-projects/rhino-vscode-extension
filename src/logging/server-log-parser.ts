import { GravityLogMessage, gravityLogStartText, isLogLevelName, LogLevel, LogLevelName, LogMessage, RhinoLogMessage, rhinoLogStartText } from "./log-models";
import * as os from 'os';


type LogType = 'Gravity' | 'Rhino';

interface SplitLogLine {
    logType: LogType;
    message: string;
}

export class ServerLogParser{

    
    public static parseServerLog(log: string): LogMessage[]{
        let messages: LogMessage[] = [];
        if(!log){
            console.warn('Warning - Log is null or empty!');
            return messages;
        }
        
        let splitLogLines = this.splitServerLog(log);

        splitLogLines.forEach(splitLogLine => {
            let messageObject = this.buildLogMessage(splitLogLine);
            if(messageObject){
                messages.push(messageObject);
            }
        });
    
    
        return messages;
    }

    private static buildLogMessage(splitLogLine: SplitLogLine) : RhinoLogMessage | GravityLogMessage | undefined{
        switch(splitLogLine.logType){
            case 'Gravity':
                return this.buildGravityLog(splitLogLine.message);
            case 'Rhino':
                return this.buildRhinoLog(splitLogLine.message);
        }
    }

    private static buildRhinoLog(logMessage: string): RhinoLogMessage | undefined {
        
        const rhinoLogTokens = {
            ApplicationToken: /(?<=Application(\s)*: ).*$/gm,
            LoggerNameToken: /(?<=Logger(\s)*: ).*$/gm,
            TimestampToken: /(?<=TimeStamp(\s)*: ).*$/gm,
            LogLevelToken: /(?<=LogLevel(\s)*: ).*$/gm,
            MessageToken: /(?<=Message(\s)*: ).*$/gm,
            ExceptionToken: /(?<=Exception(\s)*: ).*$/gm,
            MachineNameToken: /(?<=MachineName(\s)*: ).*$/gm
        }

        try{
            let logLevel = this.getFirstRegexMatch(logMessage.match(rhinoLogTokens.LogLevelToken)).toUpperCase();
            let application = this.getFirstRegexMatch(logMessage.match(rhinoLogTokens.ApplicationToken));
            let loggerName = this.getFirstRegexMatch(logMessage.match(rhinoLogTokens.LoggerNameToken));
            
            let rhinoLog: RhinoLogMessage = {
                loggerName: loggerName != '' ? loggerName : undefined,
                timeStamp: this.getFirstRegexMatch(logMessage.match(rhinoLogTokens.TimestampToken)),
                machineName: this.getFirstRegexMatch(logMessage.match(rhinoLogTokens.MachineNameToken)),
                application: application,
                source: `${application}` + (loggerName  ? `.${loggerName}` : ''),
                level: isLogLevelName(logLevel) ? logLevel : 'TRACE',
                message: this.getFirstRegexMatch(logMessage.match(rhinoLogTokens.MessageToken)),
                formattedMessage: logMessage
            };
            let exception = this.getFirstRegexMatch(logMessage.match(rhinoLogTokens.ExceptionToken));
            if(exception != ''){
                rhinoLog.exception = exception;
            }
            return rhinoLog;
        }
        catch(error){
            console.error(`Failed to build Rhino Log message\n${error}`);
        }
        
    }

    private static getFirstRegexMatch(regexMatch: RegExpMatchArray | null): string{
        return regexMatch ? regexMatch[0] : "";
    }

    private static buildGravityLog(logMessage: string): GravityLogMessage | undefined{
        
        //Timestamp and Message tokens are still pending possible changes due changes Roei does on Gravity side.
        const gravityLogTokens = {
            SourceToken: /^([^\s]+)/g,
            LogLevelToken: /(?<=(\s))\w+(?=:)/gm,
            MessageToken: /(?<=( - )).*/gs,
            TimestampToken: /(?<=(: ))[0-9.]+(?=( -))/g
        }
        try{
            let source = this.getFirstRegexMatch(logMessage.match(gravityLogTokens.SourceToken));
            // let source = this.getFirstRegexMatch(logMessage.match(/^([^\s]+)/g));
            if(!gravityLogStartText.some(element => source == element)){
                console.warn(`${source} is an unrecognized Gravity Log Source`);
            }
            let level = this.getFirstRegexMatch(logMessage.match(gravityLogTokens.LogLevelToken)).toUpperCase();
            let timeStamp = this.getFirstRegexMatch(logMessage.match(gravityLogTokens.TimestampToken));
            let message = this.getFirstRegexMatch(logMessage.match(gravityLogTokens.MessageToken));

            let gravityLog: GravityLogMessage = {
                source: source,
                timeStamp: timeStamp,
                level: isLogLevelName(level) ? level : 'TRACE',
                message: message,
                formattedMessage: logMessage
            };
            return gravityLog;
        }
        catch(error){
            console.error(`Failed to build Gravity Log message\n${error}`);
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