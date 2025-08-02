---
title: "Reference Global_objects Temporal Now Instant"
slug: "reference-global_objects-temporal-now-instant"
path: "reference/global_objects/temporal/now/instant/index.md"
wordCount: 99
readingTime: 1
codeBlocks: 2
difficulty: "beginner"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.682Z"
---


{{SeeCompatTable}}

The **`Temporal.Now.instant()`** static method returns the current time as a {{jsxref("Temporal.Instant")}} object.

## Syntax

```js-nolint
Temporal.Now.instant()
```

### Parameters

None.

### Return value

A {{jsxref("Temporal.Instant")}} object representing the current time, with potentially [reduced precision](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Now#reduced_time_precision).

## Examples

### Measuring time elapsed

The following example measures two instants in time and calculates the [duration](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Duration) between them, and gets the total duration in milliseconds:

```js
const start = Temporal.Now.instant();
// Do something that takes time
const end = Temporal.Now.instant();
const duration = end.since(start);
console.log(duration.total("milliseconds"));
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.Now")}}
- {{jsxref("Temporal.Instant")}}
