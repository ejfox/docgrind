---
title: "Reference Global_objects Boolean Valueof"
slug: "reference-global_objects-boolean-valueof"
path: "reference/global_objects/boolean/valueof/index.md"
wordCount: 130
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.506Z"
---


The **`valueOf()`** method of {{jsxref("Boolean")}} values returns the primitive value of a
{{jsxref("Boolean")}} object.

{{InteractiveExample("JavaScript Demo: Boolean.prototype.valueOf()")}}

```js interactive-example
const x = new Boolean();

console.log(x.valueOf());
// Expected output: false

const y = new Boolean("Mozilla");

console.log(y.valueOf());
// Expected output: true
```

## Syntax

```js-nolint
valueOf()
```

### Parameters

None.

### Return value

The primitive value of the given {{jsxref("Boolean")}} object.

## Description

The `valueOf()` method of {{jsxref("Boolean")}} returns the primitive value
of a `Boolean` object or literal `Boolean` as a Boolean data type.

This method is usually called internally by JavaScript and not explicitly in code.

## Examples

### Using `valueOf()`

```js
const x = new Boolean();
const myVar = x.valueOf(); // assigns false to myVar
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Object.prototype.valueOf()")}}
