---
title: "Reference Global_objects Asyncfunction"
slug: "reference-global_objects-asyncfunction"
path: "reference/global_objects/asyncfunction/index.md"
wordCount: 180
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: ["functions", "objects", "async"]
lastModified: "2025-08-02T14:03:23.496Z"
---


The **`AsyncFunction`** object provides methods for [async functions](/en-US/docs/Web/JavaScript/Reference/Statements/async_function). In JavaScript, every async function is actually an `AsyncFunction` object.

Note that `AsyncFunction` is _not_ a global object. It can be obtained with the following code:

```js
const AsyncFunction = async function () {}.constructor;
```

`AsyncFunction` is a subclass of {{jsxref("Function")}}.

## Constructor

- {{jsxref("AsyncFunction/AsyncFunction", "AsyncFunction()")}}
  - : Creates a new `AsyncFunction` object.

## Instance properties

_Also inherits instance properties from its parent {{jsxref("Function")}}_.

These properties are defined on `AsyncFunction.prototype` and shared by all `AsyncFunction` instances.

- {{jsxref("Object/constructor", "AsyncFunction.prototype.constructor")}}
  - : The constructor function that created the instance object. For `AsyncFunction` instances, the initial value is the {{jsxref("AsyncFunction/AsyncFunction", "AsyncFunction")}} constructor.
- `AsyncFunction.prototype[Symbol.toStringTag]`
  - : The initial value of the [`[Symbol.toStringTag]`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag) property is the string `"AsyncFunction"`. This property is used in {{jsxref("Object.prototype.toString()")}}.

> [!NOTE]
> `AsyncFunction` instances do not have the [`prototype`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype) property.

## Instance methods

_Inherits instance methods from its parent {{jsxref("Function")}}_.

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [`async function`](/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [`async function` expression](/en-US/docs/Web/JavaScript/Reference/Operators/async_function)
- {{jsxref("Function")}}
- {{jsxref("AsyncGeneratorFunction")}}
- {{jsxref("GeneratorFunction")}}
- {{jsxref("Functions", "Functions", "", 1)}}
