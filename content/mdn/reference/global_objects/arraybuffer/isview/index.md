---
title: "Reference Global_objects Arraybuffer Isview"
slug: "reference-global_objects-arraybuffer-isview"
path: "reference/global_objects/arraybuffer/isview/index.md"
wordCount: 151
readingTime: 1
codeBlocks: 3
difficulty: "intermediate"
category: "Reference"
tags: ["arrays", "objects"]
lastModified: "2025-08-02T14:16:44.049Z"
---


The **`ArrayBuffer.isView()`** static method determines whether the
passed value is one of the `ArrayBuffer` views,
such as [typed array objects](/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
or a {{jsxref("DataView")}}.

{{InteractiveExample("JavaScript Demo: ArrayBuffer.isView()", "shorter")}}

```js interactive-example
// Create an ArrayBuffer with a size in bytes
const buffer = new ArrayBuffer(16);

console.log(ArrayBuffer.isView(new Int32Array()));
// Expected output: true
```

## Syntax

```js-nolint
ArrayBuffer.isView(value)
```

### Parameters

- `value`
  - : The value to be checked.

### Return value

`true` if the given argument is one of the {{jsxref("ArrayBuffer")}} views;
otherwise, `false`.

## Examples

### Using isView

```js
ArrayBuffer.isView(); // false
ArrayBuffer.isView([]); // false
ArrayBuffer.isView({}); // false
ArrayBuffer.isView(null); // false
ArrayBuffer.isView(undefined); // false
ArrayBuffer.isView(new ArrayBuffer(10)); // false

ArrayBuffer.isView(new Uint8Array()); // true
ArrayBuffer.isView(new Float32Array()); // true
ArrayBuffer.isView(new Int8Array(10).subarray(0, 3)); // true

const buffer = new ArrayBuffer(2);
const dv = new DataView(buffer);
ArrayBuffer.isView(dv); // true
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [JavaScript typed arrays](/en-US/docs/Web/JavaScript/Guide/Typed_arrays) guide
