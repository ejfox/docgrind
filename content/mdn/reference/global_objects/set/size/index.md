---
title: "Reference Global_objects Set Size"
slug: "reference-global_objects-set-size"
path: "reference/global_objects/set/size/index.md"
wordCount: 105
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.643Z"
---


The **`size`** accessor property of {{jsxref("Set")}} instances returns the number of (unique) elements in this set.

{{InteractiveExample("JavaScript Demo: Set.prototype.size")}}

```js interactive-example
const set = new Set();
const object = {};

set.add(42);
set.add("forty two");
set.add("forty two");
set.add(object);

console.log(set.size);
// Expected output: 3
```

## Description

The value of `size` is an integer representing how many entries the `Set` object has. A set accessor function for `size` is `undefined`; you cannot change this property.

## Examples

### Using size

```js
const mySet = new Set();
mySet.add(1);
mySet.add(5);
mySet.add("some text");

console.log(mySet.size); // 3
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Set")}}
