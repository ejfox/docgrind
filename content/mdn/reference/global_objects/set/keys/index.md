---
title: "Reference Global_objects Set Keys"
slug: "reference-global_objects-set-keys"
path: "reference/global_objects/set/keys/index.md"
wordCount: 84
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.643Z"
---


The **`keys()`** method of {{jsxref("Set")}} instances is an alias for the [`values()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/values) method.

## Syntax

```js-nolint
keys()
```

### Parameters

None.

### Return value

A new [iterable iterator object](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator).

## Examples

### Using keys()

The `keys()` method is exactly equivalent to the {{jsxref("Set/values", "values()")}} method.

```js
const mySet = new Set();
mySet.add("foo");
mySet.add("bar");
mySet.add("baz");

const setIter = mySet.keys();

console.log(setIter.next().value); // "foo"
console.log(setIter.next().value); // "bar"
console.log(setIter.next().value); // "baz"
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Set.prototype.entries()")}}
- {{jsxref("Set.prototype.values()")}}
