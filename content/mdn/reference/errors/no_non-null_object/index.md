---
title: "Reference Errors No_non Null_object"
slug: "reference-errors-no_non-null_object"
path: "reference/errors/no_non-null_object/index.md"
wordCount: 183
readingTime: 1
codeBlocks: 3
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-08-02T14:03:23.455Z"
---


The JavaScript exception "is not a non-null object" occurs when an object is expected
somewhere and wasn't provided. [`null`](/en-US/docs/Web/JavaScript/Reference/Operators/null) is not an object and won't work.

## Message

```plain
TypeError: Property description must be an object: x (V8-based)
TypeError: Property descriptor must be an object, got "x" (Firefox)
TypeError: Property description must be an object. (Safari)
```

## Error type

{{jsxref("TypeError")}}

## What went wrong?

An object is expected somewhere and wasn't provided. [`null`](/en-US/docs/Web/JavaScript/Reference/Operators/null) is not an
object and won't work. You must provide a proper object in the given situation.

## Examples

### Property descriptor expected

When methods like {{jsxref("Object.create()")}} or
{{jsxref("Object.defineProperty()")}} and {{jsxref("Object.defineProperties()")}} are
used, the optional descriptor parameter expects a property descriptor object. Providing
no object (like just a number), will throw an error:

```js example-bad
Object.defineProperty({}, "key", 1);
// TypeError: 1 is not a non-null object

Object.defineProperty({}, "key", null);
// TypeError: null is not a non-null object
```

A valid property descriptor object might look like this:

```js example-good
Object.defineProperty({}, "key", { value: "foo", writable: false });
```

## See also

- {{jsxref("Object.create()")}}
- {{jsxref("Object.defineProperty()")}}
- {{jsxref("Object.defineProperties()")}}
