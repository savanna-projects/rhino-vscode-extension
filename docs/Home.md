# Building Blocks Overview
08/04/2021 · 10 minutes to read · [Roei Sabag](https://www.linkedin.com/in/roei-sabag-247aa18/)  

## In This Article
* item 1
* item 2
* item 3

Building blocks are the core component of Rhino API (including the underline Gravity engine) and can be divided into several groups and types. We start to build our automation block by using the lowest blocks possible and we move up, using or creating higher and more business oriented blocks.

## Core Building Blocks
> :information_source:
>
> You cannot add core blocks and they cannot be customized nor change.  

The core building blocks are the most basic blocks and used for building an action block. There are 6 core blocks and all actions are built using these blocks.

|Block            |Description                                                           |Role                                                   |
|-----------------|----------------------------------------------------------------------|-------------------------------------------------------|
|Action           |The block name (e.g. `click`, `send keys`, etc.).                     |Mandatory! identifies the block to invoke.             |
|Argument         |A command line based argument to pass to the block when invoked.      |Used for implementing a `free style` block arguments.  |
|Element          |The element identifier by which to find the element used by the block.|Element identifier. Value depends on `Locator` block.  |
|Locator          |The element identifier type (e.g. `id`, `xpath`, etc.)                |Used in conjunction with the `Element` block.          |
|Attribute        |The element attribute used by the block.                              |Used as an extra information when the block is invoked.|
|RegularExpression|An extra layer for refining the action or result of the block.        |Used as an extra information when the block is invoked.|

```
┌[Action Block]─────────────────┐
│ ┌────────────┐ ┌────────────┐ │
│ │ Core Block │ │ Core Block │ │
│ └────────────┘ └────────────┘ │
│                               │
│ ┌────────────┐ ┌────────────┐ │
│ │ Core Block │ │ Core Block │ │
│ └────────────┘ └────────────┘ │
└───────────────────────────────┘
```

### Basic Examples
Using an action with a basic argument. This is the simplest way of `go to url` block calling using the schema `<action> <argument>`.
```
go to url {https://github.com}
```  

Using an action with CLI argument. This calling is using the advanced options of `go to url` block using the schema `<action> <argument>`. On this case, opening the url in a new tab or window.
```
go to url {{$ --url:https://github.com --blank}}
```


## item 2

## item 3
