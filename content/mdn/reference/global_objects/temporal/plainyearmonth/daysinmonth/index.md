---
title: "Reference Global_objects Temporal Plainyearmonth Daysinmonth"
slug: "reference-global_objects-temporal-plainyearmonth-daysinmonth"
path: "reference/global_objects/temporal/plainyearmonth/daysinmonth/index.md"
wordCount: 97
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.712Z"
---


{{SeeCompatTable}}

The **`daysInMonth`** accessor property of {{jsxref("Temporal.PlainYearMonth")}} instances returns a positive integer representing the number of days in the month of this date. It is [calendar](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#calendars)-dependent.

The set accessor of `daysInMonth` is `undefined`. You cannot change this property directly.

For general information and more examples, see {{jsxref("Temporal/PlainDate/daysInMonth", "Temporal.PlainDate.prototype.daysInMonth")}}.

## Examples

### Using daysInMonth

```js
const ym = Temporal.PlainYearMonth.from("2021-07");
console.log(ym.daysInMonth); // 31
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainYearMonth")}}
- {{jsxref("Temporal/PlainYearMonth/with", "Temporal.PlainYearMonth.prototype.with()")}}
- {{jsxref("Temporal/PlainYearMonth/add", "Temporal.PlainYearMonth.prototype.add()")}}
- {{jsxref("Temporal/PlainYearMonth/subtract", "Temporal.PlainYearMonth.prototype.subtract()")}}
- {{jsxref("Temporal/PlainYearMonth/year", "Temporal.PlainYearMonth.prototype.year")}}
- {{jsxref("Temporal/PlainYearMonth/month", "Temporal.PlainYearMonth.prototype.month")}}
- {{jsxref("Temporal/PlainYearMonth/daysInYear", "Temporal.PlainYearMonth.prototype.daysInYear")}}
- {{jsxref("Temporal/PlainDate/daysInMonth", "Temporal.PlainDate.prototype.daysInMonth")}}
