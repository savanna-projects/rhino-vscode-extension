import { Utilities } from "../extensions/utilities";
import { RhinoLogMessage } from "./log-models";
import { isLogLevelName } from "./log-models-typeguards";


/**
 * Class to handle parsing of a log message to a RhinoLogMessage
 */
export class RhinoLogParser{

    public static readonly rhinoLogStartText = ['DBG', 'ERR', 'FTL', 'INF', 'TRC', 'WRN'] as const;

    private static readonly rhinoLogTokens = {
        ApplicationToken: /(?<=Application(\s)*: ).*$/gm,
        LoggerNameToken: /(?<=Logger(\s)*: ).*$/gm,
        TimestampToken: /(?<=TimeStamp(\s)*: ).*$/gm,
        LogLevelToken: /(?<=LogLevel(\s)*: ).*$/gm,
        MessageToken: /(?<=Message(\s)*: ).*$/gm,
        ExceptionToken: /(?<=----------------\n- (Exception\(s\)) -\n----------------\n).*$/gs,
        MachineNameToken: /(?<=MachineName(\s)*: ).*$/gm
    }
    public static buildRhinoLog(logMessage: string): RhinoLogMessage | undefined {
        try{
            let application = RhinoLogParser.findRhinoApplication(logMessage);
            let loggerName = RhinoLogParser.findRhinoLoggerName(logMessage);
            
            let rhinoLog: RhinoLogMessage = {
                loggerName: loggerName != '' ? loggerName : undefined,
                timeStamp: RhinoLogParser.findRhinoTimestamp(logMessage),
                machineName: RhinoLogParser.findRhinoMachineName(logMessage),
                application: application,
                source: `${application}` + (loggerName  ? `.${loggerName}` : ''),
                level: RhinoLogParser.getRhinoLogLevel(logMessage),
                message: RhinoLogParser.findRhinoMessage(logMessage),
                formattedMessage: logMessage
            };
            let exception = RhinoLogParser.findRhinoException(logMessage);
            if(exception != ''){
                rhinoLog.exception = exception;
            }
            return rhinoLog;
        }
        catch(error){
            throw new Error(`Failed to build Rhino Log message\n${error}`)
        }
        
    }

    private static findRhinoException(logMessage: string) {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.ExceptionToken));
    }

    public static findRhinoMessage(logMessage: string): string {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.MessageToken));
    }

    public static findRhinoMachineName(logMessage: string): string {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.MachineNameToken));
    }

    public static findRhinoTimestamp(logMessage: string): string {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.TimestampToken));
    }

    public static findRhinoLoggerName(logMessage: string) {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.LoggerNameToken));
    }

    public static findRhinoApplication(logMessage: string) {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.ApplicationToken));
    }
    /**
     * Attempts to find the Rhino Log Level from the log message. If successful, returns it, otherwise returns 'TRACE'
     * @param logMessage 
     * @returns 
     */
    public static getRhinoLogLevel(logMessage: string) {
        let logLevel = Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.LogLevelToken)).toUpperCase();
        return isLogLevelName(logLevel) ? logLevel : 'TRACE'
    }

    public static isRhinoLogStart(logLine: string): boolean{
        return RhinoLogParser.rhinoLogStartText.some(element => logLine.startsWith(element));
    }

    public static parseRhinoTimestamp(timestamp: string){
        let elements = timestamp.split(/[-\s:.]/g);
        if(!elements.every(x=> x != '')){
            console.warn(`Empty strings while splitting '${timestamp}'`);
        }
        let years = Number.parseInt(elements[0]);
        let months = Number.parseInt(elements[1]);
        // months = months > 0 ? months - 1 : months;
        let days = Number.parseInt(elements[2]);
        let hours = Number.parseInt(elements[3]);
        let minutes = Number.parseInt(elements[4]);
        let seconds = Number.parseInt(elements[5]);
        let milliseconds = Number.parseInt(elements[6]);
        return new Date(years, months - 1, days, hours, minutes, seconds, milliseconds);
    }

}