---
title: "Reference Global_objects Date Getmilliseconds"
slug: "reference-global_objects-date-getmilliseconds"
path: "reference/global_objects/date/getmilliseconds/index.md"
wordCount: 134
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-07-06T19:32:45.578Z"
---


{{JSRef}}

The **`getMilliseconds()`** method of {{jsxref("Date")}} instances returns the milliseconds for this date according to local time.

{{InteractiveExample("JavaScript Demo: Date.prototype.getMilliseconds()", "shorter")}}

```js interactive-example
const moonLanding = new Date("July 20, 69 00:20:18");
moonLanding.setMilliseconds(123);

console.log(moonLanding.getMilliseconds());
// Expected output: 123
```

## Syntax

```js-nolint
getMilliseconds()
```

### Parameters

None.

### Return value

An integer, between 0 and 999, representing the milliseconds for the given date according to local time. Returns `NaN` if the date is [invalid](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date).

## Examples

### Using getMilliseconds()

The `milliseconds` variable has value `0`, based on the value of the {{jsxref("Date")}} object `xmas95`, which doesn't specify the milliseconds component, so it defaults to 0.

```js
const xmas95 = new Date("1995-12-25T23:15:30");
const milliseconds = xmas95.getMilliseconds();

console.log(milliseconds); // 0
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Date.prototype.getUTCMilliseconds()")}}
- {{jsxref("Date.prototype.setMilliseconds()")}}
