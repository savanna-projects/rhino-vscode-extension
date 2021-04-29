/**
 * Summary. Check if the string is a valid JSON.
 */
String.prototype.isJson = function(): boolean {
    // bad request
    if(!(this && typeof this === "string")){
        return false;
    }

    // get
    try {
       JSON.parse(this);
       return true;
    } catch(error) {
        return false;
    }
};

/**
 * Returns a new string in which all occurrences of a specified Unicode character
 * or String in the current string are replaced with another specified Unicode character or String.
 */
String.prototype.replaceAll = function(oldValue: string, newValue: string): String {
    // setup
    var str = this;

    // iterate
    while (str.includes(oldValue)) {
        str = str.replace(oldValue, newValue);
    }
    
    // get
    return str;
};