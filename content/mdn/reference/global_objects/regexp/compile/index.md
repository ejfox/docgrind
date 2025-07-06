---
title: "Reference Global_objects Regexp Compile"
slug: "reference-global_objects-regexp-compile"
path: "reference/global_objects/regexp/compile/index.md"
wordCount: 150
readingTime: 1
codeBlocks: 2
difficulty: "beginner"
category: "Reference"
tags: ["objects"]
lastModified: "2025-07-06T19:32:45.728Z"
---


{{JSRef}} {{Deprecated_Header}}

> [!NOTE]
> The `compile()` method is only specified for compatibility reasons. Using `compile()` causes the otherwise immutable regex source and flags to become mutable, which may break user expectations. You can use the [`RegExp()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp) constructor to construct a new regular expression object instead.

The **`compile()`** method of {{jsxref("RegExp")}} instances is used to recompile a regular expression with new source and flags after the `RegExp` object has already been created.

## Syntax

```js-nolint
compile(pattern, flags)
```

### Parameters

- `pattern`
  - : The text of the regular expression.
- `flags`
  - : Any combination of [flag values](/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#flags).

### Return value

None ({{jsxref("undefined")}}).

## Examples

### Using compile()

The following example shows how to recompile a regular expression with a new pattern and a new flag.

```js
const regexObj = /foo/gi;
regexObj.compile("new foo", "g");
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("RegExp")}}
