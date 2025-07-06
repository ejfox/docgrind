---
title: "Reference Global_objects Dataview Buffer"
slug: "reference-global_objects-dataview-buffer"
path: "reference/global_objects/dataview/buffer/index.md"
wordCount: 129
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-07-06T19:32:45.570Z"
---


{{JSRef}}

The **`buffer`** accessor property of {{jsxref("DataView")}} instances returns the {{jsxref("ArrayBuffer")}} or {{jsxref("SharedArrayBuffer")}} referenced by this view at construction time.

{{InteractiveExample("JavaScript Demo: DataView.prototype.buffer")}}

```js interactive-example
// Create an ArrayBuffer
const buffer = new ArrayBuffer(123);

// Create a view
const view = new DataView(buffer);

console.log(view.buffer.byteLength);
// Expected output: 123
```

## Description

The `buffer` property is an accessor property whose set accessor function is `undefined`, meaning that you can only read this property. The value is established when the `DataView` is constructed and cannot be changed.

## Examples

### Using the buffer property

```js
const buffer = new ArrayBuffer(8);
const dataview = new DataView(buffer);
dataview.buffer; // ArrayBuffer { byteLength: 8 }
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("DataView")}}
- {{jsxref("ArrayBuffer")}}
- {{jsxref("SharedArrayBuffer")}}
