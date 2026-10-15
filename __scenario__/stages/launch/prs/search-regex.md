---
id: search-regex
title: Search discussion titles and bodies
character: theo
revisions: 1
assessment:
  initial:
    sound: false
    explanation:
      The implementation constructs RegExp directly from the user query.
      Literal punctuation changes matching, an unmatched bracket throws, and complex
      patterns can be expensive. The issue asks for ordinary literal text search.
    satisfiesIssue: false
    concern:
      The implementation constructs RegExp directly from the user query. Literal
      punctuation changes matching, an unmatched bracket throws, and complex patterns
      can be expensive. The issue asks for ordinary literal text search.
  rev-1:
    sound: true
    satisfiesIssue: true
    explanation:
      The prepared revision resolves the specific concern while preserving
      the useful behavior.
    reply:
      I replaced the regex with a literal case-insensitive match. Brackets and
      dots no longer change its meaning.
issue: search
group: search
---

I lose old answers in the group chat all the time. This adds a search box and searches titles plus bodies. I used a case-insensitive regular expression to keep matching compact. Empty queries show everything as before. The tests use a word in a title and a word from a body.

<!-- debrief -->

Read product semantics before choosing a powerful primitive. Literal search should not make members understand regex syntax or introduce regex performance risks.
