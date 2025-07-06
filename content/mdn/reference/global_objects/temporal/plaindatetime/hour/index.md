---
title: "Reference Global_objects Temporal Plaindatetime Hour"
slug: "reference-global_objects-temporal-plaindatetime-hour"
path: "reference/global_objects/temporal/plaindatetime/hour/index.md"
wordCount: 100
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-07-06T19:32:45.809Z"
---


{{JSRef}}{{SeeCompatTable}}

The **`hour`** accessor property of {{jsxref("Temporal.PlainDateTime")}} instances returns a integer from 0 to 23 representing the hour component of this time.

The set accessor of `hour` is `undefined`. You cannot change this property directly. Use the {{jsxref("Temporal/PlainDateTime/with", "with()")}} method to create a new `Temporal.PlainDateTime` object with the desired new value.

For general information and more examples, see {{jsxref("Temporal/PlainTime/hour", "Temporal.PlainTime.prototype.hour")}}.

## Examples

### Using hour

```js
const dt = Temporal.PlainDateTime.from("2021-07-01T12:34:56.123456789");
console.log(dt.hour); // 12
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
- {{jsxref("Temporal/PlainTime/hour", "Temporal.PlainTime.prototype.hour")}}
