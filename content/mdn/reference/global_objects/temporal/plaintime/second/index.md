---
title: "Reference Global_objects Temporal Plaintime Second"
slug: "reference-global_objects-temporal-plaintime-second"
path: "reference/global_objects/temporal/plaintime/second/index.md"
wordCount: 152
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:44.655Z"
---


{{SeeCompatTable}}

The **`second`** accessor property of {{jsxref("Temporal.PlainTime")}} instances returns a integer from 0 to 59 representing the second component of this time.

The set accessor of `second` is `undefined`. You cannot change this property directly. Use the {{jsxref("Temporal/PlainTime/with", "with()")}} method to create a new `Temporal.PlainTime` object with the desired new value.

## Examples

### Using second

```js
const time = Temporal.PlainTime.from("12:34:56");
console.log(time.second); // 56
```

### Changing second

```js
const time = Temporal.PlainTime.from("12:34:56");
const newTime = time.with({ second: 15 });
console.log(newTime.toString()); // 12:34:15
```

You can also use {{jsxref("Temporal/PlainTime/add", "add()")}} or {{jsxref("Temporal/PlainTime/subtract", "subtract()")}} to move a certain number of seconds from the current time.

```js
const time = Temporal.PlainTime.from("12:34:56");
const newTime = time.subtract({ seconds: 41 });
console.log(newTime.toString()); // 12:34:15
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainTime")}}
- {{jsxref("Temporal/PlainTime/with", "Temporal.PlainTime.prototype.with()")}}
- {{jsxref("Temporal/PlainTime/add", "Temporal.PlainTime.prototype.add()")}}
- {{jsxref("Temporal/PlainTime/subtract", "Temporal.PlainTime.prototype.subtract()")}}
- {{jsxref("Temporal/PlainTime/millisecond", "Temporal.PlainTime.prototype.millisecond")}}
- {{jsxref("Temporal/PlainTime/microsecond", "Temporal.PlainTime.prototype.microsecond")}}
- {{jsxref("Temporal/PlainTime/nanosecond", "Temporal.PlainTime.prototype.nanosecond")}}
