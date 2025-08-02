---
title: "Reference Global_objects Temporal Plaindate Toplainmonthday"
slug: "reference-global_objects-temporal-plaindate-toplainmonthday"
path: "reference/global_objects/temporal/plaindate/toplainmonthday/index.md"
wordCount: 131
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.605Z"
---


{{SeeCompatTable}}

The **`toPlainMonthDay()`** method of {{jsxref("Temporal.PlainDate")}} instances returns a new {{jsxref("Temporal.PlainMonthDay")}} object representing the {{jsxref("Temporal/PlainDate/monthCode", "monthCode")}} and {{jsxref("Temporal/PlainDate/day", "day")}} of this date in the same calendar system.

Note that `PlainMonthDay` objects do not have a `month` component, because months with the same name can have different `month` indexes in different years due to leap months.

## Syntax

```js-nolint
toPlainMonthDay()
```

### Parameters

None.

### Return value

A new `Temporal.PlainMonthDay` object representing the {{jsxref("Temporal/PlainDate/monthCode", "monthCode")}} and {{jsxref("Temporal/PlainDate/day", "day")}} of this date in the same calendar system.

## Examples

### Using toPlainMonthDay()

```js
const date = Temporal.PlainDate.from("2021-07-01");
const monthDay = date.toPlainMonthDay();
console.log(monthDay.toString()); // 07-01
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainDate")}}
- {{jsxref("Temporal.PlainMonthDay")}}
- {{jsxref("Temporal/PlainDate/toPlainDateTime", "Temporal.PlainDate.prototype.toPlainDateTime()")}}
- {{jsxref("Temporal/PlainDate/toPlainYearMonth", "Temporal.PlainDate.prototype.toPlainYearMonth()")}}
- {{jsxref("Temporal/PlainDate/toZonedDateTime", "Temporal.PlainDate.prototype.toZonedDateTime()")}}
- {{jsxref("Temporal/PlainMonthDay/toPlainDate", "Temporal.PlainMonthDay.prototype.toPlainDate()")}}
