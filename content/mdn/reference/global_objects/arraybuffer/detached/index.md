---
title: "Reference Global_objects Arraybuffer Detached"
slug: "reference-global_objects-arraybuffer-detached"
path: "reference/global_objects/arraybuffer/detached/index.md"
wordCount: 134
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.491Z"
---


The **`detached`** accessor property of {{jsxref("ArrayBuffer")}} instances returns a boolean indicating whether or not this buffer has been detached (transferred).

## Description

The `detached` property is an accessor property whose set accessor function is `undefined`, meaning that you can only read this property. The value is `false` when the `ArrayBuffer` is first created. The value becomes `true` if the `ArrayBuffer` is [transferred](/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer#transferring_arraybuffers), which detaches the instance from its underlying memory. Once a buffer becomes detached, it is no longer usable.

## Examples

### Using detached

```js
const buffer = new ArrayBuffer(8);
console.log(buffer.detached); // false
const newBuffer = buffer.transfer();
console.log(buffer.detached); // true
console.log(newBuffer.detached); // false
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [Polyfill of `ArrayBuffer.prototype.detached` in `core-js`](https://github.com/zloirock/core-js#arraybufferprototypetransfer-and-friends)
- [es-shims polyfill of `ArrayBuffer.prototype.detached`](https://www.npmjs.com/package/arraybuffer.prototype.detached)
- {{jsxref("ArrayBuffer")}}
- {{jsxref("ArrayBuffer.prototype.transfer()")}}
- {{jsxref("ArrayBuffer.prototype.transferToFixedLength()")}}
