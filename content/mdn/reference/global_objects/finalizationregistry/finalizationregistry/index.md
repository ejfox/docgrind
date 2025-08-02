---
title: "Reference Global_objects Finalizationregistry Finalizationregistry"
slug: "reference-global_objects-finalizationregistry-finalizationregistry"
path: "reference/global_objects/finalizationregistry/finalizationregistry/index.md"
wordCount: 129
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.184Z"
---


The **`FinalizationRegistry()`** constructor creates {{jsxref("FinalizationRegistry")}} objects.

## Syntax

```js-nolint
new FinalizationRegistry(callbackFn)
```

> [!NOTE]
> `FinalizationRegistry()` can only be constructed with [`new`](/en-US/docs/Web/JavaScript/Reference/Operators/new). Attempting to call it without `new` throws a {{jsxref("TypeError")}}.

### Parameters

- `callback`
  - : A function to be invoked each time a registered target value is garbage collected. Its return value is ignored. The function is called with the following arguments:
    - `heldValue`
      - : The value that was passed to the second parameter of the {{jsxref("FinalizationRegistry/register", "register()")}} method when the `target` object was registered.

## Examples

### Creating a new registry

You create the registry passing in the callback:

```js
const registry = new FinalizationRegistry((heldValue) => {
  // …
});
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("FinalizationRegistry")}}
