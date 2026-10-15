---
id: pagination
title: Browse older threads a page at a time
character: priya
revisions: 1
assessment:
  initial:
    sound: false
    explanation:
      Range checks do not reject NaN or fractional offset/limit values.
      Number conversion from URL parameters can yield NaN; Array.slice coerces inputs
      instead of rejecting them. Require explicit integer validation.
    satisfiesIssue: false
    concern:
      Range checks do not reject NaN or fractional offset/limit values. Number
      conversion from URL parameters can yield NaN; Array.slice coerces inputs instead
      of rejecting them. Require explicit integer validation.
  rev-1:
    sound: true
    satisfiesIssue: true
    explanation:
      The prepared revision resolves the specific concern while preserving
      the useful behavior.
    reply:
      I added explicit integer checks before the bounds checks. Both URL parameters
      go through that validation now.
issue: pagination
---

The feed is already getting long on my phone. This adds older/newer buttons and defaults to two threads per page so it is easy to try with our small dataset. I checked the final page, an empty page, and negative offsets. The inputs come from URL parameters because people share links to discussions.

<!-- debrief -->

Go beyond happy-path pages. Compare the issue's integer requirement against NaN, fractional limits, Infinity, and edited URLs. Test search and saved lists with pagination enabled.
