---
id: notifications
title: Add a replies-to-me view
character: sam
issue: notifications
revisions: 1
assessment:
  initial:
    sound: false
    satisfiesIssue: false
    concern:
      The notification query has no owner filter, so every member sees comments
      on everybody's threads. Filter posts.authorId by the current user and exclude
      their own comments.
    explanation:
      The view returns a community activity stream instead of the promised
      personal replies.
  rev-1:
    sound: true
    satisfiesIssue: true
    explanation:
      Notifications are scoped to threads owned by the current member,
      excluding their own comments.
    reply:
      I scoped the query by the thread owner and excluded self-replies. Switching
      identities should now show different personal results.
---

I added a Replies to me button beside the feed controls. It opens a compact list of recent replies with the thread title. I kept it to twenty entries and checked the response shape.

<!-- debrief -->

A label that says “to me” does not make a query personal. Trace the relationship from the signed-in user to the thread owner, and test with activity belonging to multiple people.
