---
title: "Reference Global_objects Weakmap Has"
slug: "reference-global_objects-weakmap-has"
path: "reference/global_objects/weakmap/has/index.md"
wordCount: 152
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.752Z"
---


The **`has()`** method of {{jsxref("WeakMap")}} instances returns a boolean indicating whether an
element with the specified key exists in this `WeakMap` or not.

{{InteractiveExample("JavaScript Demo: WeakMap.prototype.has()")}}

```js interactive-example
const weakmap = new WeakMap();
const object1 = {};
const object2 = {};

weakmap.set(object1, "foo");

console.log(weakmap.has(object1));
// Expected output: true

console.log(weakmap.has(object2));
// Expected output: false
```

## Syntax

```js-nolint
has(key)
```

### Parameters

- `key`
  - : The key of the element to test for presence in the `WeakMap` object.

### Return value

Returns `true` if an element with the specified key exists in the `WeakMap` object; otherwise `false`. Always returns `false` if `key` is not an object or a [non-registered symbol](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#shared_symbols_in_the_global_symbol_registry).

## Examples

### Using the has method

```js
const wm = new WeakMap();
wm.set(window, "foo");

wm.has(window); // returns true
wm.has("baz"); // returns false
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("WeakMap")}}
- {{jsxref("WeakMap.prototype.set()")}}
- {{jsxref("WeakMap.prototype.get()")}}
