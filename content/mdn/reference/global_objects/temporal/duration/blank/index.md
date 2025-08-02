---
title: "Reference Global_objects Temporal Duration Blank"
slug: "reference-global_objects-temporal-duration-blank"
path: "reference/global_objects/temporal/duration/blank/index.md"
wordCount: 89
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:44.549Z"
---


{{SeeCompatTable}}

The **`blank`** accessor property of {{jsxref("Temporal.Duration")}} instances returns a boolean that is `true` if this duration represents a zero duration, and `false` otherwise. It is equivalent to `duration.sign === 0`.

## Examples

### Using blank

```js
const d1 = Temporal.Duration.from({ hours: 1, minutes: 30 });
const d2 = Temporal.Duration.from({ hours: -1, minutes: -30 });
const d3 = Temporal.Duration.from({ hours: 0 });

console.log(d1.blank); // false
console.log(d2.blank); // false
console.log(d3.blank); // true
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.Duration")}}
- {{jsxref("Temporal/Duration/sign", "Temporal.Duration.prototype.sign")}}
