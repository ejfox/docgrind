---
title: "Reference Global_objects Atomics Load"
slug: "reference-global_objects-atomics-load"
path: "reference/global_objects/atomics/load/index.md"
wordCount: 181
readingTime: 1
codeBlocks: 3
difficulty: "intermediate"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.500Z"
---


The **`Atomics.load()`** static
method returns a value at a given position in the array.

{{InteractiveExample("JavaScript Demo: Atomics.load()")}}

```js interactive-example
// Create a SharedArrayBuffer with a size in bytes
const buffer = new SharedArrayBuffer(16);
const uint8 = new Uint8Array(buffer);
uint8[0] = 5;

// 5 + 2 = 7
console.log(Atomics.add(uint8, 0, 2));
// Expected output: 5

console.log(Atomics.load(uint8, 0));
// Expected output: 7
```

## Syntax

```js-nolint
Atomics.load(typedArray, index)
```

### Parameters

- `typedArray`
  - : An integer typed array. One of {{jsxref("Int8Array")}}, {{jsxref("Uint8Array")}},
    {{jsxref("Int16Array")}}, {{jsxref("Uint16Array")}}, {{jsxref("Int32Array")}},
    {{jsxref("Uint32Array")}}, {{jsxref("BigInt64Array")}}, or
    {{jsxref("BigUint64Array")}}.
- `index`
  - : The position in the `typedArray` to load from.

### Return value

The value at the given position (`typedArray[index]`).

### Exceptions

- {{jsxref("TypeError")}}
  - : Thrown if `typedArray` is not one of the allowed integer types.
- {{jsxref("RangeError")}}
  - : Thrown if `index` is out of bounds in the `typedArray`.

## Examples

### Using `load`

```js
const sab = new SharedArrayBuffer(1024);
const ta = new Uint8Array(sab);

Atomics.add(ta, 0, 12);
Atomics.load(ta, 0); // 12
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Atomics")}}
- {{jsxref("Atomics.store()")}}
