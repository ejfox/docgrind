---
title: "Reference Global_objects Number Nan"
slug: "reference-global_objects-number-nan"
path: "reference/global_objects/number/nan/index.md"
wordCount: 134
readingTime: 1
codeBlocks: 2
difficulty: "intermediate"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.370Z"
---


The **`Number.NaN`** static data property represents Not-A-Number, which is equivalent to {{jsxref("NaN")}}. For more information about the behaviors of `NaN`, see the [description for the global property](/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN).

{{InteractiveExample("JavaScript Demo: Number.NaN", "taller")}}

```js interactive-example
function clean(x) {
  if (x === Number.NaN) {
    // Can never be true
    return null;
  }
  if (isNaN(x)) {
    return 0;
  }
}

console.log(clean(Number.NaN));
// Expected output: 0
```

## Value

The number value {{jsxref("NaN")}}.

{{js_property_attributes(0, 0, 0)}}

## Description

Because `NaN` is a static property of {{jsxref("Number")}}, you always use it as `Number.NaN`, rather than as a property of a number value.

## Examples

### Checking whether values are numeric

```js
function sanitize(x) {
  if (isNaN(x)) {
    return Number.NaN;
  }
  return x;
}
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("NaN")}}
- {{jsxref("Number.isNaN()")}}
