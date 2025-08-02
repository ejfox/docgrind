---
title: "Reference Operators Right_shift_assignment"
slug: "reference-operators-right_shift_assignment"
path: "reference/operators/right_shift_assignment/index.md"
wordCount: 157
readingTime: 1
codeBlocks: 3
difficulty: "intermediate"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.775Z"
---


The **right shift assignment (`>>=`)** operator performs [right shift](/en-US/docs/Web/JavaScript/Reference/Operators/Right_shift) on the two operands and assigns the result to the left operand.

{{InteractiveExample("JavaScript Demo: Right shift assignment (>>=) operator")}}

```js interactive-example
let a = 5; //  00000000000000000000000000000101

a >>= 2; //  00000000000000000000000000000001
console.log(a);
// Expected output: 1

let b = -5; //  11111111111111111111111111111011

b >>= 2; //  11111111111111111111111111111110
console.log(b);
// Expected output: -2
```

## Syntax

```js-nolint
x >>= y
```

## Description

`x >>= y` is equivalent to `x = x >> y`, except that the expression `x` is only evaluated once.

## Examples

### Using right shift assignment

```js
let a = 5; //   (00000000000000000000000000000101)
a >>= 2; //   1 (00000000000000000000000000000001)

let b = -5; //  (-00000000000000000000000000000101)
b >>= 2; //  -2 (-00000000000000000000000000000010)

let c = 5n;
c >>= 2n; // 1n
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [Assignment operators in the JS guide](/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators#assignment_operators)
- [Right shift (`>>`)](/en-US/docs/Web/JavaScript/Reference/Operators/Right_shift)
