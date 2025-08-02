---
title: "Reference Global_objects Date Getutchours"
slug: "reference-global_objects-date-getutchours"
path: "reference/global_objects/date/getutchours/index.md"
wordCount: 132
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.515Z"
---


The **`getUTCHours()`** method of {{jsxref("Date")}} instances returns the hours for this date according to universal time.

{{InteractiveExample("JavaScript Demo: Date.prototype.getUTCHours()")}}

```js interactive-example
const date1 = new Date("December 31, 1975, 23:15:30 GMT+11:00");
const date2 = new Date("December 31, 1975, 23:15:30 GMT-11:00");

console.log(date1.getUTCHours());
// Expected output: 12

console.log(date2.getUTCHours());
// Expected output: 10
```

## Syntax

```js-nolint
getUTCHours()
```

### Parameters

None.

### Return value

An integer, between 0 and 23, representing the hours for the given date according to universal time. Returns `NaN` if the date is [invalid](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date).

## Examples

### Using getUTCHours()

The following example assigns the hours portion of the current time to the variable `hours`.

```js
const today = new Date();
const hours = today.getUTCHours();
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Date.prototype.getHours()")}}
- {{jsxref("Date.prototype.setUTCHours()")}}
