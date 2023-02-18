# RSI (Rhino Semantic Interface) Overview

[Table of Content](./Home.md)  

30 min · Module · [Rhino Community](https://github.com/savanna-projects) · Level ★★★☆☆

`Beginner` `Rhino` `Automation`

## Learning objectives

In this module, you will:

* Understand RSI (Rhino Semantic Interface).
* Understand Rhino Language Default Schema.
* Understand different use cases for actions and assertions.
* Understand the different tokens and verbs the are used to identify them.

## Prerequisites

None.

## Units

> [RSI - Rhino Semantic Interface](#rsi---rhino-semantic-interface)  
  ★☆☆☆☆ 10 min
>  
> [Default Schema](#default-schema)  
  ★☆☆☆☆ 10 min
>  
> [Tokens & Verbs](#tokens--verbs)  
  ★★☆☆☆ 10 min

## RSI - Rhino Semantic Interface

[Back](#units)

`RSI` or `Rhino Semantic Interface` was designed to deliver an abstract, human readable interface for describing actions chain. you can consider `RSI` as a markup language similar to `YAML` or `XML`. It has a [schema](#default-schema), simple syntax and basic rules to follow.

`RSI` describes a sequence of actions, instructions of how to perform them and what parameters and values to pass to these actions - if needed. Each action in the chain is completely isolated from the other actions and it runs as a standalone component inside an isolated `sandbox`.

The `RSI`, in contrast to other markup languages does not rely on fields to identify the elements the user provides, rather it relies on semantics and verbs, consider the following example which describes a simple click action using various markup languages with the equivalent `RSI` expression:  

### Action Example

#### RSI

```none
[test-actions]
click on {#element_id} using {css selector}
```

#### YAML

```yaml
- testActions: My Actions Chain
  - action:
    inputs:
      type: 'Click'
      onElement: '#element_id'
      locator: 'CssSelector'
```

#### XML

```xml
<testActions>
    <action>
        <type>Click</type>
        <onElement>#element_id</onElement>
        <locator>CssSelector</locator>
    </action>
</testActions>
```

#### JSON

```json
{
    "testActions":[
        {
            "type": "Click",
            "onElement": "#element_id",
            "locator": "CssSelector"
        }
    ]
}
```

## Default Schema

[Back](#units)

`RSI` follows a simple schema and some basic rules and guideline which includes **verbs** to identify the different schema fields.

### Naming/Writing Conventions

Naming conventions is a way to provide a unified way of writing when working in groups. It is designed to keep things clear and understandable for the team members and shorten the on board for new members. Please refer to the following table to understand the common conventions.  

| Name         | Description                                                                                                                                        | Examples                   |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| `camelCase`  | The first letter of the first word is **lower case** and the first letter of every other word is **upper case**. No spaces.                        | `fooBar`, `oneTwoThree`    |
| `PascalCase` | Every first letter of a word is **upper case**. No spaces.                                                                                         | `FooBar`, `OneTwoThree`    |
| `space case` | Every word is **lower case** and there is one space between words.                                                                                 | `foo bar`, `one two three` |
| `Title Case` | All of the major words begin with capital letters. Minor words like prepositions, articles, and coordinating conjunctions are typically lowercase. | `Foo Bar`, `One Two Three` |
| `kebab-case` | Every word is **lower case** and there is one **hyphen** between words.                                                                            | `foo-bar`, `one-two-three` |
| `snake_case` | Every word is **lower case** and there is one **underscore** between words.                                                                        | `foo_bar`, `one_two_three` |

### Fields & Verbs

`RSI` verbs are used to identify the schema fields. Each field is identified by one or more verbs.  
  
> _**INFORMATION**_
>  
> It does not matter which verb you choose to use to identify the desired field and the only reason for multiple verbs is to make the sentence more readable.
>  
> `click on {element}` and `click into {element}` are identical and will work in the same way, the difference is that the 2nd phrase is less readable.

#### `action` Field - Mandatory

Verbs: None.  
  
The action to perform. This will be the action name as a [space case](#namingwriting-conventions) e.g., `click`, `send keys`, `send get request`.
Action field does not need a verb and it is automatically identified.  
  
A list of all available actions can be retrieved from the following address <http://server-address:port/api/v3/meta/plugins/references>

#### `onElement` Field - Optional

Verbs: `on`, `into`, `of`, `take`, `to`  
  
The subject (element or entity) to perform the action on. This can vary, depends on the action implementation and can be a UI element, web address, etc.
This field is optional and there are no restrictions to implement it when creating an action, please see the following examples:  

* `click on {element}` - clicks on an element provided under the `onElement` filed and identified by the `on` verb.
* `click` - click on the last known location on the physical screen - no element provided.

#### `onAttribute` Field - Optional

Verbs: `from`  
  
The subject (element or entity) to take additional information from. This can vary, depends on the action implementation and can be a UI element, web address, etc.
This field is optional and there are not restrictions to implement it when creating an action, please see the following examples:  
  
* `go to url {https://notarealaddress.io}` - Navigate to the URL provided by the user under the [`argument`](#argument-field---optional) field.
* `go to url take {element} from {href}` - Navigate to the URL that found under the `href` attribute of the element provided by the user.

#### `argument` Field - Optional

Verbs: None.  
  
Additional information to pass with the action. Arguments can be flat or integrated, depends on the specific action implementation. There is no need for verbs to identify argument field.  

* `go to url {https://notarealaddress.io}` - The argument filed pass the URL needed for the action to run.
* `go to url {{$ --url:https://notarealaddress.io --blank}}` - the argument is an integrated argument that can pass multiple parameters, in that case to open the URL in a new tab.

#### `locator` Field - Optional

Verbs: `using`, `by`

This filed is mostly used by UI actions and it is desired to pass additional information about how to located the desired UI element.  

* `click on {element} using {id}` - will click on an element using the `id` locator.
* `click on {element}` - if this filed was not provided the default locator will be `xpath`.

#### `regularExpression` Field - Optional

Verbs: `pattern`, `filter`, `regex`

This field was designed to allow manipulation on the values before the value is passed in to action by providing a [regular expression](https://www.regular-expressions.info/tutorial.html).  

* `go to url take {element} filter {(http(s)?:\/\/)www.*io}` - Navigate to a URL which can be found under a text of the provided element. The regular expression allows you to extract only the URL from the text before passing it to the action.

## Tokens & Verbs

[Back](#units)

`RSI` phrase is deviled into tokens. Each token identifies a [schema filed](#fields--verbs). There is no meaning to the tokens order and they can be written in any order as long as the schema rules are not violated.

### Token Grammar

`[action] {argument} [on|into|of|take|to] {element} [from] {attribute} [by|using] {locator} [filter|pattern|regex] {regular expression}`  

* `action` field must be a space case convention of the action name, e.g., if the action name is `SendKeys` the `RSI` version will be `send keys`.
* `argument` filed have no verbs and must be surrounded by **curly brackets**.
* `onElement`, `onAttribute`, `locator` & `regularExpression` fields must be identified by [one of their verbs](#fields--verbs) and must be surrounded by **curly brackets**.

#### Examples

* `go to url {https://notarealaddress.io}` - action and argument.
* `go to url take {element} by {id}` - action, element and locator (will take url from the element text).
* `go to url {{$ --blank}} take {element} by {id}` - action, argument, element and locator.
* `click` - action only.
* `click on {element}` - action and element (default locator).
* `invoke oracle query {SELECT * FROM myTable} on {connection string to database}` - action, argument and element and attribute.

## See Also

* [OpenProject Getting Started Guide](https://www.openproject.org/docs/getting-started/)
* [OpenProject API](https://www.openproject.org/docs/api/)
