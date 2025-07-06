---
title: "Reference Global_objects Math Pi"
slug: "reference-global_objects-math-pi"
path: "reference/global_objects/math/pi/index.md"
wordCount: 148
readingTime: 1
codeBlocks: 2
difficulty: "intermediate"
category: "Reference"
tags: []
lastModified: "2025-07-06T19:32:45.666Z"
---


{{JSRef}}

The **`Math.PI`** static data property represents the ratio of the circumference of a circle to its diameter, approximately 3.14159.

{{InteractiveExample("JavaScript Demo: Math.PI")}}

```js interactive-example
function calculateCircumference(radius) {
  return 2 * Math.PI * radius;
}

console.log(Math.PI);
// Expected output: 3.141592653589793

console.log(calculateCircumference(10));
// Expected output: 62.83185307179586
```

## Value

<!-- prettier-ignore-start -->
<math display="block">
  <semantics><mrow><mi>𝙼𝚊𝚝𝚑.𝙿𝙸</mi><mo>=</mo><mi>π</mi><mo>≈</mo><mn>3.14159</mn></mrow><annotation encoding="TeX">\mathtt{Math.PI} = \pi \approx 3.14159</annotation></semantics>
</math>
<!-- prettier-ignore-end -->

{{js_property_attributes(0, 0, 0)}}

## Description

Because `PI` is a static property of `Math`, you always use it as `Math.PI`, rather than as a property of a `Math` object you created (`Math` is not a constructor).

## Examples

### Using Math.PI

The following function uses `Math.PI` to calculate the circumference of a circle with a passed radius.

```js
function calculateCircumference(radius) {
  return Math.PI * (radius + radius);
}

calculateCircumference(1); // 6.283185307179586
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- {{jsxref("Math")}}
