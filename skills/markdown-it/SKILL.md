---
name: "markdown-it"
version: "14.1.1"
downloads: 70.9M/month
description: >
  Markdown-it - modern pluggable markdown parser.. Use when: Follows the __CommonMark spec__ + adds syntax extensions & sugar (URL autolinking, typographer); Configurable syntax! You can add new rules and even replace existing ones; Safe by default. NOT for: rich text WYSIWYG editing; PDF document generation.
---

# markdown-it

## Overview
Markdown-it - modern pluggable markdown parser.. # markdown-it <!-- omit in toc --> > Markdown parser done right.

## Installation
```bash
npm install markdown-it
```

## Core API / Usage
```bash
npm install markdown-it
```

```js
// node.js
// can use `require('markdown-it')` for CJS
import markdownit from 'markdown-it'
const md = markdownit()
const result = md.render('# markdown-it rulezz!');

// browser with UMD build, added to "window" on script load
// Note, there is no dash in "markdownit".
const md = window.markdownit();
const result = md.render('# markdown-it rulezz!');
```

## Common Patterns
### Pattern 1

```js
import markdownit from 'markdown-it'
const md = markdownit()
const result = md.renderInline('__markdown-it__ rulezz!');
```

### Pattern 2

```js
import markdownit from 'markdown-it'

// commonmark mode
const md = markdownit('commonmark')

// default mode
const md = markdownit()

// enable everything
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true
})

// full options list (defaults)
const md = markdownit({
  // Enable HTML tags in source
  html:         false,

  // Use '/' to close single tags (<br />).
  // This is only for full CommonMark compatibility.
  xhtmlOut:     false,

  // Convert '\n' in paragraphs into <br>
  breaks:       false,

  // CSS language prefix for fenced blocks. Can be
  // useful for external highlighters.
  langPrefix:   'language-',

  // Autoconvert URL-like text to links
  linkify:      false,

  // Enable some language-neutral replacement + quotes beautification
  // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs
  typographer:  false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externally.
  // If result starts with <pre... internal wrapper is skipped.
  highlight: function (/*str, lang*/) { return ''; }
});
```

### Pattern 3

```js
import markdownit from 'markdown-it'

const md = markdownit
  .use(plugin1)
  .use(plugin2, opts, ...)
  .use(plugin3);
```

## Configuration
```js
import markdownit from 'markdown-it'

// commonmark mode
const md = markdownit('commonmark')

// default mode
const md = markdownit()

// enable everything
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true
})

// full options list (defaults)
const md = markdownit({
  // Enable HTML tags in source
  html:         false,

  // Use '/' to close single tags (<br />).
  // This is only for full CommonMark compatibility.
  xhtmlOut:     false,

  // Convert '\n' in paragraphs into <br>
  breaks:       false,

  // CSS language prefix for fenced blocks. Can be
  // useful for external highlighters.
  langPrefix:   'language-',

  // Autoconvert URL-like text to links
  linkify:      false,

  // Enable some language-neutral replacement + quotes beautification
  // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs
  typographer:  false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externally.
  // If result starts with <pre... internal wrapper is skipped.
  highlight: function (/*str, lang*/) { return ''; }
});
```

## Tips & Gotchas
- Works in both Node.js and browser environments.
- Current version: 14.1.1. Check the changelog when upgrading across major versions.
