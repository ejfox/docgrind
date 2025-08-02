---
title: "Reference Global_objects Intl Locale Gettimezones"
slug: "reference-global_objects-intl-locale-gettimezones"
path: "reference/global_objects/intl/locale/gettimezones/index.md"
wordCount: 219
readingTime: 2
codeBlocks: 4
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.254Z"
---


The **`getTimeZones()`** method of {{jsxref("Intl.Locale")}} instances returns a list of supported time zones for this locale.

> [!NOTE]
> In some versions of some browsers, this method was implemented as an accessor property called `timeZones`. However, because it returns a new array on each access, it is now implemented as a method to prevent the situation of `locale.timeZones === locale.timeZones` returning `false`. Check the [browser compatibility table](#browser_compatibility) for details.

## Syntax

```js-nolint
getTimeZones()
```

### Parameters

None.

### Return value

An array of strings representing supported time zones for the associated `Locale`, where each value is an [IANA time zone canonical name](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime#time_zones_and_offsets), sorted in alphabetical order. If the locale identifier does not contain a region subtag, the returned value is `undefined`.

> [!NOTE]
> The standardization of `Temporal` requires browsers to always return the primary identifier in the IANA database, which may change over time. See [time zones and offsets](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime#time_zones_and_offsets) for more information.

## Examples

### Obtaining supported time zones

List supported time zones for a given `Locale`.

```js
const arEG = new Intl.Locale("ar-EG");
console.log(arEG.getTimeZones()); // ["Africa/Cairo"]
```

```js
const jaJP = new Intl.Locale("ja-JP");
console.log(jaJP.getTimeZones()); // ["Asia/Tokyo"]
```

```js
const ar = new Intl.Locale("ar");
console.log(ar.getTimeZones()); // undefined
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Intl.Locale")}}
- [IANA time zone database](https://en.wikipedia.org/wiki/Daylight_saving_time#IANA_time_zone_database) on Wikipedia
