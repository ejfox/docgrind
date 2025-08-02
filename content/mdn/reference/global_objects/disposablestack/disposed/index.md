---
title: "Reference Global_objects Disposablestack Disposed"
slug: "reference-global_objects-disposablestack-disposed"
path: "reference/global_objects/disposablestack/disposed/index.md"
wordCount: 98
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: ["objects"]
lastModified: "2025-08-02T14:03:23.527Z"
---


The **`disposed`** accessor property of {{jsxref("DisposableStack")}} instances returns a boolean indicating whether or not this `DisposableStack` has been disposed or moved by doing any of the following:

- Calling its {{jsxref("DisposableStack/dispose", "dispose()")}} method
- Calling its {{jsxref("DisposableStack/move", "move()")}} method
- Declaring it with {{jsxref("Statements/using", "using")}} and letting the variable go out of scope, which automatically calls the [`[Symbol.dispose]()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/DisposableStack/Symbol.dispose) method.

## Examples

### Checking if a stack is disposed

```js
const disposer = new DisposableStack();
console.log(disposer.disposed); // false
disposer.dispose();
console.log(disposer.disposed); // true
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [JavaScript resource management](/en-US/docs/Web/JavaScript/Guide/Resource_management)
