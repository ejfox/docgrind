---
title: "Reference Global_objects Temporal Plainmonthday Toplaindate"
slug: "reference-global_objects-temporal-plainmonthday-toplaindate"
path: "reference/global_objects/temporal/plainmonthday/toplaindate/index.md"
wordCount: 235
readingTime: 2
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:44.645Z"
---


{{SeeCompatTable}}

The **`toPlainDate()`** method of {{jsxref("Temporal.PlainMonthDay")}} instances returns a new {{jsxref("Temporal.PlainDate")}} object representing this month-day and a supplied year in the same calendar system.

## Syntax

```js-nolint
toPlainDate(yearInfo)
```

### Parameters

- `yearInfo`
  - : An object representing the year component of the resulting `PlainDate`, containing the following properties (in the order they are retrieved and validated):
    - `era` and `eraYear`
      - : A string and an integer that correspond to the {{jsxref("Temporal/PlainDate/era", "era")}} and {{jsxref("Temporal/PlainDate/eraYear", "eraYear")}} properties. Are only used if the calendar system has eras. `era` and `eraYear` must be provided simultaneously. If they are not provided, then `year` must be provided. If all of `era`, `eraYear`, and `year` are provided, they must be consistent.
    - `year`
      - : Corresponds to the {{jsxref("Temporal/PlainDate/year", "year")}} property.

### Return value

A new `Temporal.PlainDate` object representing the date specified by this month-day and the year in `yearInfo`, interpreted in the calendar system of this month-day.

### Exceptions

- {{jsxref("RangeError")}}
  - : Thrown if any of the options is invalid.
- {{jsxref("TypeError")}}
  - : Thrown if `yearInfo` is not an object.

## Examples

### Using toPlainDate()

```js
const md = Temporal.PlainMonthDay.from("07-01");
const date = md.toPlainDate({ year: 2021 });
console.log(date.toString()); // 2021-07-01

const md2 = Temporal.PlainMonthDay.from("2021-07-01[u-ca=japanese]");
const date2 = md2.toPlainDate({ era: "reiwa", eraYear: 1 });
console.log(date2.toString()); // 2019-07-01[u-ca=japanese]
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainMonthDay")}}
- {{jsxref("Temporal.PlainDate")}}
- {{jsxref("Temporal/PlainDate/toPlainMonthDay", "Temporal.PlainDate.prototype.toPlainMonthDay()")}}
