export class StringUtilities{
    public static decodeBase64(str: string): string
    {
        return Buffer.from(str, 'base64').toString('binary');
    }
    public static encodeBase64(str: string): string
    {
        return Buffer.from(str, 'binary').toString('base64');
    }
}