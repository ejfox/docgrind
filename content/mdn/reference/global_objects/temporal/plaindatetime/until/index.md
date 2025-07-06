---
title: "Reference Global_objects Temporal Plaindatetime Until"
slug: "reference-global_objects-temporal-plaindatetime-until"
path: "reference/global_objects/temporal/plaindatetime/until/index.md"
wordCount: 251
readingTime: 2
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-07-06T19:32:45.814Z"
---


{{JSRef}}{{SeeCompatTable}}

The **`until()`** method of {{jsxref("Temporal.PlainDateTime")}} instances returns a new {{jsxref("Temporal.Duration")}} object representing the duration from this date-time to another date-time (in a form convertible by {{jsxref("Temporal/PlainDateTime/from", "Temporal.PlainDateTime.from()")}}). The duration is positive if the other date-time is after this date-time, and negative if before.

This method does `other - this`. To do `this - other`, use the {{jsxref("Temporal/PlainDateTime/since", "since()")}} method.

## Syntax

```js-nolint
until(other)
until(other, options)
```

### Parameters

- `other`
  - : A string, an object, or a {{jsxref("Temporal.PlainDateTime")}} instance representing a date-time to subtract this date-time from. It is converted to a `Temporal.PlainDateTime` object using the same algorithm as {{jsxref("Temporal/PlainDateTime/from", "Temporal.PlainDateTime.from()")}}. It must have the same calendar as `this`.
- `options` {{optional_inline}}
  - : The same options as [`since()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime/since#options).

### Return value

A new {{jsxref("Temporal.Duration")}} object representing the duration from this date-time _until_ `other`. The duration is positive if `other` is after this date-time, and negative if before.

### Exceptions

- {{jsxref("RangeError")}}
  - : Thrown in one of the following cases:
    - `other` has a different calendar than `this`.
    - Any of the options is invalid.

## Examples

### Using until()

```js
let nextBilling = Temporal.PlainDateTime.from({
  year: Temporal.Now.plainDateISO().year,
  month: 4,
  day: 1,
});
const now = Temporal.Now.plainDateTimeISO().round("second");
if (Temporal.PlainDateTime.compare(nextBilling, now) < 0) {
  nextBilling = nextBilling.add({ years: 1 });
}
const duration = now.until(nextBilling);
console.log(`${duration.toLocaleString("en-US")} until next billing`);
```

For more examples, see [`since()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime/since).

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainDateTime")}}
- {{jsxref("Temporal.Duration")}}
- {{jsxref("Temporal/PlainDateTime/add", "Temporal.PlainDateTime.prototype.add()")}}
- {{jsxref("Temporal/PlainDateTime/subtract", "Temporal.PlainDateTime.prototype.subtract()")}}
- {{jsxref("Temporal/PlainDateTime/since", "Temporal.PlainDateTime.prototype.since()")}}
