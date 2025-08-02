---
title: "Reference Global_objects Asyncdisposablestack Disposed"
slug: "reference-global_objects-asyncdisposablestack-disposed"
path: "reference/global_objects/asyncdisposablestack/disposed/index.md"
wordCount: 100
readingTime: 1
codeBlocks: 1
difficulty: "advanced"
category: "Reference"
tags: ["objects", "async"]
lastModified: "2025-08-02T14:03:23.495Z"
---


The **`disposed`** accessor property of {{jsxref("AsyncDisposableStack")}} instances returns a boolean indicating whether or not this `AsyncDisposableStack` has been disposed or moved by doing any of the following:

- Calling its {{jsxref("AsyncDisposableStack/disposeAsync", "disposeAsync()")}} method
- Calling its {{jsxref("AsyncDisposableStack/move", "move()")}} method
- Declaring it with {{jsxref("Statements/await_using", "await using")}} and letting the variable go out of scope, which automatically calls the [`[Symbol.asyncDispose]()`](/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncDisposableStack/Symbol.asyncDispose) method.

## Examples

### Checking if a stack is disposed

```js
const disposer = new AsyncDisposableStack();
console.log(disposer.disposed); // false
await disposer.disposeAsync();
console.log(disposer.disposed); // true
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [JavaScript resource management](/en-US/docs/Web/JavaScript/Guide/Resource_management)
