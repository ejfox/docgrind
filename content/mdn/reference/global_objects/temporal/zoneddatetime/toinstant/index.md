---
title: "Reference Global_objects Temporal Zoneddatetime Toinstant"
slug: "reference-global_objects-temporal-zoneddatetime-toinstant"
path: "reference/global_objects/temporal/zoneddatetime/toinstant/index.md"
wordCount: 87
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-07-06T19:32:45.842Z"
---


{{JSRef}}{{SeeCompatTable}}

The **`toInstant()`** method of {{jsxref("Temporal.ZonedDateTime")}} instances returns a new {{jsxref("Temporal.Instant")}} object representing the instant of this date-time.

## Syntax

```js-nolint
toInstant()
```

### Parameters

None.

### Return value

A new {{jsxref("Temporal.Instant")}} object representing the instant of this date-time.

## Examples

### Using toInstant()

```js
const zdt = Temporal.ZonedDateTime.from(
  "2021-07-01T12:34:56.987654321-04:00[America/New_York]",
);
const instant = zdt.toInstant();
console.log(instant.toString()); // 2021-07-01T16:34:56.987654321Z
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.ZonedDateTime")}}
- {{jsxref("Temporal.Instant")}}
- {{jsxref("Temporal/ZonedDateTime/toPlainDate", "Temporal.ZonedDateTime.prototype.toPlainDate()")}}
- {{jsxref("Temporal/ZonedDateTime/toPlainTime", "Temporal.ZonedDateTime.prototype.toPlainTime()")}}
- {{jsxref("Temporal/ZonedDateTime/toPlainDateTime", "Temporal.ZonedDateTime.prototype.toPlainDateTime()")}}
- {{jsxref("Temporal/Instant/toZonedDateTimeISO", "Temporal.Instant.prototype.toZonedDateTimeISO()")}}
