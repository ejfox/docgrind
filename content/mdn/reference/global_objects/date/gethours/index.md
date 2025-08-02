---
title: "Reference Global_objects Date Gethours"
slug: "reference-global_objects-date-gethours"
path: "reference/global_objects/date/gethours/index.md"
wordCount: 121
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.513Z"
---


The **`getHours()`** method of {{jsxref("Date")}} instances returns the hours for this date according to local time.

{{InteractiveExample("JavaScript Demo: Date.prototype.getHours()", "shorter")}}

```js interactive-example
const birthday = new Date("March 13, 08 04:20");

console.log(birthday.getHours());
// Expected output: 4
```

## Syntax

```js-nolint
getHours()
```

### Parameters

None.

### Return value

An integer, between 0 and 23, representing the hours for the given date according to local time. Returns `NaN` if the date is [invalid](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date).

## Examples

### Using getHours()

The `hours` variable has value `23`, based on the value of the {{jsxref("Date")}} object `xmas95`.

```js
const xmas95 = new Date("1995-12-25T23:15:30");
const hours = xmas95.getHours();

console.log(hours); // 23
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Date.prototype.getUTCHours()")}}
- {{jsxref("Date.prototype.setHours()")}}
