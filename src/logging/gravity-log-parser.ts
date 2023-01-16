import { Utilities } from "../extensions/utilities";
import { GravityLogMessage,  isLogLevelName } from "./log-models";

export class GravityLogParser{

    public static readonly gravityLogStartText = ['Rhino.Agent'] as const;

    private static readonly gravityLogTokens = {
        SourceToken: /^([^\s]+)/g,
        LogLevelToken: /(?<=(\s))\w+(?=:)/gm,
        MessageToken: /(?<=( - )).*/gs,
        TimestampToken: /(?<=(: ))[0-9.]+(?=( -))/g
    }

    public static buildGravityLog(logMessage: string): GravityLogMessage | undefined{
        
        //Timestamp and Message tokens are still pending possible changes due changes Roei does on Gravity side.
        const gravityLogTokens = {
            SourceToken: /^([^\s]+)/g,
            LogLevelToken: /(?<=(\s))\w+(?=:)/gm,
            MessageToken: /(?<=( - )).*/gs,
            TimestampToken: /(?<=(: ))[0-9.]+(?=( -))/g
        }
        try{
            let source = GravityLogParser.findGravitySource(logMessage, gravityLogTokens);
            if(!GravityLogParser.gravityLogStartText.some(element => source == element)){
                console.warn(`${source} is an unrecognized Gravity Log Source`);
            }
            let level = GravityLogParser.findGravityLogLevel(logMessage, gravityLogTokens);
            let timeStamp = GravityLogParser.findGravityTimestamp(logMessage, gravityLogTokens);
            let message = GravityLogParser.findGravityMessage(logMessage, gravityLogTokens);

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
            throw new Error(`Failed to build Gravity Log message\n${error}`);
            // console.error(`Failed to build Gravity Log message\n${error}`);
        }

        
    }

    public static findGravitySource(logMessage: string, gravityLogTokens: { SourceToken: RegExp; LogLevelToken: RegExp; MessageToken: RegExp; TimestampToken: RegExp; }) {
        return Utilities.getFirstRegexMatch(logMessage.match(gravityLogTokens.SourceToken));
    }

    public static findGravityMessage(logMessage: string, gravityLogTokens: { SourceToken: RegExp; LogLevelToken: RegExp; MessageToken: RegExp; TimestampToken: RegExp; }) {
        return Utilities.getFirstRegexMatch(logMessage.match(gravityLogTokens.MessageToken));
    }

    public static findGravityTimestamp(logMessage: string, gravityLogTokens: { SourceToken: RegExp; LogLevelToken: RegExp; MessageToken: RegExp; TimestampToken: RegExp; }) {
        return Utilities.getFirstRegexMatch(logMessage.match(gravityLogTokens.TimestampToken));
    }

    public static findGravityLogLevel(logMessage: string, gravityLogTokens: { SourceToken: RegExp; LogLevelToken: RegExp; MessageToken: RegExp; TimestampToken: RegExp; }) {
        return Utilities.getFirstRegexMatch(logMessage.match(gravityLogTokens.LogLevelToken)).toUpperCase();
    }

    public static isGravityLogStart(logLine: string): boolean{
        return GravityLogParser.gravityLogStartText.some(element => logLine.startsWith(element));
    }
}