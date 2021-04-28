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