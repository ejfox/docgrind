---
title: "Reference Global_objects Regexp Global"
slug: "reference-global_objects-regexp-global"
path: "reference/global_objects/regexp/global/index.md"
wordCount: 207
readingTime: 2
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.451Z"
---


The **`global`** accessor property of {{jsxref("RegExp")}} instances returns whether or not the `g` flag is used with this regular expression.

{{InteractiveExample("JavaScript Demo: RegExp.prototype.global")}}

```js interactive-example
const regex1 = /foo/g;

console.log(regex1.global);
// Expected output: true

const regex2 = /bar/i;

console.log(regex2.global);
// Expected output: false
```

## Description

`RegExp.prototype.global` has the value `true` if the `g` flag was used; otherwise, `false`. The `g` flag indicates that the regular expression should be tested against all possible matches in a string. Each call to [`exec()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec) will update its [`lastIndex`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex) property, so that the next call to `exec()` will start at the next character.

Some methods, such as [`String.prototype.matchAll()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll) and [`String.prototype.replaceAll()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll), will validate that, if the parameter is a regex, it is global. The regex's [`[Symbol.match]()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/Symbol.match) and [`[Symbol.replace]()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/Symbol.replace) methods (called by [`String.prototype.match()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match) and [`String.prototype.replace()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace)) would also have different behaviors when the regex is global.

The set accessor of `global` is `undefined`. You cannot change this property directly.

## Examples

### Using global

```js
const globalRegex = /foo/g;

const str = "fooexamplefoo";
console.log(str.replace(globalRegex, "")); // example

const nonGlobalRegex = /foo/;
console.log(str.replace(nonGlobalRegex, "")); // examplefoo
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("RegExp.prototype.lastIndex")}}
- {{jsxref("RegExp.prototype.dotAll")}}
- {{jsxref("RegExp.prototype.hasIndices")}}
- {{jsxref("RegExp.prototype.ignoreCase")}}
- {{jsxref("RegExp.prototype.multiline")}}
- {{jsxref("RegExp.prototype.source")}}
- {{jsxref("RegExp.prototype.sticky")}}
- {{jsxref("RegExp.prototype.unicode")}}
