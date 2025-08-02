---
title: "Reference Global_objects Dataview Setuint8"
slug: "reference-global_objects-dataview-setuint8"
path: "reference/global_objects/dataview/setuint8/index.md"
wordCount: 185
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["arrays", "objects"]
lastModified: "2025-08-02T14:03:23.512Z"
---


The **`setUint8()`** method of {{jsxref("DataView")}} instances takes a number and stores it as an 8-bit unsigned integer in the byte at the specified byte offset of this `DataView`.

{{InteractiveExample("JavaScript Demo: DataView.prototype.setUint8()")}}

```js interactive-example
// Create an ArrayBuffer with a size in bytes
const buffer = new ArrayBuffer(16);

const view = new DataView(buffer);
view.setUint8(1, 255); // Max unsigned 8-bit integer

console.log(view.getUint8(1));
// Expected output: 255
```

## Syntax

```js-nolint
setUint8(byteOffset, value)
```

### Parameters

- `byteOffset`
  - : The offset, in bytes, from the start of the view to store the data in.
- `value`
  - : The value to set. For how the value is encoded in bytes, see [Value encoding and normalization](/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#value_encoding_and_normalization).

### Return value

{{jsxref("undefined")}}.

### Exceptions

- {{jsxref("RangeError")}}
  - : Thrown if the `byteOffset` is set such that it would store beyond the end of the view.

## Examples

### Using setUint8()

```js
const buffer = new ArrayBuffer(10);
const dataview = new DataView(buffer);
dataview.setUint8(0, 3);
dataview.getUint8(0); // 3
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [JavaScript typed arrays](/en-US/docs/Web/JavaScript/Guide/Typed_arrays) guide
- {{jsxref("DataView")}}
- {{jsxref("ArrayBuffer")}}
- {{jsxref("Uint8Array")}}
