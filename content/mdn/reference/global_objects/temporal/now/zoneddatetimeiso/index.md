---
title: "Reference Global_objects Temporal Now Zoneddatetimeiso"
slug: "reference-global_objects-temporal-now-zoneddatetimeiso"
path: "reference/global_objects/temporal/now/zoneddatetimeiso/index.md"
wordCount: 203
readingTime: 2
codeBlocks: 2
difficulty: "beginner"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.588Z"
---


{{SeeCompatTable}}

The **`Temporal.Now.zonedDateTimeISO()`** static method returns the current date and time as a {{jsxref("Temporal.ZonedDateTime")}} object, in the ISO 8601 calendar and the specified time zone.

## Syntax

```js-nolint
Temporal.Now.zonedDateTimeISO()
Temporal.Now.zonedDateTimeISO(timeZone)
```

### Parameters

- `timeZone` {{optional_inline}}
  - : Either a string or a {{jsxref("Temporal.ZonedDateTime")}} instance representing the time zone to interpret the system time in. If a `Temporal.ZonedDateTime` instance, its time zone is used. If a string, it can be a named time zone identifier, an offset time zone identifier, or a date-time string containing a time zone identifier or an offset (see [time zones and offsets](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime#time_zones_and_offsets) for more information).

### Return value

The current date and time in the specified time zone, as a {{jsxref("Temporal.ZonedDateTime")}} object using the ISO 8601 calendar. Has the same precision as {{jsxref("Temporal/Now/instant", "Temporal.Now.instant()")}}.

### Exceptions

- {{jsxref("RangeError")}}
  - : Thrown if the time zone is invalid.

## Examples

### Using Temporal.Now.zonedDateTimeISO()

```js
// The current date and time in the system's time zone
const dateTime = Temporal.Now.zonedDateTimeISO();
console.log(dateTime); // e.g.: 2021-10-01T06:12:34.567890123+03:00[Africa/Nairobi]

// The current date and time in the "America/New_York" time zone
const dateTimeInNewYork = Temporal.Now.zonedDateTimeISO("America/New_York");
console.log(dateTimeInNewYork); // e.g.: 2021-09-30T23:12:34.567890123-04:00[America/New_York]
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.Now")}}
- {{jsxref("Temporal.ZonedDateTime")}}
