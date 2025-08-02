---
title: "Reference Global_objects Dataview Getint8"
slug: "reference-global_objects-dataview-getint8"
path: "reference/global_objects/dataview/getint8/index.md"
wordCount: 175
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["arrays"]
lastModified: "2025-08-02T14:03:23.508Z"
---


The **`getInt8()`** method of {{jsxref("DataView")}} instances reads 1 byte at the specified byte offset of this `DataView` and interprets it as an 8-bit signed integer.

{{InteractiveExample("JavaScript Demo: DataView.prototype.getInt8()")}}

```js interactive-example
// Create an ArrayBuffer with a size in bytes
const buffer = new ArrayBuffer(16);

const view = new DataView(buffer);
view.setInt8(1, 127); // Max signed 8-bit integer

console.log(view.getInt8(1));
// Expected output: 127
```

## Syntax

```js-nolint
getInt8(byteOffset)
```

### Parameters

- `byteOffset`
  - : The offset, in bytes, from the start of the view to read the data from.

### Return value

An integer from -128 to 127, inclusive.

### Exceptions

- {{jsxref("RangeError")}}
  - : Thrown if the `byteOffset` is set such that it would read beyond the end of the view.

## Examples

### Using getInt8()

```js
const { buffer } = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const dataview = new DataView(buffer);
console.log(dataview.getInt8(1)); // 1
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [JavaScript typed arrays](/en-US/docs/Web/JavaScript/Guide/Typed_arrays) guide
- {{jsxref("DataView")}}
- {{jsxref("ArrayBuffer")}}
- {{jsxref("Int8Array")}}
