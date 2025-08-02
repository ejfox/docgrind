---
title: "Reference Global_objects Temporal Plainyearmonth Daysinyear"
slug: "reference-global_objects-temporal-plainyearmonth-daysinyear"
path: "reference/global_objects/temporal/plainyearmonth/daysinyear/index.md"
wordCount: 94
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.662Z"
---


{{SeeCompatTable}}

The **`daysInYear`** accessor property of {{jsxref("Temporal.PlainYearMonth")}} instances returns a positive integer representing the number of days in the year of this date. It is [calendar](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#calendars)-dependent.

The set accessor of `daysInYear` is `undefined`. You cannot change this property directly.

For general information and more examples, see {{jsxref("Temporal/PlainDate/daysInYear", "Temporal.PlainDate.prototype.daysInYear")}}.

## Examples

### Using daysInYear

```js
const ym = Temporal.PlainYearMonth.from("2021-07");
console.log(ym.daysInYear); // 365
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
- {{jsxref("Temporal/PlainYearMonth/daysInMonth", "Temporal.PlainYearMonth.prototype.daysInMonth")}}
- {{jsxref("Temporal/PlainDate/daysInYear", "Temporal.PlainDate.prototype.daysInYear")}}
