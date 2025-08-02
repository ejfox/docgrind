---
title: "Reference Operators Left_shift_assignment"
slug: "reference-operators-left_shift_assignment"
path: "reference/operators/left_shift_assignment/index.md"
wordCount: 131
readingTime: 1
codeBlocks: 3
difficulty: "intermediate"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:16:44.802Z"
---


The **left shift assignment (`<<=`)** operator performs [left shift](/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift) on the two operands and assigns the result to the left operand.

{{InteractiveExample("JavaScript Demo: Left shift assignment (<<=) operator", "shorter")}}

```js interactive-example
let a = 5; // 00000000000000000000000000000101

a <<= 2; // 00000000000000000000000000010100

console.log(a);
// Expected output: 20
```

## Syntax

```js-nolint
x <<= y
```

## Description

`x <<= y` is equivalent to `x = x << y`, except that the expression `x` is only evaluated once.

## Examples

### Using left shift assignment

```js
let a = 5;
// 00000000000000000000000000000101

a <<= 2; // 20
// 00000000000000000000000000010100

let b = 5n;
b <<= 2n; // 20n
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [Assignment operators in the JS guide](/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators#assignment_operators)
- [Left shift (`<<`)](/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift)
