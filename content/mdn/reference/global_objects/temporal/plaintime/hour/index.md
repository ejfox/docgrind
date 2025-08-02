---
title: "Reference Global_objects Temporal Plaintime Hour"
slug: "reference-global_objects-temporal-plaintime-hour"
path: "reference/global_objects/temporal/plaintime/hour/index.md"
wordCount: 143
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.707Z"
---


{{SeeCompatTable}}

The **`hour`** accessor property of {{jsxref("Temporal.PlainTime")}} instances returns a integer from 0 to 23 representing the hour component of this time.

The set accessor of `hour` is `undefined`. You cannot change this property directly. Use the {{jsxref("Temporal/PlainTime/with", "with()")}} method to create a new `Temporal.PlainTime` object with the desired new value.

## Examples

### Using hour

```js
const time = Temporal.PlainTime.from("12:34:56");
console.log(time.hour); // 12
```

### Changing hour

```js
const time = Temporal.PlainTime.from("12:34:56");
const newTime = time.with({ hour: 15 });
console.log(newTime.toString()); // 15:34:56
```

You can also use {{jsxref("Temporal/PlainTime/add", "add()")}} or {{jsxref("Temporal/PlainTime/subtract", "subtract()")}} to move a certain number of hours from the current time.

```js
const time = Temporal.PlainTime.from("12:34:56");
const newTime = time.add({ hours: 3 });
console.log(newTime.toString()); // 15:34:56
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
