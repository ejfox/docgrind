---
title: "Reference Global_objects Dataview Getint32"
slug: "reference-global_objects-dataview-getint32"
path: "reference/global_objects/dataview/getint32/index.md"
wordCount: 218
readingTime: 2
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["arrays"]
lastModified: "2025-08-02T14:03:23.508Z"
---


The **`getInt32()`** method of {{jsxref("DataView")}} instances reads 4 bytes starting at the specified byte offset of this `DataView` and interprets them as a 32-bit signed integer. There is no alignment constraint; multi-byte values may be fetched from any offset within bounds.

{{InteractiveExample("JavaScript Demo: DataView.prototype.getInt32()")}}

```js interactive-example
// Create an ArrayBuffer with a size in bytes
const buffer = new ArrayBuffer(16);

const view = new DataView(buffer);
view.setInt32(1, 2147483647); // Max signed 32-bit integer

console.log(view.getInt32(1));
// Expected output: 2147483647
```

## Syntax

```js-nolint
getInt32(byteOffset)
getInt32(byteOffset, littleEndian)
```

### Parameters

- `byteOffset`
  - : The offset, in bytes, from the start of the view to read the data from.
- `littleEndian` {{optional_inline}}
  - : Indicates whether the data is stored in [little- or big-endian](/en-US/docs/Glossary/Endianness) format. If `false` or `undefined`, a big-endian value is read.

### Return value

An integer from -2147483648 to 2147483647, inclusive.

### Exceptions

- {{jsxref("RangeError")}}
  - : Thrown if the `byteOffset` is set such that it would read beyond the end of the view.

## Examples

### Using getInt32()

```js
const { buffer } = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const dataview = new DataView(buffer);
console.log(dataview.getInt32(1)); // 16909060
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [JavaScript typed arrays](/en-US/docs/Web/JavaScript/Guide/Typed_arrays) guide
- {{jsxref("DataView")}}
- {{jsxref("ArrayBuffer")}}
- {{jsxref("Int32Array")}}
