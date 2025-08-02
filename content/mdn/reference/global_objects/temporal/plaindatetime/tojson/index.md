---
title: "Reference Global_objects Temporal Plaindatetime Tojson"
slug: "reference-global_objects-temporal-plaindatetime-tojson"
path: "reference/global_objects/temporal/plaindatetime/tojson/index.md"
wordCount: 226
readingTime: 2
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.631Z"
---


{{SeeCompatTable}}

The **`toJSON()`** method of {{jsxref("Temporal.PlainDateTime")}} instances returns a string representing this date-time in the same [RFC 9557 format](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime#rfc_9557_format) as calling {{jsxref("Temporal/PlainDateTime/toString", "toString()")}}. It is intended to be implicitly called by {{jsxref("JSON.stringify()")}}.

## Syntax

```js-nolint
toJSON()
```

### Parameters

None.

### Return value

A string representing the given date-time in the [RFC 9557 format](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime#rfc_9557_format), with the calendar annotation included if it is not `"iso8601"`.

## Description

The `toJSON()` method is automatically called by {{jsxref("JSON.stringify()")}} when a `Temporal.PlainDateTime` object is stringified. This method is generally intended to, by default, usefully serialize `Temporal.PlainDateTime` objects during [JSON](/en-US/docs/Glossary/JSON) serialization, which can then be deserialized using the {{jsxref("Temporal/PlainDateTime/from", "Temporal.PlainDateTime.from()")}} function as the reviver of {{jsxref("JSON.parse()")}}.

## Examples

### Using toJSON()

```js
const dt = Temporal.PlainDateTime.from({ year: 2021, month: 8, day: 1 });
const dtStr = dt.toJSON(); // '2021-08-01T00:00:00'
const dt2 = Temporal.PlainDateTime.from(dtStr);
```

### JSON serialization and parsing

This example shows how `Temporal.PlainDateTime` can be serialized as JSON without extra effort, and how to parse it back.

```js
const dt = Temporal.PlainDateTime.from({ year: 2021, month: 8, day: 1 });
const jsonStr = JSON.stringify({ nextBilling: dt }); // '{"nextBilling":"2021-08-01T00:00:00"}'
const obj = JSON.parse(jsonStr, (key, value) => {
  if (key === "nextBilling") {
    return Temporal.PlainDateTime.from(value);
  }
  return value;
});
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Temporal.PlainDateTime")}}
- {{jsxref("Temporal/PlainDateTime/from", "Temporal.PlainDateTime.from()")}}
- {{jsxref("Temporal/PlainDateTime/toString", "Temporal.PlainDateTime.prototype.toString()")}}
- {{jsxref("Temporal/PlainDateTime/toLocaleString", "Temporal.PlainDateTime.prototype.toLocaleString()")}}
