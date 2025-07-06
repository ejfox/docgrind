---
title: "Reference Global_objects Arraybuffer Bytelength"
slug: "reference-global_objects-arraybuffer-bytelength"
path: "reference/global_objects/arraybuffer/bytelength/index.md"
wordCount: 128
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-07-06T19:32:45.556Z"
---


{{JSRef}}

The **`byteLength`** accessor property of {{jsxref("ArrayBuffer")}} instances returns the length (in bytes) of this array buffer.

{{InteractiveExample("JavaScript Demo: ArrayBuffer.prototype.byteLength")}}

```js interactive-example
// Create an ArrayBuffer with a size in bytes
const buffer = new ArrayBuffer(8);

// Use byteLength to check the size
const bytes = buffer.byteLength;

console.log(bytes);
// Expected output: 8
```

## Description

The `byteLength` property is an accessor property whose set accessor function is `undefined`, meaning that you can only read this property. The value is established when the array is constructed and cannot be changed. This property returns 0 if this `ArrayBuffer` has been detached.

## Examples

### Using byteLength

```js
const buffer = new ArrayBuffer(8);
buffer.byteLength; // 8
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("ArrayBuffer")}}
