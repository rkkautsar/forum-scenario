---
id: voting-framework
title: Make voting extensible through a pipeline
character: theo
revisions: 1
assessment:
  initial:
    sound: false
    explanation:
      The VotingPipeline and step registry add indirection for a single
      fixed upvote. No current requirement needs extension steps.
    satisfiesIssue: true
    concern:
      The VotingPipeline and step registry add indirection for a single fixed
      upvote. No current requirement needs extension steps.
    debt: Unneeded voting pipeline
  rev-1:
    sound: true
    satisfiesIssue: true
    explanation:
      The prepared revision resolves the specific concern while preserving
      the useful behavior.
    reply:
      I took out the pipeline. One direct write is easier to follow; reactions
      can wait for a concrete issue.
issue: voting
group: voting
---

I wanted to leave space for emoji reactions if the community asks later, so the vote write runs through a pipeline. The browser and API behavior are the same as Maya's approach. I know Friday is close; happy to discuss whether this is too much structure for the first release.

<!-- debrief -->

Functional correctness does not settle maintainability. Compare how much a future maintainer must read to change one database write. Ask which concrete extension requires the extra machinery today.
