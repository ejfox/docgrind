---
title: "Reference Global_objects String Tolowercase"
slug: "reference-global_objects-string-tolowercase"
path: "reference/global_objects/string/tolowercase/index.md"
wordCount: 121
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:44.524Z"
---


The **`toLowerCase()`** method of {{jsxref("String")}} values returns this string converted to lower case.

{{InteractiveExample("JavaScript Demo: String.prototype.toLowerCase()", "shorter")}}

```js interactive-example
const sentence = "The quick brown fox jumps over the lazy dog.";

console.log(sentence.toLowerCase());
// Expected output: "the quick brown fox jumps over the lazy dog."
```

## Syntax

```js-nolint
toLowerCase()
```

### Parameters

None.

### Return value

A new string representing the calling string converted to lower case.

## Description

The `toLowerCase()` method returns the value of the string converted to
lower case. `toLowerCase()` does not affect the value of the string
`str` itself.

## Examples

### Using `toLowerCase()`

```js
console.log("ALPHABET".toLowerCase()); // 'alphabet'
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("String.prototype.toLocaleLowerCase()")}}
- {{jsxref("String.prototype.toLocaleUpperCase()")}}
- {{jsxref("String.prototype.toUpperCase()")}}
