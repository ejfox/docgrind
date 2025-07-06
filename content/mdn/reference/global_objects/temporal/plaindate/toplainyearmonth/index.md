---
title: "Reference Global_objects Temporal Plaindate Toplainyearmonth"
slug: "reference-global_objects-temporal-plaindate-toplainyearmonth"
path: "reference/global_objects/temporal/plaindate/toplainyearmonth/index.md"
wordCount: 103
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-07-06T19:32:45.804Z"
---


{{JSRef}}{{SeeCompatTable}}

The **`toPlainYearMonth()`** method of {{jsxref("Temporal.PlainDate")}} instances returns a new {{jsxref("Temporal.PlainYearMonth")}} object representing the {{jsxref("Temporal/PlainDate/year", "year")}} and {{jsxref("Temporal/PlainDate/month", "month")}} of this date in the same calendar system.

## Syntax

```js-nolint
toPlainYearMonth()
```

### Parameters

None.

### Return value

A new `Temporal.PlainYearMonth` object representing the {{jsxref("Temporal/PlainDate/year", "year")}} and {{jsxref("Temporal/PlainDate/month", "month")}} of this date in the same calendar system.

## Examples

### Using toPlainYearMonth()

```js
const date = Temporal.PlainDate.from("2021-07-01");
const yearMonth = date.toPlainYearMonth();
console.log(yearMonth.toString()); // 2021-07
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainDate")}}
- {{jsxref("Temporal.PlainYearMonth")}}
- {{jsxref("Temporal/PlainDate/toPlainDateTime", "Temporal.PlainDate.prototype.toPlainDateTime()")}}
- {{jsxref("Temporal/PlainDate/toPlainMonthDay", "Temporal.PlainDate.prototype.toPlainMonthDay()")}}
- {{jsxref("Temporal/PlainDate/toZonedDateTime", "Temporal.PlainDate.prototype.toZonedDateTime()")}}
- {{jsxref("Temporal/PlainYearMonth/toPlainDate", "Temporal.PlainYearMonth.prototype.toPlainDate()")}}
