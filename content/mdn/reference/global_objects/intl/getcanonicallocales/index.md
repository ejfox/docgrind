---
title: "Reference Global_objects Intl Getcanonicallocales"
slug: "reference-global_objects-intl-getcanonicallocales"
path: "reference/global_objects/intl/getcanonicallocales/index.md"
wordCount: 159
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.552Z"
---


The **`Intl.getCanonicalLocales()`** static method returns an array
containing the canonical locale names. Duplicates will be omitted and elements will be
validated as structurally valid language tags.

{{InteractiveExample("JavaScript Demo: Intl.getCanonicalLocales()")}}

```js interactive-example
console.log(Intl.getCanonicalLocales("EN-US"));
// Expected output: Array ["en-US"]

console.log(Intl.getCanonicalLocales(["EN-US", "Fr"]));
// Expected output: Array ["en-US", "fr"]

try {
  Intl.getCanonicalLocales("EN_US");
} catch (err) {
  console.log(err.toString());
  // Expected output (Firefox/Safari): RangeError: invalid language tag: "EN_US"
  // Expected output (Chrome): RangeError: Incorrect locale information provided
}
```

## Syntax

```js-nolint
Intl.getCanonicalLocales(locales)
```

### Parameters

- `locales`
  - : A list of {{jsxref("String")}} values for which to get the canonical locale names.

### Return value

An array containing the canonical locale names.

## Examples

### Using getCanonicalLocales

```js
Intl.getCanonicalLocales("EN-US"); // ["en-US"]
Intl.getCanonicalLocales(["EN-US", "Fr"]); // ["en-US", "fr"]

Intl.getCanonicalLocales("EN_US");
// RangeError:'EN_US' is not a structurally valid language tag
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [Polyfill of `Intl.getCanonicalLocales` in FormatJS](https://formatjs.github.io/docs/polyfills/intl-getcanonicallocales/)
- {{jsxref("Intl/NumberFormat/supportedLocalesOf", "Intl.NumberFormat.supportedLocalesOf()")}}
- {{jsxref("Intl/DateTimeFormat/supportedLocalesOf", "Intl.DateTimeFormat.supportedLocalesOf()")}}
- {{jsxref("Intl/Collator/supportedLocalesOf", "Intl.Collator.supportedLocalesOf()")}}
