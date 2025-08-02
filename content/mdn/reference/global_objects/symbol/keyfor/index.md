---
title: "Reference Global_objects Symbol Keyfor"
slug: "reference-global_objects-symbol-keyfor"
path: "reference/global_objects/symbol/keyfor/index.md"
wordCount: 152
readingTime: 1
codeBlocks: 3
difficulty: "intermediate"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.665Z"
---


The **`Symbol.keyFor()`** static method retrieves a shared symbol
key from the global symbol registry for the given symbol.

{{InteractiveExample("JavaScript Demo: Symbol.keyFor()")}}

```js interactive-example
const globalSym = Symbol.for("foo"); // Global symbol

console.log(Symbol.keyFor(globalSym));
// Expected output: "foo"

const localSym = Symbol(); // Local symbol

console.log(Symbol.keyFor(localSym));
// Expected output: undefined

console.log(Symbol.keyFor(Symbol.iterator));
// Expected output: undefined
```

## Syntax

```js-nolint
Symbol.keyFor(sym)
```

### Parameters

- `sym`
  - : Symbol, required. The symbol to find a key for.

### Return value

A string representing the key for the given symbol if one is found on the [global registry](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#shared_symbols_in_the_global_symbol_registry); otherwise, {{jsxref("undefined")}}.

## Examples

### Using keyFor()

```js
const globalSym = Symbol.for("foo"); // create a new global symbol
Symbol.keyFor(globalSym); // "foo"

const localSym = Symbol();
Symbol.keyFor(localSym); // undefined

// well-known symbols are not symbols registered
// in the global symbol registry
Symbol.keyFor(Symbol.iterator); // undefined
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Symbol.for()")}}
