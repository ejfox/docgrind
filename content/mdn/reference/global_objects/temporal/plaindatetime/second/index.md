---
title: "Reference Global_objects Temporal Plaindatetime Second"
slug: "reference-global_objects-temporal-plaindatetime-second"
path: "reference/global_objects/temporal/plaindatetime/second/index.md"
wordCount: 109
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:44.629Z"
---


{{SeeCompatTable}}

The **`second`** accessor property of {{jsxref("Temporal.PlainDateTime")}} instances returns a integer from 0 to 59 representing the second component of this time.

The set accessor of `second` is `undefined`. You cannot change this property directly. Use the {{jsxref("Temporal/PlainDateTime/with", "with()")}} method to create a new `Temporal.PlainDateTime` object with the desired new value.

For general information and more examples, see {{jsxref("Temporal/PlainTime/second", "Temporal.PlainTime.prototype.second")}}.

## Examples

### Using second

```js
const dt = Temporal.PlainDateTime.from("2021-07-01T12:34:56.123456789");
console.log(dt.second); // 56
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
- {{jsxref("Temporal/PlainDateTime/millisecond", "Temporal.PlainDateTime.prototype.millisecond")}}
- {{jsxref("Temporal/PlainDateTime/microsecond", "Temporal.PlainDateTime.prototype.microsecond")}}
- {{jsxref("Temporal/PlainDateTime/nanosecond", "Temporal.PlainDateTime.prototype.nanosecond")}}
- {{jsxref("Temporal/PlainTime/second", "Temporal.PlainTime.prototype.second")}}
