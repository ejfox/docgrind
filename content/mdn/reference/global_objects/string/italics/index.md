---
title: "Reference Global_objects String Italics"
slug: "reference-global_objects-string-italics"
path: "reference/global_objects/string/italics/index.md"
wordCount: 182
readingTime: 1
codeBlocks: 4
difficulty: "advanced"
category: "Reference"
tags: ["objects", "dom", "api"]
lastModified: "2025-08-02T14:16:44.500Z"
---


{{Deprecated_Header}}

The **`italics()`** method of {{jsxref("String")}} values creates a string that embeds this string in an {{HTMLElement("i")}} element (`<i>str</i>`), which causes this string to be displayed as italic.

> [!NOTE]
> All [HTML wrapper methods](/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#html_wrapper_methods) are deprecated and only standardized for compatibility purposes. Use [DOM APIs](/en-US/docs/Web/API/Document_Object_Model) such as [`document.createElement()`](/en-US/docs/Web/API/Document/createElement) instead.

## Syntax

```js-nolint
italics()
```

### Parameters

None.

### Return value

A string beginning with an `<i>` start tag, then the text `str`, and then an `</i>` end tag.

## Examples

### Using italics()

The code below creates an HTML string and then replaces the document's body with it:

```js
const contentString = "Hello, world";

document.body.innerHTML = contentString.italics();
```

This will create the following HTML:

```html
<i>Hello, world</i>
```

Instead of using `italics()` and creating HTML text directly, you should use DOM APIs such as [`document.createElement()`](/en-US/docs/Web/API/Document/createElement). For example:

```js
const contentString = "Hello, world";
const elem = document.createElement("i");
elem.innerText = contentString;
document.body.appendChild(elem);
```

## Specifications

{{Specifications}}

## Browser compatibility

{{Compat}}

## See also

- [Polyfill of `String.prototype.italics` in `core-js`](https://github.com/zloirock/core-js#ecmascript-string-and-regexp)
- [es-shims polyfill of `String.prototype.italics`](https://www.npmjs.com/package/es-string-html-methods)
- [HTML wrapper methods](/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#html_wrapper_methods)
- {{HTMLElement("i")}}
