---
title: "Reference Global_objects Regexp Source"
slug: "reference-global_objects-regexp-source"
path: "reference/global_objects/regexp/source/index.md"
wordCount: 232
readingTime: 2
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: ["api"]
lastModified: "2025-08-02T14:03:23.636Z"
---


The **`source`** accessor property of {{jsxref("RegExp")}} instances returns a string containing the source text of this regular expression, without the two forward slashes on both sides or any flags.

{{InteractiveExample("JavaScript Demo: RegExp.prototype.source")}}

```js interactive-example
const regex = /fooBar/gi;

console.log(regex.source);
// Expected output: "fooBar"

console.log(new RegExp().source);
// Expected output: "(?:)"

console.log(new RegExp("\n").source === "\\n");
// Expected output: true (starting with ES5)
// Due to escaping
```

## Description

Conceptually, the `source` property is the text between the two forward slashes in the regular expression literal. The language requires the returned string to be properly escaped, so that when the `source` is concatenated with a forward slash on both ends, it would form a parsable regex literal. For example, for `new RegExp("/")`, the `source` is `\\/`, because if it generates `/`, the resulting literal becomes `///`, which is a line comment. Similarly, all [line terminators](/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#line_terminators) will be escaped because line terminator _characters_ would break up the regex literal. There's no requirement for other characters, as long as the result is parsable. For empty regular expressions, the string `(?:)` is returned.

## Examples

### Using source

```js
const regex = /fooBar/gi;

console.log(regex.source); // "fooBar", doesn't contain /.../ and "gi".
```

### Empty regular expressions and escaping

```js
new RegExp().source; // "(?:)"

new RegExp("\n").source === "\\n"; // true, starting with ES5
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("RegExp.prototype.flags")}}
