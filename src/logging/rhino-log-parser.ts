import { Utilities } from "../extensions/utilities";
import { LogLevel, LogLevelName, rhinoLogLevelNames, RhinoLogMessage } from "./log-models";
import { isLogLevelName } from "./log-models-typeguards";


/**
 * Class to handle parsing of a log message to a RhinoLogMessage
 */
export class RhinoLogParser {
    public static readonly rhinoLogStartText = ['DBG', 'ERR', 'FTL', 'INF', 'TRC', 'WRN'] as const;

    private static readonly rhinoLogTokens = {
        applicationToken: /(?<=Application(\s)*: ).*$/gm,
        loggerNameToken: /(?<=Logger(\s)*: ).*$/gm,
        timestampToken: /(?<=TimeStamp(\s)*: ).*$/gm,
        logLevelToken: /(?<=LogLevel(\s)*: ).*$/gm,
        messageToken: /(?<=Message(\s)*: ).*$/gm,
        exceptionToken: /(?<=-{16}\n-\s(Exception\(s\))\s-\n-{16}\n).*$/gs,
        machineNameToken: /(?<=MachineName(\s)*: ).*$/gm
    };

    public static buildRhinoLog(logMessage: string): RhinoLogMessage | undefined {
        try {
            let application = RhinoLogParser.findRhinoApplication(logMessage);
            let loggerName = RhinoLogParser.findRhinoLoggerName(logMessage);

            let rhinoLog: RhinoLogMessage = {
                loggerName: loggerName !== '' ? loggerName : undefined,
                timeStamp: RhinoLogParser.findRhinoTimestamp(logMessage),
                machineName: RhinoLogParser.findRhinoMachineName(logMessage),
                application: application,
                source: `${application}` + (loggerName ? `.${loggerName}` : ''),
                level: RhinoLogParser.getRhinoLogLevel(logMessage),
                message: RhinoLogParser.findRhinoMessage(logMessage),
                formattedMessage: logMessage
            };

            let exception = RhinoLogParser.findRhinoException(logMessage);
            if (exception !== '') {
                rhinoLog.exception = exception;
            }

            return rhinoLog;
        }
        catch (error) {
            console.log(`Failed to build Rhino Log message\n${error}`);
        }
    }

    private static findRhinoException(logMessage: string) {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.exceptionToken));
    }

    public static findRhinoMessage(logMessage: string): string {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.messageToken));
    }

    public static findRhinoMachineName(logMessage: string): string {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.machineNameToken));
    }

    public static findRhinoTimestamp(logMessage: string): string {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.timestampToken));
    }

    public static findRhinoLoggerName(logMessage: string) {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.loggerNameToken));
    }

    public static findRhinoApplication(logMessage: string) {
        return Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.applicationToken));
    }

    /**
     * Attempts to find the Rhino Log Level from the log message. If successful, returns it, otherwise returns 'trace'.
     * 
     * @param logMessage 
     */
    public static getRhinoLogLevel(logMessage: string) {
        let logLevel = Utilities.getFirstRegexMatch(logMessage.match(RhinoLogParser.rhinoLogTokens.logLevelToken));
        logLevel = (Object.keys(rhinoLogLevelNames) as Array<LogLevelName>).find(key => rhinoLogLevelNames[key] === logLevel) ?? logLevel;

        if(!isLogLevelName(logLevel)){
            console.warn(`Unrecognized log level. ${logMessage}`);
        }
        return isLogLevelName(logLevel) ? logLevel : 'trace';
    }

    public static isRhinoLogStart(logLine: string): boolean {
        return RhinoLogParser.rhinoLogStartText.some(element => logLine.startsWith(element));
    }

    public static parseRhinoTimestamp(timestamp: string) {
        let elements = timestamp.split(/[-\s:.]/g);

        if (!elements.every(x => x !== '')) {
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