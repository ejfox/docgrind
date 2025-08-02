---
title: "Reference Errors Missing_bracket_after_list"
slug: "reference-errors-missing_bracket_after_list"
path: "reference/errors/missing_bracket_after_list/index.md"
wordCount: 160
readingTime: 1
codeBlocks: 3
difficulty: "intermediate"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:43.944Z"
---


The JavaScript exception "missing ] after element list" occurs when there is an error
with the array initializer syntax somewhere. Likely there is a closing square bracket
(`]`) or a comma (`,`) missing.

## Message

```plain
SyntaxError: missing ] after element list (Firefox)
SyntaxError: Unexpected token ';'. Expected either a closing ']' or a ',' following an array element. (Safari)
```

## Error type

{{jsxref("SyntaxError")}}.

## What went wrong?

There is an error with the array initializer syntax somewhere. Likely there is a
closing square bracket (`]`) or a comma (`,`) missing.

## Examples

### Incomplete array initializer

```js-nolint example-bad
const list = [1, 2,

const instruments = [
  "Ukulele",
  "Guitar",
  "Piano",
};

const data = [{ foo: "bar" } { bar: "foo" }];
```

Correct would be:

```js example-good
const list = [1, 2];

const instruments = ["Ukulele", "Guitar", "Piano"];

const data = [{ foo: "bar" }, { bar: "foo" }];
```

## See also

- {{jsxref("Array")}}
