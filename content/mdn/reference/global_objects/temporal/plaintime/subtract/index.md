---
title: "Reference Global_objects Temporal Plaintime Subtract"
slug: "reference-global_objects-temporal-plaintime-subtract"
path: "reference/global_objects/temporal/plaintime/subtract/index.md"
wordCount: 181
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-07-06T19:32:45.823Z"
---


{{JSRef}}{{SeeCompatTable}}

The **`subtract()`** method of {{jsxref("Temporal.PlainTime")}} instances returns a new `Temporal.PlainTime` object representing this time moved backward by a given duration (in a form convertible by {{jsxref("Temporal/Duration/from", "Temporal.Duration.from()")}}), wrapping around the clock if necessary.

If you want to subtract two times and get a duration, use {{jsxref("Temporal/PlainTime/since", "since()")}} or {{jsxref("Temporal/PlainTime/until", "until()")}} instead.

## Syntax

```js-nolint
subtract(duration)
```

### Parameters

- `duration`
  - : A string, an object, or a {{jsxref("Temporal.Duration")}} instance representing a duration to subtract from this time. It is converted to a `Temporal.Duration` object using the same algorithm as {{jsxref("Temporal/Duration/from", "Temporal.Duration.from()")}}.

### Return value

A new `Temporal.PlainTime` object representing the time specified by the original `PlainTime`, minus the duration.

Subtracting a duration is equivalent to [adding](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainTime/add) its [negation](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Duration/negated), so all the same considerations apply.

## Examples

### Subtracting a duration

```js
const start = Temporal.PlainTime.from("12:34:56");
const end = start.subtract({ hours: 1, minutes: 30 });
console.log(end.toString()); // 11:04:56
```

For more examples, see {{jsxref("Temporal/PlainTime/add", "add()")}}.

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainTime")}}
- {{jsxref("Temporal.Duration")}}
- {{jsxref("Temporal/PlainTime/add", "Temporal.PlainTime.prototype.add()")}}
- {{jsxref("Temporal/PlainTime/since", "Temporal.PlainTime.prototype.since()")}}
- {{jsxref("Temporal/PlainTime/until", "Temporal.PlainTime.prototype.until()")}}
