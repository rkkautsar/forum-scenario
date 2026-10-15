---
id: voting-simple
title: Add one upvote per member
character: maya
revisions: 0
assessment:
  initial:
    sound: true
    explanation: This contribution meets its stated scope without an authored concern.
    satisfiesIssue: true
issue: voting
group: voting
---

I tried the forum with our weekly project thread. A vote button seems enough for now: no downvotes, reaction types, or ranking changes. This adds the endpoint, stores one row per member and thread, and puts the count beside the comments button. Repeated clicks are covered in the API test.

<!-- debrief -->

The uniqueness constraint enforces idempotency at the storage boundary. Follow the duplicate request test and check that nonexistent threads cannot acquire votes.
