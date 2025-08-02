---
title: "Reference Global_objects Temporal Plaindatetime Calendarid"
slug: "reference-global_objects-temporal-plaindatetime-calendarid"
path: "reference/global_objects/temporal/plaindatetime/calendarid/index.md"
wordCount: 104
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.693Z"
---


{{SeeCompatTable}}

The **`calendarId`** accessor property of {{jsxref("Temporal.PlainDateTime")}} instances returns a string representing the [calendar](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#calendars) used to interpret the internal ISO 8601 date.

See [`Intl.supportedValuesOf()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf#supported_calendar_types) for a list of commonly supported calendar types.

The set accessor of `calendarId` is `undefined`. You cannot change this property directly. Use the {{jsxref("Temporal/PlainDateTime/withCalendar", "withCalendar()")}} method to create a new `Temporal.PlainDateTime` object with the desired new value.

## Examples

### Using calendarId

```js
const dt = Temporal.PlainDateTime.from("2021-07-01T08:00:00");
console.log(dt.calendarId); // "iso8601"; default

const dt2 = Temporal.PlainDateTime.from("2021-07-01T08:00:00[u-ca=chinese]");
console.log(dt2.calendarId); // "chinese"

const dt3 = dt2.withCalendar("hebrew");
console.log(dt3.calendarId); // "hebrew"
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainDateTime")}}
