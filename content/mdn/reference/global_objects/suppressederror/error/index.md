---
title: "Reference Global_objects Suppressederror Error"
slug: "reference-global_objects-suppressederror-error"
path: "reference/global_objects/suppressederror/error/index.md"
wordCount: 96
readingTime: 1
codeBlocks: 1
difficulty: "beginner"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.662Z"
---


The **`error`** data property of a {{jsxref("SuppressedError")}} instance contains a reference to the error that results in the suppression.

## Value

Any value. Like {{jsxref("Error/cause", "cause")}}, you cannot assume it's an {{jsxref("Error")}} instance, although it usually is the case.

{{js_property_attributes(1, 0, 1)}}

## Examples

### Using error

```js
try {
  throw new SuppressedError(
    new Error("New error"),
    new Error("Original error"),
    "Hello",
  );
} catch (e) {
  console.log(e.error); // Error: "New error"
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
