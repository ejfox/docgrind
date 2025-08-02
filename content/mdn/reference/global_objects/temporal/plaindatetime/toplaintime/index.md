---
title: "Reference Global_objects Temporal Plaindatetime Toplaintime"
slug: "reference-global_objects-temporal-plaindatetime-toplaintime"
path: "reference/global_objects/temporal/plaindatetime/toplaintime/index.md"
wordCount: 93
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:44.632Z"
---


{{SeeCompatTable}}

The **`toPlainTime()`** method of {{jsxref("Temporal.PlainDateTime")}} instances returns a new {{jsxref("Temporal.PlainTime")}} object representing the time part (hour, minute, second, and subsecond components) of this date-time.

## Syntax

```js-nolint
toPlainTime()
```

### Parameters

None.

### Return value

A new `Temporal.PlainTime` object representing the time part (hour, minute, second, and subsecond components) of this date-time.

## Examples

### Using toPlainTime()

```js
const dt = Temporal.PlainDateTime.from("2021-07-01T12:34:56");
const time = dt.toPlainTime();
console.log(time.toString()); // '12:34:56'
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainDateTime")}}
- {{jsxref("Temporal.PlainTime")}}
- {{jsxref("Temporal/PlainDateTime/toPlainDate", "Temporal.PlainDateTime.prototype.toPlainDate()")}}
- {{jsxref("Temporal/PlainDateTime/toZonedDateTime", "Temporal.PlainDateTime.prototype.toZonedDateTime()")}}
