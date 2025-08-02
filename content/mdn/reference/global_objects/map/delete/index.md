---
title: "Reference Global_objects Map Delete"
slug: "reference-global_objects-map-delete"
path: "reference/global_objects/map/delete/index.md"
wordCount: 134
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["api"]
lastModified: "2025-08-02T14:16:44.316Z"
---


The **`delete()`** method of {{jsxref("Map")}} instances removes the specified element from this map by
key.

{{InteractiveExample("JavaScript Demo: Map.prototype.delete()")}}

```js interactive-example
const map = new Map();
map.set("bar", "foo");

console.log(map.delete("bar"));
// Expected result: true
// True indicates successful removal

console.log(map.has("bar"));
// Expected result: false
```

## Syntax

```js-nolint
mapInstance.delete(key)
```

### Parameters

- `key`
  - : The key of the element to remove from the `Map` object.

### Return value

`true` if an element in the `Map` object existed and has been removed, or
`false` if the element does not exist.

## Examples

### Using delete()

```js
const myMap = new Map();
myMap.set("bar", "foo");

console.log(myMap.delete("bar")); // Returns true. Successfully removed.
console.log(myMap.has("bar")); // Returns false. The "bar" element is no longer present.
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Map")}}
