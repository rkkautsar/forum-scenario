---
id: bookmarks
title: Save useful threads and find them again
character: sam
revisions: 1
assessment:
  initial:
    sound: false
    explanation:
      The saved-only filter queries all bookmarks without WHERE userId=current
      user. Switching members reveals threads saved by other people even though the
      per-thread saved indicator is correctly scoped.
    satisfiesIssue: false
    concern:
      The saved-only filter queries all bookmarks without WHERE userId=current
      user. Switching members reveals threads saved by other people even though the
      per-thread saved indicator is correctly scoped.
  rev-1:
    sound: true
    satisfiesIssue: true
    explanation:
      The prepared revision resolves the specific concern while preserving
      the useful behavior.
    reply:
      I missed the personal-list query. It now selects only bookmarks belonging
      to the current member.
issue: bookmarks
---

I keep a separate tab open for every useful answer. This adds Save/Unsave and a My saved threads button. The saved indicator checks the current member, and the table prevents duplicate saves. I tested saving and removing the same thread. Try it with a couple of the seeded posts.

<!-- debrief -->

Check every read path, not only the write and decorative indicator. Save as one user, switch to another, and compare the personal list. A feature can enforce privacy in one query and miss it in another.
