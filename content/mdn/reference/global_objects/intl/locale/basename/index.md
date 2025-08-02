---
title: "Reference Global_objects Intl Locale Basename"
slug: "reference-global_objects-intl-locale-basename"
path: "reference/global_objects/intl/locale/basename/index.md"
wordCount: 202
readingTime: 2
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:44.245Z"
---


The **`baseName`** accessor property of {{jsxref("Intl.Locale")}} instances returns a substring of this locale's string representation, containing core information about this locale, including the language, script, region, and variants, if available.

## Description

`baseName` returns the `language ["-" script] ["-" region] *("-" variant)` subsequence of the [unicode_language_id grammar](https://www.unicode.org/reports/tr35/#Identifiers). It only includes information explicitly specified in the constructor, either through the locale identifier string or the options object.

The set accessor of `baseName` is `undefined`. You cannot change this property directly.

## Examples

### Basic example

```js
const myLoc = new Intl.Locale("fr-Latn-CA"); // Sets locale to Canadian French
console.log(myLoc.toString()); // "fr-Latn-CA-u-ca-gregory"
console.log(myLoc.baseName); // "fr-Latn-CA"
```

### Example with extension tags in the input string

```js
// Sets language to Japanese, region to Japan,
// calendar to Gregorian, hour cycle to 24 hours
const japan = new Intl.Locale("ja-JP-u-ca-gregory-hc-24");
console.log(japan.toString()); // "ja-JP-u-ca-gregory-hc-h24"
console.log(japan.baseName); // "ja-JP"
```

### Example with options that override input string

```js
// Input string indicates language as Dutch and region as Belgium,
// but options object overrides the region and sets it to the Netherlands
const dutch = new Intl.Locale("nl-Latn-BE", { region: "NL" });

console.log(dutch.baseName); // "nl-Latn-NL"
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Intl.Locale")}}
