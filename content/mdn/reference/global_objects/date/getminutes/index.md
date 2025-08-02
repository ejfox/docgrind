---
title: "Reference Global_objects Date Getminutes"
slug: "reference-global_objects-date-getminutes"
path: "reference/global_objects/date/getminutes/index.md"
wordCount: 121
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.513Z"
---


The **`getMinutes()`** method of {{jsxref("Date")}} instances returns the minutes for this date according to local time.

{{InteractiveExample("JavaScript Demo: Date.prototype.getMinutes()", "shorter")}}

```js interactive-example
const birthday = new Date("March 13, 08 04:20");

console.log(birthday.getMinutes());
// Expected output: 20
```

## Syntax

```js-nolint
getMinutes()
```

### Parameters

None.

### Return value

An integer, between 0 and 59, representing the minutes for the given date according to local time. Returns `NaN` if the date is [invalid](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date).

## Examples

### Using getMinutes()

The `minutes` variable has value `15`, based on the value of the {{jsxref("Date")}} object `xmas95`.

```js
const xmas95 = new Date("1995-12-25T23:15:30");
const minutes = xmas95.getMinutes();

console.log(minutes); // 15
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Date.prototype.getUTCMinutes()")}}
- {{jsxref("Date.prototype.setMinutes()")}}
