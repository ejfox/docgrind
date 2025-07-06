---
title: "Reference Global_objects Temporal Plaindatetime Weekofyear"
slug: "reference-global_objects-temporal-plaindatetime-weekofyear"
path: "reference/global_objects/temporal/plaindatetime/weekofyear/index.md"
wordCount: 147
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-07-06T19:32:45.815Z"
---


{{JSRef}}{{SeeCompatTable}}

The **`weekOfYear`** accessor property of {{jsxref("Temporal.PlainDateTime")}} instances returns a positive integer representing the 1-based week index in the {{jsxref("Temporal/PlainDateTime/yearOfWeek", "yearOfWeek")}} of this date, or `undefined` if the calendar does not have a well-defined week system. The first week of the year is `1`. It is [calendar](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#calendars)-dependent.

The set accessor of `weekOfYear` is `undefined`. You cannot change this property directly. To create a new `Temporal.PlainDateTime` object with the desired new `weekOfYear` value, use the {{jsxref("Temporal/PlainDateTime/add", "add()")}} or {{jsxref("Temporal/PlainDateTime/subtract", "subtract()")}} method with the appropriate number of `weeks`.

For general information and more examples, see {{jsxref("Temporal/PlainDate/weekOfYear", "Temporal.PlainDate.prototype.weekOfYear")}}.

## Examples

### Using weekOfYear

```js
const dt = Temporal.PlainDateTime.from("2021-07-01");
console.log(dt.weekOfYear); // 26
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
- {{jsxref("Temporal/PlainDateTime/yearOfWeek", "Temporal.PlainDateTime.prototype.yearOfWeek")}}
- {{jsxref("Temporal/PlainDateTime/dayOfWeek", "Temporal.PlainDateTime.prototype.dayOfWeek")}}
- {{jsxref("Temporal/PlainDateTime/daysInWeek", "Temporal.PlainDateTime.prototype.daysInWeek")}}
- {{jsxref("Temporal/PlainDateTime/daysInYear", "Temporal.PlainDateTime.prototype.daysInYear")}}
- {{jsxref("Temporal/PlainDate/weekOfYear", "Temporal.PlainDate.prototype.weekOfYear")}}
