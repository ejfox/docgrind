---
title: "Reference Global_objects Bigint Valueof"
slug: "reference-global_objects-bigint-valueof"
path: "reference/global_objects/bigint/valueof/index.md"
wordCount: 85
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:44.080Z"
---


The **`valueOf()`** method of {{jsxref("BigInt")}} values returns the wrapped primitive value
of a {{jsxref("BigInt")}} object.

{{InteractiveExample("JavaScript Demo: BigInt.prototype.valueOf()", "shorter")}}

```js interactive-example
console.log(typeof Object(1n));
// Expected output: "object"

console.log(typeof Object(1n).valueOf());
// Expected output: "bigint"
```

## Syntax

```js-nolint
valueOf()
```

### Parameters

None.

### Return value

A BigInt representing the primitive value of the specified {{jsxref("BigInt")}} object.

## Examples

### Using `valueOf`

```js
typeof Object(1n); // object
typeof Object(1n).valueOf(); // bigint
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("BigInt.prototype.toString()")}}
