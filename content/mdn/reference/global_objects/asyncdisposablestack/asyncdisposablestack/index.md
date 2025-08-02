---
title: "Reference Global_objects Asyncdisposablestack Asyncdisposablestack"
slug: "reference-global_objects-asyncdisposablestack-asyncdisposablestack"
path: "reference/global_objects/asyncdisposablestack/asyncdisposablestack/index.md"
wordCount: 78
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["objects", "async"]
lastModified: "2025-08-02T14:16:44.055Z"
---


The **`AsyncDisposableStack()`** constructor creates {{jsxref("AsyncDisposableStack")}} objects.

## Syntax

```js-nolint
new AsyncDisposableStack()
```

> [!NOTE]
> `AsyncDisposableStack()` can only be constructed with [`new`](/en-US/docs/Web/JavaScript/Reference/Operators/new). Attempting to call it without `new` throws a {{jsxref("TypeError")}}.

### Parameters

None.

### Return value

A new `AsyncDisposableStack` object.

## Examples

### Creating an AsyncDisposableStack

```js
const disposer = new AsyncDisposableStack();
disposer.defer(() => console.log("Disposed!"));
await disposer.disposeAsync();
// Logs: Disposed!
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [JavaScript resource management](/en-US/docs/Web/JavaScript/Guide/Resource_management)
