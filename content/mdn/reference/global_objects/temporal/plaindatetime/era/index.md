---
title: "Reference Global_objects Temporal Plaindatetime Era"
slug: "reference-global_objects-temporal-plaindatetime-era"
path: "reference/global_objects/temporal/plaindatetime/era/index.md"
wordCount: 147
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-07-06T19:32:45.809Z"
---


{{JSRef}}{{SeeCompatTable}}

The **`era`** accessor property of {{jsxref("Temporal.PlainDateTime")}} instances returns a calendar-specific lowercase string representing the era of this date, or `undefined` if the calendar does not use eras (e.g., ISO 8601). `era` and `eraYear` together uniquely identify a year in a calendar, in the same way that `year` does. It is [calendar](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#calendars)-dependent.

The set accessor of `era` is `undefined`. You cannot change this property directly. Use the {{jsxref("Temporal/PlainDateTime/with", "with()")}} method to create a new `Temporal.PlainDateTime` object with the desired new value.

For general information and more examples, see {{jsxref("Temporal/PlainDate/era", "Temporal.PlainDate.prototype.era")}}.

## Examples

### Using era

```js
const dt = Temporal.PlainDateTime.from("2021-07-01"); // ISO 8601 calendar
console.log(dt.era); // undefined

const dt2 = Temporal.PlainDateTime.from("2021-07-01[u-ca=gregory]");
console.log(dt2.era); // gregory
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainDateTime")}}
- {{jsxref("Temporal/PlainDateTime/with", "Temporal.PlainDateTime.prototype.with()")}}
- {{jsxref("Temporal/PlainDateTime/add", "Temporal.PlainDateTime.prototype.add()")}}
- {{jsxref("Temporal/PlainDateTime/subtract", "Temporal.PlainDateTime.prototype.subtract()")}}
- {{jsxref("Temporal/PlainDateTime/year", "Temporal.PlainDateTime.prototype.year")}}
- {{jsxref("Temporal/PlainDateTime/eraYear", "Temporal.PlainDateTime.prototype.eraYear")}}
- {{jsxref("Temporal/PlainDate/era", "Temporal.PlainDate.prototype.era")}}
