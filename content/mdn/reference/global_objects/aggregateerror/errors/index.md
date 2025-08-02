---
title: "Reference Global_objects Aggregateerror Errors"
slug: "reference-global_objects-aggregateerror-errors"
path: "reference/global_objects/aggregateerror/errors/index.md"
wordCount: 113
readingTime: 1
codeBlocks: 1
difficulty: "beginner"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.001Z"
---


The **`errors`** data property of an {{jsxref("AggregateError")}} instance contains an array representing the errors that were aggregated.

## Value

An {{jsxref("Array")}} containing values in the same order as the iterable passed as the first argument of the {{jsxref("AggregateError/AggregateError", "AggregateError()")}} constructor.

{{js_property_attributes(1, 0, 1)}}

## Examples

### Using errors

```js
try {
  throw new AggregateError(
    // An iterable of errors
    new Set([new Error("some error"), new Error("another error")]),
    "Multiple errors thrown",
  );
} catch (err) {
  console.log(err.errors);
  // [
  //   Error: some error,
  //   Error: another error
  // ]
}
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [Control flow and error handling](/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling) guide
- {{jsxref("AggregateError")}}
- [`Error`: `cause`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
