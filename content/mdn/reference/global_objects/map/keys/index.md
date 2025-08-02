---
title: "Reference Global_objects Map Keys"
slug: "reference-global_objects-map-keys"
path: "reference/global_objects/map/keys/index.md"
wordCount: 117
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["objects", "api"]
lastModified: "2025-08-02T14:03:23.582Z"
---


The **`keys()`** method of {{jsxref("Map")}} instances returns a new _[map iterator](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator)_ object that contains the keys for each element in this map in insertion order.

{{InteractiveExample("JavaScript Demo: Map.prototype.keys()")}}

```js interactive-example
const map = new Map();

map.set("0", "foo");
map.set(1, "bar");

const iterator = map.keys();

console.log(iterator.next().value);
// Expected output: "0"

console.log(iterator.next().value);
// Expected output: 1
```

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

```js
const myMap = new Map();
myMap.set("0", "foo");
myMap.set(1, "bar");
myMap.set({}, "baz");

const mapIter = myMap.keys();

console.log(mapIter.next().value); // "0"
console.log(mapIter.next().value); // 1
console.log(mapIter.next().value); // {}
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Map.prototype.entries()")}}
- {{jsxref("Map.prototype.values()")}}
