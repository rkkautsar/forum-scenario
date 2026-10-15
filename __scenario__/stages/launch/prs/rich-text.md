---
id: rich-text
title: Support bold text and line breaks in posts
character: theo
revisions: 1
assessment:
  initial:
    sound: false
    explanation:
      The formatter writes untrusted post text to innerHTML after regex
      replacements without escaping existing HTML. A stored post can inject elements/event
      handlers and execute script when another member reads the feed.
    concern:
      The formatter writes untrusted post text to innerHTML after regex replacements
      without escaping existing HTML. A stored post can inject elements/event handlers
      and execute script when another member reads the feed.
  rev-1:
    sound: true
    satisfiesIssue: false
    explanation:
      The prepared revision resolves the specific concern while preserving
      the useful behavior.
    reply:
      I removed innerHTML. Formatting now creates text nodes and strong/br elements
      explicitly.
---

A couple of people asked whether they can highlight a sentence. This supports double-asterisk bold and line breaks without bringing in a Markdown library. It runs in the browser and leaves the API unchanged. I tried plain paragraphs and bold text; the formatting is deliberately limited.

<!-- debrief -->

Avoid treating user text as trusted HTML. Regex substitution does not sanitize existing markup. Construct text nodes and permitted elements, or use a carefully configured sanitizer.
