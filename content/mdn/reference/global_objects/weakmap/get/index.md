---
title: "Reference Global_objects Weakmap Get"
slug: "reference-global_objects-weakmap-get"
path: "reference/global_objects/weakmap/get/index.md"
wordCount: 144
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.749Z"
---


The **`get()`** method of {{jsxref("WeakMap")}} instances returns a specified element from this `WeakMap`.

{{InteractiveExample("JavaScript Demo: WeakMap.prototype.get()")}}

```js interactive-example
const weakmap = new WeakMap();
const object1 = {};
const object2 = {};

weakmap.set(object1, 42);

console.log(weakmap.get(object1));
// Expected output: 42

console.log(weakmap.get(object2));
// Expected output: undefined
```

## Syntax

```js-nolint
get(key)
```

### Parameters

- `key`
  - : The key of the element to return from the `WeakMap` object.

### Return value

The element associated with the specified key in the `WeakMap` object. If
the key can't be found, {{jsxref("undefined")}} is returned. Always returns
`undefined` if `key` is not an object or a [non-registered symbol](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#shared_symbols_in_the_global_symbol_registry).

## Examples

### Using the get() method

```js
const wm = new WeakMap();
wm.set(window, "foo");

wm.get(window); // Returns "foo".
wm.get("baz"); // Returns undefined.
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("WeakMap")}}
- {{jsxref("WeakMap.prototype.set()")}}
- {{jsxref("WeakMap.prototype.has()")}}
