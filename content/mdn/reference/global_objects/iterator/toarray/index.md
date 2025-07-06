---
title: "Reference Global_objects Iterator Toarray"
slug: "reference-global_objects-iterator-toarray"
path: "reference/global_objects/iterator/toarray/index.md"
wordCount: 207
readingTime: 2
codeBlocks: 2
difficulty: "advanced"
category: "Reference"
tags: []
lastModified: "2025-07-06T19:32:45.645Z"
---


{{JSRef}}

The **`toArray()`** method of {{jsxref("Iterator")}} instances creates a new {{jsxref("Array")}} instance populated with the elements yielded from the iterator.

## Syntax

```js-nolint
toArray()
```

### Parameters

None.

### Return value

A new {{jsxref("Array")}} instance containing the elements from the iterator in the order they were produced.

## Examples

### Using toArray()

`iterator.toArray()` is equivalent to `Array.from(iterator)` and `[...iterator]`, except that it's easier to chain when multiple iterator helper methods are involved. The following example creates an iterator that yields terms in the Fibonacci sequence, takes the first 10 terms, filters out the odd numbers, and converts the result to an array:

```js
function* fibonacci() {
  let current = 1;
  let next = 1;
  while (true) {
    yield current;
    [current, next] = [next, current + next];
  }
}

const array = fibonacci()
  .take(10)
  .filter((x) => x % 2 === 0)
  .toArray();

console.log(array); // [2, 8, 34]
```

Note that it's a good idea to call `toArray()` as a last step of your processing. For example, `fibonacci().take(10).toArray().filter(...)` is less efficient, because iterator helpers are lazy and avoids creating a temporary array.

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [Polyfill of `Iterator.prototype.toArray` in `core-js`](https://github.com/zloirock/core-js#iterator-helpers)
- [es-shims polyfill of `Iterator.prototype.toArray`](https://www.npmjs.com/package/es-iterator-helpers)
- {{jsxref("Iterator")}}
- {{jsxref("Array.from()")}}
