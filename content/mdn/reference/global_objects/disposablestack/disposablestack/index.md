---
title: "Reference Global_objects Disposablestack Disposablestack"
slug: "reference-global_objects-disposablestack-disposablestack"
path: "reference/global_objects/disposablestack/disposablestack/index.md"
wordCount: 77
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.527Z"
---


The **`DisposableStack()`** constructor creates {{jsxref("DisposableStack")}} objects.

## Syntax

```js-nolint
new DisposableStack()
```

> [!NOTE]
> `DisposableStack()` can only be constructed with [`new`](/en-US/docs/Web/JavaScript/Reference/Operators/new). Attempting to call it without `new` throws a {{jsxref("TypeError")}}.

### Parameters

None.

### Return value

A new `DisposableStack` object.

## Examples

### Creating an DisposableStack

```js
const disposer = new DisposableStack();
disposer.defer(() => console.log("Disposed!"));
disposer.dispose();
// Logs: Disposed!
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [JavaScript resource management](/en-US/docs/Web/JavaScript/Guide/Resource_management)
