---
title: "Reference Global_objects Map Clear"
slug: "reference-global_objects-map-clear"
path: "reference/global_objects/map/clear/index.md"
wordCount: 94
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.580Z"
---


The **`clear()`** method of {{jsxref("Map")}} instances removes all elements from this map.

{{InteractiveExample("JavaScript Demo: Map.prototype.clear()")}}

```js interactive-example
const map = new Map();

map.set("bar", "baz");
map.set(1, "foo");

console.log(map.size);
// Expected output: 2

map.clear();

console.log(map.size);
// Expected output: 0
```

## Syntax

```js-nolint
clear()
```

### Parameters

None.

### Return value

None ({{jsxref("undefined")}}).

## Examples

### Using clear()

```js
const myMap = new Map();
myMap.set("bar", "baz");
myMap.set(1, "foo");

console.log(myMap.size); // 2
console.log(myMap.has("bar")); // true

myMap.clear();

console.log(myMap.size); // 0
console.log(myMap.has("bar")); // false
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Map")}}
