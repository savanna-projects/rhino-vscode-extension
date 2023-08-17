interface String {
    isJson(): boolean;
    replaceAll(oldValue: string, newValue: string): string;
}

/**
 * Returns a new string in which all occurrences of a specified Unicode character
 * or String in the current string are replaced with another specified Unicode character or String.
 */
String.prototype.replaceAll = function (oldValue: string, newValue: string): string {
    // setup
    let str = this;

    // iterate
    while (str.includes(oldValue)) {
        str = str.replace(oldValue, newValue);
    }

    // get
    return str.toString();
};
