---
title: "Reference Global_objects Error Columnnumber"
slug: "reference-global_objects-error-columnnumber"
path: "reference/global_objects/error/columnnumber/index.md"
wordCount: 77
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-07-06T19:32:45.593Z"
---


{{JSRef}} {{Non-standard_Header}}

The **`columnNumber`** data property of an {{jsxref("Error")}} instance contains the column number in the line of the file that raised this error.

## Value

A positive integer.

{{js_property_attributes(1, 0, 1)}}

## Examples

### Using columnNumber

```js
try {
  throw new Error("Could not parse input");
} catch (err) {
  console.log(err.columnNumber); // 9
}
```

## Specifications

Not part of any standard.

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Error.prototype.stack")}}
- {{jsxref("Error.prototype.lineNumber")}}
- {{jsxref("Error.prototype.fileName")}}
