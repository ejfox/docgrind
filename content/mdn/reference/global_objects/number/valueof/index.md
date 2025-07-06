---
title: "Reference Global_objects Number Valueof"
slug: "reference-global_objects-number-valueof"
path: "reference/global_objects/number/valueof/index.md"
wordCount: 124
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-07-06T19:32:45.677Z"
---


{{JSRef}}

The **`valueOf()`** method of {{jsxref("Number")}} values returns the value of this number.

{{InteractiveExample("JavaScript Demo: Number.prototype.valueOf()")}}

```js interactive-example
const numObj = new Number(42);
console.log(typeof numObj);
// Expected output: "object"

const num = numObj.valueOf();
console.log(num);
// Expected output: 42

console.log(typeof num);
// Expected output: "number"
```

## Syntax

```js-nolint
valueOf()
```

### Parameters

None.

### Return value

A number representing the primitive value of the specified {{jsxref("Number")}} object.

## Description

This method is usually called internally by JavaScript and not explicitly in web code.

## Examples

### Using valueOf

```js
const numObj = new Number(10);
console.log(typeof numObj); // object

const num = numObj.valueOf();
console.log(num); // 10
console.log(typeof num); // number
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Object.prototype.valueOf()")}}
