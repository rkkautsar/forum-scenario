---
id: comment-edit
title: Edit a comment without posting a correction
character: sam
revisions: 1
assessment:
  initial:
    sound: false
    explanation:
      The route compares the client-supplied authorId with the demo user,
      rather than comparing the stored comment.authorId. A different member can supply
      their own authorId and edit another member's comment.
    satisfiesIssue: false
    concern:
      The route compares the client-supplied authorId with the demo user, rather
      than comparing the stored comment.authorId. A different member can supply their
      own authorId and edit another member's comment.
  rev-1:
    sound: true
    satisfiesIssue: true
    explanation:
      The prepared revision resolves the specific concern while preserving
      the useful behavior.
    reply:
      I was checking the author ID from the form. You are right that the stored
      owner is the source of truth. I changed the route to compare against that before
      writing.
issue: edit-comments
---

I keep leaving a second comment just to fix a typo. This adds an inline edit button to your own comments, a PATCH endpoint, validation, and an edited timestamp. I kept the original posting time so a correction won't move a reply around. The tests cover editing and an empty body.

<!-- debrief -->

The UI restricts visible controls, but it does not protect the API. Send the request as a different member and change authorId in the JSON. Authorization must use ownership loaded from storage.
