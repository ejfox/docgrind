---
title: "Reference Global_objects Symbol Valueof"
slug: "reference-global_objects-symbol-valueof"
path: "reference/global_objects/symbol/valueof/index.md"
wordCount: 137
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:44.546Z"
---


The **`valueOf()`** method of {{jsxref("Symbol")}} values returns this symbol value.

{{InteractiveExample("JavaScript Demo: Symbol.prototype.valueOf()")}}

```js interactive-example
const symbol = Symbol("foo");

console.log(typeof Object(symbol));
// Expected output: "object"

console.log(typeof Object(symbol).valueOf());
// Expected output: "symbol"
```

## Syntax

```js-nolint
valueOf()
```

### Parameters

None.

### Return value

The primitive value of the specified {{jsxref("Symbol")}} object.

## Description

The `valueOf()` method of {{jsxref("Symbol")}} returns the primitive value of a Symbol object as a Symbol data type.

JavaScript calls the `valueOf()` method to convert an object to a primitive value. You rarely need to invoke the `valueOf()` method yourself; JavaScript automatically invokes it when encountering an object where a primitive value is expected.

## Examples

### Using valueOf()

```js
const sym = Symbol("example");
sym === sym.valueOf(); // true
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Object.prototype.valueOf()")}}
