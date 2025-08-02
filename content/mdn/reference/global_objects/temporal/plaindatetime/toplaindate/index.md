---
title: "Reference Global_objects Temporal Plaindatetime Toplaindate"
slug: "reference-global_objects-temporal-plaindatetime-toplaindate"
path: "reference/global_objects/temporal/plaindatetime/toplaindate/index.md"
wordCount: 100
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.700Z"
---


{{SeeCompatTable}}

The **`toPlainDate()`** method of {{jsxref("Temporal.PlainDateTime")}} instances returns a new {{jsxref("Temporal.PlainDate")}} object representing the date part (year, month, day) of this date-time in the same calendar system.

## Syntax

```js-nolint
toPlainDate()
```

### Parameters

None.

### Return value

A new `Temporal.PlainDate` object representing the date part (year, month, day) of this date-time in the same calendar system.

## Examples

### Using toPlainDate()

```js
const dt = Temporal.PlainDateTime.from("2021-07-01T12:34:56");
const date = dt.toPlainDate();
console.log(date.toString()); // '2021-07-01'
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainDateTime")}}
- {{jsxref("Temporal.PlainDate")}}
- {{jsxref("Temporal/PlainDateTime/toPlainTime", "Temporal.PlainDateTime.prototype.toPlainTime()")}}
- {{jsxref("Temporal/PlainDateTime/toZonedDateTime", "Temporal.PlainDate.prototype.toZonedDateTime()")}}
- {{jsxref("Temporal/PlainDate/toPlainDateTime", "Temporal.PlainDate.prototype.toPlainDateTime()")}}
