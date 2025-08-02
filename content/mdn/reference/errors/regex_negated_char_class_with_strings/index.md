---
title: "Reference Errors Regex_negated_char_class_with_strings"
slug: "reference-errors-regex_negated_char_class_with_strings"
path: "reference/errors/regex_negated_char_class_with_strings/index.md"
wordCount: 189
readingTime: 1
codeBlocks: 3
difficulty: "intermediate"
category: "Reference"
tags: ["classes"]
lastModified: "2025-08-02T14:03:23.463Z"
---


The JavaScript exception "negated character class with strings in regular expression" occurs when a [`v`-mode character class](/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class#v-mode_character_class) is negated and may be able to match a string (more than one character).

## Message

```plain
SyntaxError: Invalid regular expression: /[^\p{RGI_Emoji_Flag_Sequence}]/v: Negated character class may contain strings (V8-based)
SyntaxError: negated character class with strings in regular expression (Firefox)
SyntaxError: Invalid regular expression: negated class set may contain strings (Safari)
```

## Error type

{{jsxref("SyntaxError")}}

## What went wrong?

In `v` mode, character classes are able to match more than 1 character. For example, `/[\q{abc}]/v` would match the sequence `"abc"`, and `/[\p{RGI_Emoji_Flag_Sequence}]/v` would match any character sequence that represents an emoji flag. However, negated character classes `[^...]` are not allowed to match strings, so `/[^\p{RGI_Emoji_Flag_Sequence}]/v` is invalid, because it's unclear how many characters it should match. For more information, see the [`v`-mode character class](/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class#v-mode_character_class) reference.

## Examples

### Invalid cases

```js example-bad
/[^\p{RGI_Emoji_Flag_Sequence}]/v;
```

### Valid cases

```js example-good
// Matches two characters that are not an emoji flag sequence
/(?!\p{RGI_Emoji_Flag_Sequence})../v;
```

## See also

- [Regular expressions](/en-US/docs/Web/JavaScript/Reference/Regular_expressions)
- [Character class: `[...]`, `[^...]`](/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class)
- [Unicode character class escape: `\p{...}`, `\P{...}`](/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape)
