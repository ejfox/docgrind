---
title: "Reference Global_objects Temporal Plaindatetime Withcalendar"
slug: "reference-global_objects-temporal-plaindatetime-withcalendar"
path: "reference/global_objects/temporal/plaindatetime/withcalendar/index.md"
wordCount: 183
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["functions", "objects"]
lastModified: "2025-08-02T14:16:44.637Z"
---


{{SeeCompatTable}}

The **`withCalendar()`** method of {{jsxref("Temporal.PlainDateTime")}} instances returns a new `Temporal.PlainDateTime` object representing this date-time interpreted in the new calendar system. Because all `Temporal` objects are designed to be immutable, this method essentially functions as the setter for the date-time's {{jsxref("Temporal/PlainDateTime/calendarId", "calendarId")}} property.

To replace the date-time component properties, use the {{jsxref("Temporal/PlainDateTime/with", "with()")}} method instead.

## Syntax

```js-nolint
withCalendar(calendar)
```

### Parameters

- `calendar`
  - : A string that corresponds to the {{jsxref("Temporal/PlainDateTime/calendarId", "calendarId")}} property. See [`Intl.supportedValuesOf()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf#supported_calendar_types) for a list of commonly supported calendar types.

### Return value

A new `Temporal.PlainDateTime` object, representing the date-time specified by the original `PlainDateTime`, interpreted in the new calendar system.

### Exceptions

- {{jsxref("TypeError")}}
  - : Thrown if `calendar` is not a string.
- {{jsxref("RangeError")}}
  - : Thrown if `calendar` is not a valid calendar identifier.

## Examples

### Using withCalendar()

```js
const dt = Temporal.PlainDateTime.from("2021-07-01T12:34:56");
const newDT = dt.withCalendar("islamic-umalqura");
console.log(newDT.toLocaleString("en-US", { calendar: "islamic-umalqura" }));
// 11/21/1442 AH, 12:34:56 PM
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainDateTime")}}
- {{jsxref("Temporal/PlainDateTime/with", "Temporal.PlainDateTime.prototype.with()")}}
- {{jsxref("Temporal/PlainDateTime/withPlainTime", "Temporal.PlainDateTime.prototype.withPlainTime()")}}
- {{jsxref("Temporal/PlainDateTime/from", "Temporal.PlainDateTime.from()")}}
- {{jsxref("Temporal/PlainDateTime/calendarId", "Temporal.PlainDateTime.prototype.calendarId")}}
