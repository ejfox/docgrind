---
title: "Reference Global_objects Sharedarraybuffer Bytelength"
slug: "reference-global_objects-sharedarraybuffer-bytelength"
path: "reference/global_objects/sharedarraybuffer/bytelength/index.md"
wordCount: 107
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.644Z"
---


The **`byteLength`** accessor property of {{jsxref("SharedArrayBuffer")}} instances returns the length (in bytes) of this `SharedArrayBuffer`.

{{InteractiveExample("JavaScript Demo: SharedArrayBuffer.prototype.byteLength", "shorter")}}

```js interactive-example
// Create a SharedArrayBuffer with a size in bytes
const buffer = new SharedArrayBuffer(8);

console.log(buffer.byteLength);
// Expected output: 8
```

## Description

The `byteLength` property is an accessor property whose set accessor function is `undefined`, meaning that you can only read this property. The value is established when the shared array is constructed and cannot be changed.

## Examples

### Using byteLength

```js
const sab = new SharedArrayBuffer(1024);
sab.byteLength; // 1024
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("SharedArrayBuffer")}}
