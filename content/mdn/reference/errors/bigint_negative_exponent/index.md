---
title: "Reference Errors Bigint_negative_exponent"
slug: "reference-errors-bigint_negative_exponent"
path: "reference/errors/bigint_negative_exponent/index.md"
wordCount: 194
readingTime: 1
codeBlocks: 3
difficulty: "intermediate"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.440Z"
---


The JavaScript exception "BigInt negative exponent" occurs when a {{jsxref("BigInt")}} is raised to the power of a negative BigInt value.

## Message

```plain
RangeError: Exponent must be positive (V8-based)
RangeError: BigInt negative exponent (Firefox)
RangeError: Negative exponent is not allowed (Safari)
```

## Error type

{{jsxref("RangeError")}}.

## What went wrong?

The exponent of an [exponentiation](/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation) operation must be positive. Since negative exponents would take the reciprocal of the base, the result will be between -1 and 1 in almost all cases, which gets rounded to `0n`. To catch mistakes, negative exponents are not allowed. Check if the exponent is non-negative before doing exponentiation.

## Examples

### Using a negative BigInt as exponent

```js example-bad
const a = 1n;
const b = -1n;
const c = a ** b;
// RangeError: BigInt negative exponent
```

Instead, check if the exponent is negative first, and either issue an error with a better message, or fallback to a different value, like `0n` or `undefined`.

```js example-good
const a = 1n;
const b = -1n;
const quotient = b >= 0n ? a ** b : 0n;
```

## See also

- [`BigInt`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- [Exponentiation (`**`)](/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation)
