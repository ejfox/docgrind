---
title: "Reference Global_objects Temporal Zoneddatetime Dayofyear"
slug: "reference-global_objects-temporal-zoneddatetime-dayofyear"
path: "reference/global_objects/temporal/zoneddatetime/dayofyear/index.md"
wordCount: 142
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.679Z"
---


{{SeeCompatTable}}

The **`dayOfYear`** accessor property of {{jsxref("Temporal.ZonedDateTime")}} instances returns a positive integer representing the 1-based day index in the year of this date. The first day of this year is `1`, and the last day is the {{jsxref("Temporal/ZonedDateTime/daysInYear", "daysInYear")}}. It is [calendar](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#calendars)-dependent.

The set accessor of `dayOfYear` is `undefined`. You cannot change this property directly. To create a new `Temporal.ZonedDateTime` object with the desired new `dayOfYear` value, use the {{jsxref("Temporal/ZonedDateTime/add", "add()")}} or {{jsxref("Temporal/ZonedDateTime/subtract", "subtract()")}} method with the appropriate number of `days`.

For general information and more examples, see {{jsxref("Temporal/PlainDate/dayOfYear", "Temporal.PlainDate.prototype.dayOfYear")}}.

## Examples

### Using dayOfYear

```js
const dt = Temporal.ZonedDateTime.from("2021-07-01[America/New_York]");
console.log(dt.dayOfYear); // 182
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.ZonedDateTime")}}
- {{jsxref("Temporal/ZonedDateTime/with", "Temporal.ZonedDateTime.prototype.with()")}}
- {{jsxref("Temporal/ZonedDateTime/add", "Temporal.ZonedDateTime.prototype.add()")}}
- {{jsxref("Temporal/ZonedDateTime/subtract", "Temporal.ZonedDateTime.prototype.subtract()")}}
- {{jsxref("Temporal/ZonedDateTime/year", "Temporal.ZonedDateTime.prototype.year")}}
- {{jsxref("Temporal/ZonedDateTime/day", "Temporal.ZonedDateTime.prototype.day")}}
- {{jsxref("Temporal/ZonedDateTime/dayOfWeek", "Temporal.ZonedDateTime.prototype.dayOfWeek")}}
- {{jsxref("Temporal/ZonedDateTime/daysInYear", "Temporal.ZonedDateTime.prototype.daysInYear")}}
- {{jsxref("Temporal/PlainDate/dayOfYear", "Temporal.PlainDate.prototype.dayOfYear")}}
