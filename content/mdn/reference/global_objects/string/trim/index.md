---
title: "Reference Global_objects String Trim"
slug: "reference-global_objects-string-trim"
path: "reference/global_objects/string/trim/index.md"
wordCount: 168
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.662Z"
---


The **`trim()`** method of {{jsxref("String")}} values removes whitespace from both ends of this string and returns a new string, without modifying the original string.

To return a new string with whitespace trimmed from just one end, use {{jsxref("String/trimStart", "trimStart()")}} or {{jsxref("String/trimEnd", "trimEnd()")}}.

{{InteractiveExample("JavaScript Demo: String.prototype.trim()")}}

```js interactive-example
const greeting = "   Hello world!   ";

console.log(greeting);
// Expected output: "   Hello world!   ";

console.log(greeting.trim());
// Expected output: "Hello world!";
```

## Syntax

```js-nolint
trim()
```

### Parameters

None.

### Return value

A new string representing `str` stripped of whitespace from both its beginning and end. Whitespace is defined as [white space](/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#white_space) characters plus [line terminators](/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#line_terminators).

If neither the beginning or end of `str` has any whitespace, a new string is still returned (essentially a copy of `str`).

## Examples

### Using trim()

The following example trims whitespace from both ends of `str`.

```js
const str = "   foo  ";
console.log(str.trim()); // 'foo'
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("String.prototype.trimStart()")}}
- {{jsxref("String.prototype.trimEnd()")}}
