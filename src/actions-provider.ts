import * as vscode from 'vscode';

// TEMPLATES
const USING_TEMPLATE = "using {${2|bindings,class name,css selector,id,link text,model,name,partial link text,tag name|}}";
const ELEMENT_TEMPLATE = "on {#myElement} " + USING_TEMPLATE;

// TOOLTIPS
//-- C --
const TOOLTIP_CLICK =
    "Clicks the mouse at the last known mouse coordinates or on the specified element. " +
    "If the click causes a new page to load, the Click method will attempt to block until the page has loaded.";

const TOOLTIP_CLOSE_ALL_CHILD_WINDOWS = "Close all open tabs/windows and switch to the main (first) window.";
const TOOLTIP_CLOSE_BROWSER = "Quits this driver, closing every associated window.";
const TOOLTIP_CLOSE_WINDOW = "Close the given window, quitting the browser if it is the last window currently open.";
const TOOLTIP_CONTEXT_CLICK = "Right clicks the mouse at the last known mouse coordinates or on the specified element.";
const TOOLTIP_DOUBLE_CLICK =
    "Double clicks the mouse at the last known mouse coordinates or on the specified element. " +
    "If the click causes a new page to load, the ```OpenQA.Selenium.IWebElement.Click``` method will attempt to block until the page has loaded.";
const TOOLTIP_EXECUTE_SCRIPT = "Executes JavaScript in the context of the currently selected frame or window.";

const ACTIONS = [
    // CLICK
    { name: "click", snippet: "click", tooltip: TOOLTIP_CLICK },
    { name: "click on element", snippet: "click " + ELEMENT_TEMPLATE, tooltip: TOOLTIP_CLICK },
    { name: "click on element until", snippet: "click {{$ --until:${1|no_alert|}}} " + ELEMENT_TEMPLATE, tooltip: TOOLTIP_CLICK },
    // CLOSE
    { name: "close all child windows", snippet: "close all child windows", tooltip: TOOLTIP_CLOSE_ALL_CHILD_WINDOWS },
    { name: "close browser", snippet: "close browser", tooltip: TOOLTIP_CLOSE_BROWSER },
    { name: "close window", snippet: "close window", tooltip: TOOLTIP_CLOSE_WINDOW },
    // CONTEXT CLICK
    { name: "context click", snippet: "${1|context click,right click|}", tooltip: TOOLTIP_CONTEXT_CLICK },
    { name: "context click on element", snippet: "${1|context click,right click|} " + ELEMENT_TEMPLATE, tooltip: TOOLTIP_CONTEXT_CLICK },
    // DOUBLE CLICK
    { name: "double click", snippet: "double click", tooltip: TOOLTIP_DOUBLE_CLICK },
    { name: "double click on element", snippet: "double click " + ELEMENT_TEMPLATE, tooltip: TOOLTIP_DOUBLE_CLICK },
    // DOWNLOAD
    { name: "download resources", snippet: "", tooltip: "" },
    // EXECUTE SCRIPT    
    { name: "execute script", snippet: "execute script {console.log('hello world!');}", tooltip: TOOLTIP_EXECUTE_SCRIPT },
    { name: "execute script on element", snippet: "execute script {arguments[0].click();} " + ELEMENT_TEMPLATE, tooltip: TOOLTIP_EXECUTE_SCRIPT },
    { name: "set geo location", snippet: "", tooltip: "" },
    { name: "get screenshot", snippet: "", tooltip: "" },
    { name: "go to url", snippet: "", tooltip: "" },
    { name: "hide keyboard", snippet: "", tooltip: "" },
    { name: "keyboard", snippet: "", tooltip: "" },
    { name: "long swipe", snippet: "", tooltip: "" },
    { name: "move to element", snippet: "", tooltip: "" },
    { name: "navigate back", snippet: "", tooltip: "" },
    { name: "navigate forward", snippet: "", tooltip: "" },
    { name: "refresh", snippet: "", tooltip: "" },
    { name: "register parameter", snippet: "", tooltip: "" },
    { name: "repeat", snippet: "", tooltip: "" },
    { name: "scroll", snippet: "", tooltip: "" },
    { name: "select from combo box", snippet: "", tooltip: "" },
    { name: "send keys", snippet: "", tooltip: "" },
    { name: "submit form", snippet: "", tooltip: "" },
    { name: "swipe", snippet: "", tooltip: "" },
    { name: "switch to alert", snippet: "", tooltip: "" },
    { name: "switch to default content", snippet: "", tooltip: "" },
    { name: "switch to frame", snippet: "", tooltip: "" },
    { name: "switch to window", snippet: "", tooltip: "" },
    { name: "try click", snippet: "", tooltip: "" },
    { name: "try send keys", snippet: "", tooltip: "" },
    { name: "upload file", snippet: "", tooltip: "" },
    { name: "wait", snippet: "", tooltip: "" },
    { name: "wait for element", snippet: "", tooltip: "" },
    { name: "wait for page", snippet: "", tooltip: "" },
    { name: "wait for url", snippet: "", tooltip: "" },
];

export class RhinoActionsProvider {
    // gets all 
    public static get() {
        let provieders = [];

        for (let index = 0; index < ACTIONS.length; index++) {
            const completion = new vscode.CompletionItem(ACTIONS[index].name);
            completion.insertText = new vscode.SnippetString(ACTIONS[index].snippet);
            completion.documentation = new vscode.MarkdownString(ACTIONS[index].tooltip);

            provieders.push(completion);
        }
        return provieders;
    }
}