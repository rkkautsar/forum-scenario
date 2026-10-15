---
id: compact-previews
title: Stop long posts taking over the feed
character: alex
revisions: 1
assessment:
  initial:
    sound: false
    explanation:
      preview duplicates the whitespace normalization, Unicode handling
      and truncation algorithm already implemented by excerpt in src/text.ts and used
      for comment summaries. Delegate to the shared helper.
    concern:
      preview duplicates the whitespace normalization, Unicode handling and
      truncation algorithm already implemented by excerpt in src/text.ts and used
      for comment summaries. Delegate to the shared helper.
    debt: Duplicated text-preview policy
  rev-1:
    sound: true
    satisfiesIssue: false
    explanation:
      The prepared revision resolves the specific concern while preserving
      the useful behavior.
    reply:
      I found excerpt in src/text.ts. The preview now uses it, so the feed and
      summaries share one policy.
---

A long thread body pushes everything else below the fold. This shortens feed previews to 180 characters, collapses whitespace, and keeps Unicode characters intact. I added tests for short text and truncation. It is outside Friday's list, but it made browsing nicer for me.

<!-- debrief -->

Search the repository before accepting a new helper. The algorithm is sound in isolation but creates another place to update whitespace, Unicode, and truncation policy.
