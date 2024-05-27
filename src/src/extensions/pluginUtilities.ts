export class PluginUtilities{
    public static getPluginId(document: string[]): string {
        // not found
        if (document === undefined || document === null) {
            return '';
        }

        // setup
        let pattern = '^\\[test-id]';

        // get line number
        let onLine = 0;
        for (onLine; onLine < document.length; onLine++) {
            if (document[onLine].match(pattern) !== null) {
                break;
            }
        }

        // not found
        if (document === undefined || document === null) {
            return '';
        }

        // get
        return document[onLine]
            .replaceAll('[test-id]', '')
            .trim();
    }
}