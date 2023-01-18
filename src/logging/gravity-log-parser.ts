import { Utilities } from "../extensions/utilities";
import { GravityLogMessage } from "./log-models";
import { isLogLevelName } from "./log-models-typeguards";

export class GravityLogParser {
    public static readonly gravityLogStartText = ['Rhino.Agent'] as const;

    private static readonly gravityLogTokens = {
        sourceToken: /^([^\s]+)/g,
        logLevelToken: /(?<=(\s))\w+(?=:)/gm,
        messageToken: /(?<=( - )).*/gs,
        // TODO: Timestamp and Message tokens are still pending possible changes.
        timestampToken: /(?<=(: ))[0-9.]+(?=( -))/g
    };

    public static buildGravityLog(logMessage: string): GravityLogMessage | undefined {
        try {
            let source = GravityLogParser.findGravitySource(logMessage);
            if (!GravityLogParser.gravityLogStartText.some(element => source === element)) {
                console.warn(`${source} is an unrecognized Gravity Log Source`);
            }
            let level = GravityLogParser.findGravityLogLevel(logMessage);
            let timeStamp = GravityLogParser.findGravityTimestamp(logMessage);
            let message = GravityLogParser.findGravityMessage(logMessage);

            let gravityLog: GravityLogMessage = {
                source: source,
                timeStamp: timeStamp,
                level: isLogLevelName(level) ? level : 'trace',
                message: message,
                formattedMessage: logMessage
            };
            return gravityLog;
        }
        catch (error) {
            throw new Error(`Failed to build Gravity Log message\n${error}`);
        }
    }

    public static findGravitySource(logMessage: string) {
        return Utilities.getFirstRegexMatch(logMessage.match(GravityLogParser.gravityLogTokens.sourceToken));
    }

    public static findGravityMessage(logMessage: string) {
        return Utilities.getFirstRegexMatch(logMessage.match(GravityLogParser.gravityLogTokens.messageToken));
    }

    public static findGravityTimestamp(logMessage: string) {
        return Utilities.getFirstRegexMatch(logMessage.match(GravityLogParser.gravityLogTokens.timestampToken));
    }

    public static findGravityLogLevel(logMessage: string) {
        return Utilities.getFirstRegexMatch(logMessage.match(GravityLogParser.gravityLogTokens.logLevelToken)).toLowerCase();
    }

    public static isGravityLogStart(logLine: string): boolean {
        return GravityLogParser.gravityLogStartText.some(element => logLine.startsWith(element));
    }

    public static parseGravityTimestamp(timestamp: string) {
        let elements = timestamp.split('.');

        if (!elements.every(x => x !== '')) {
            console.warn(`Empty strings while splitting '${timestamp}'`);
        }

        let years = Number.parseInt(elements[0]);
        let months = Number.parseInt(elements[1]);
        let days = Number.parseInt(elements[2]);
        let hours = Number.parseInt(elements[3]);
        let minutes = Number.parseInt(elements[4]);
        let seconds = Number.parseInt(elements[5]);
        let milliseconds = Number.parseInt(elements[6]);

        return new Date(years, months - 1, days, hours, minutes, seconds, milliseconds);
    }
}