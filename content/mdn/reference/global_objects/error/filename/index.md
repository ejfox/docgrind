---
title: "Reference Global_objects Error Filename"
slug: "reference-global_objects-error-filename"
path: "reference/global_objects/error/filename/index.md"
wordCount: 104
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-07-06T19:32:45.594Z"
---


{{JSRef}} {{Non-standard_Header}}

The **`fileName`** data property of an {{jsxref("Error")}} instance contains the path to the file that raised this error.

## Value

A string.

{{js_property_attributes(1, 0, 1)}}

## Description

This non-standard property contains the path to the file that raised this error. If called from a debugger context, the Firefox Developer Tools for example, "debugger eval code" is returned.

## Examples

### Using fileName

```js
const e = new Error("Could not parse input");
throw e;
// e.fileName could look like "file:///C:/example.html"
```

## Specifications

Not part of any standard.

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Error.prototype.stack")}}
- {{jsxref("Error.prototype.columnNumber")}}
- {{jsxref("Error.prototype.lineNumber")}}
