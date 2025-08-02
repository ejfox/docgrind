---
title: "Reference Global_objects Suppressederror Suppressed"
slug: "reference-global_objects-suppressederror-suppressed"
path: "reference/global_objects/suppressederror/suppressed/index.md"
wordCount: 104
readingTime: 1
codeBlocks: 1
difficulty: "beginner"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.530Z"
---


The **`suppressed`** data property of a {{jsxref("SuppressedError")}} instance contains a reference to the original error that got suppressed because a new error was generated while handling it.

## Value

Any value. Like {{jsxref("Error/cause", "cause")}}, you cannot assume it's an {{jsxref("Error")}} instance, although it usually is the case.

{{js_property_attributes(1, 0, 1)}}

## Examples

### Using suppressed

```js
try {
  throw new SuppressedError(
    new Error("New error"),
    new Error("Original error"),
    "Hello",
  );
} catch (e) {
  console.log(e.suppressed); // Error: "Original error"
}
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [Control flow and error handling](/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling) guide
- {{jsxref("SuppressedError")}}
- [`Error`: `cause`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
