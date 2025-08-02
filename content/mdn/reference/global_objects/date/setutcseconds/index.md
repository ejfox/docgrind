---
title: "Reference Global_objects Date Setutcseconds"
slug: "reference-global_objects-date-setutcseconds"
path: "reference/global_objects/date/setutcseconds/index.md"
wordCount: 220
readingTime: 2
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.521Z"
---


The **`setUTCSeconds()`** method of {{jsxref("Date")}} instances changes the seconds and/or milliseconds for this date according to universal time.

{{InteractiveExample("JavaScript Demo: Date.prototype.setUTCSeconds()")}}

```js interactive-example
const date = new Date("December 31, 1975, 23:15:30 GMT+11:00");

console.log(date.getUTCSeconds());
// Expected output: 30

date.setUTCSeconds(39);

console.log(date.getUTCSeconds());
// Expected output: 39
```

## Syntax

```js-nolint
setUTCSeconds(secondsValue)
setUTCSeconds(secondsValue, msValue)
```

### Parameters

- `secondsValue`
  - : An integer between 0 and 59 representing the seconds.
- `msValue` {{optional_inline}}
  - : An integer between 0 and 999 representing the milliseconds.

### Return value

Changes the {{jsxref("Date")}} object in place, and returns its new [timestamp](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date). If a parameter is `NaN` (or other values that get [coerced](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_coercion) to `NaN`, such as `undefined`), the date is set to [Invalid Date](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date) and `NaN` is returned.

## Description

If you do not specify the `msValue` parameter, the value returned from the
{{jsxref("Date/getUTCMilliseconds", "getUTCMilliseconds()")}} method is
used.

If a parameter you specify is outside of the expected range,
`setUTCSeconds()` attempts to update the date information in the
{{jsxref("Date")}} object accordingly. For example, if you use 100 for
`secondsValue`, the minutes stored in the {{jsxref("Date")}} object will be
incremented by 1, and 40 will be used for seconds.

## Examples

### Using setUTCSeconds()

```js
const theBigDay = new Date();
theBigDay.setUTCSeconds(20);
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Date.prototype.getUTCSeconds()")}}
- {{jsxref("Date.prototype.setSeconds()")}}
