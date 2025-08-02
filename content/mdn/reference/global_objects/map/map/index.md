---
title: "Reference Global_objects Map Map"
slug: "reference-global_objects-map-map"
path: "reference/global_objects/map/map/index.md"
wordCount: 125
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["arrays", "objects"]
lastModified: "2025-08-02T14:03:23.582Z"
---


The **`Map()`** constructor creates {{jsxref("Map")}} objects.

## Syntax

```js-nolint
new Map()
new Map(iterable)
```

> [!NOTE]
> `Map()` can only be constructed with [`new`](/en-US/docs/Web/JavaScript/Reference/Operators/new). Attempting to call it without `new` throws a {{jsxref("TypeError")}}.

### Parameters

- `iterable` {{optional_inline}}
  - : An {{jsxref("Array")}} or other
    [iterable](/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) object
    whose elements are key-value pairs. (For example, arrays with two elements,
    such as `[[ 1, 'one' ],[ 2, 'two' ]]`.) Each key-value pair is added to the
    new `Map`.

## Examples

### Creating a new Map

```js
const myMap = new Map([
  [1, "one"],
  [2, "two"],
  [3, "three"],
]);
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [Polyfill for `Map` in `core-js`](https://github.com/zloirock/core-js#map)
- [es-shims polyfill of `Map`](https://www.npmjs.com/package/es-map)
- {{jsxref("Set")}}
- {{jsxref("WeakMap")}}
- {{jsxref("WeakSet")}}
