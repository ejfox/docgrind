---
title: "Reference Global_objects Symbol Description"
slug: "reference-global_objects-symbol-description"
path: "reference/global_objects/symbol/description/index.md"
wordCount: 163
readingTime: 1
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:16:44.532Z"
---


The **`description`** accessor property of {{jsxref("Symbol")}} values returns a string containing the description of this symbol, or `undefined` if the symbol has no description.

{{InteractiveExample("JavaScript Demo: Symbol.prototype.description")}}

```js interactive-example
console.log(Symbol("desc").description);
// Expected output: "desc"

console.log(Symbol.iterator.description);
// Expected output: "Symbol.iterator"

console.log(Symbol.for("foo").description);
// Expected output: "foo"

console.log(`${Symbol("foo").description}bar`);
// Expected output: "foobar"
```

## Description

{{jsxref("Symbol")}} objects can be created with an optional description which can be used for debugging but not to access the symbol itself. The `Symbol.prototype.description` property can be used to read that description. It is different to `Symbol.prototype.toString()` as it does not contain the enclosing `"Symbol()"` string. See the examples.

## Examples

### Using description

```js
Symbol("desc").toString(); // "Symbol(desc)"
Symbol("desc").description; // "desc"
Symbol("").description; // ""
Symbol().description; // undefined

// well-known symbols
Symbol.iterator.toString(); // "Symbol(Symbol.iterator)"
Symbol.iterator.description; // "Symbol.iterator"

// global symbols
Symbol.for("foo").toString(); // "Symbol(foo)"
Symbol.for("foo").description; // "foo"
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [Polyfill of `Symbol.prototype.description` in `core-js`](https://github.com/zloirock/core-js#ecmascript-symbol)
- [es-shims polyfill of `Symbol.prototype.description`](https://www.npmjs.com/package/symbol.prototype.description)
- {{jsxref("Symbol.prototype.toString()")}}
