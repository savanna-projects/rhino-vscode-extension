
# Google Search

[Home](../Home.md) · [Table of Content](./Home.md)  

5 min · Unit · [Roei Sabag](https://www.linkedin.com/in/roei-sabag-247aa18/) · Level ★★★☆☆

## Definition

| <!-- -->            | <!-- -->                       |
|---------------------|--------------------------------|
| **Namespace:**      | `Plugins.Examples`             |
| **File:**           | `GoogleSearch.rhino`           |
| **Specifications:** | `/api/v3/plugins/GoogleSearch` |

## Description

Invokes the `GoogleSearch` routine.  

1. Type a keyword into the `Google Search` text-box.
2. Click on the first `auto-complete` item.
3. Wait for the results to be retrieved.

## Prerequisites

1. Stable internet connection.
2. Access to `google.com` is not restricted by a proxy or firewall.

## Nested Plugins

None.

## Scope

1. Google Search Engine

## Properties

| Property    | Description                                        |
|-------------|----------------------------------------------------|
|`onAttribute`|The keyword to use when invoking the search routine.|

## Parameters

None.

## Examples

### Example No.1

The following example demonstrate how to find results when searching for `Automation` keyword.  

```none
google search {Automation}
```
