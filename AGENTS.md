# Authoring this scenario

This is the runnable Forum scenario for PR Flood. Author annotations live in `__scenario__` on main. Application snapshots and contributions are captured by Git branches:

- `stage/<stage-id>/base`
- `stage/<stage-id>/<case-id>/initial`
- `stage/<stage-id>/<case-id>/rev-1` (up to rev-3)

Do not create parent-leaf branches such as `stage/launch`. Start a contribution from its stage base. Commit the initial feature, capture its initial branch, then make each prepared fix descend from the previous revision. Avoid force-moving published captures; change the scenario version for a new release. Never merge assessment metadata into player snapshots.

A PR annotation is one Markdown file at `__scenario__/stages/<stage>/prs/<id>.md`. Frontmatter identifies the character, optional issue/group, revision count, and per-revision assessment. Prose before `<!-- debrief -->` is the contributor's PR description; prose after it is the teaching takeaway. The publisher strips metadata and debrief from initial player content.

Author useful product work across natural API/UI/test boundaries. Each deliberate concern needs evidence that the initial variant has the problem and the prepared fix resolves it. Contributors should have a specific reason for caring, not a generic greeting. Keep code readable and tests plausible. Regular happy-path tests can miss the authored defect; do not write a failing public answer-key test into an initial PR.

Use the maintainer-sim CLI from its checkout: `npm run scenario -- validate /path/to/this/repo`, then preview and publish. The source guide is `docs/AUTHORING.md` in maintainer-sim. Validation never executes repository code. Run `npm test` separately on trusted authored snapshots. `__scenario__/EVIDENCE.md` records defect witnesses; service tests execute API evidence and browser checks cover rendering.

Do not add credentials or runtime SQLite files. This source repository is intentionally public, including its scenario annotations and future capture branches. Only the published public baseline is copied to a player repository.

Keep JavaScript and TypeScript readable: group imports, leave blank lines between functions and object methods, and separate guards, reads, writes, and assertions into logical paragraphs. Apply shared formatting to stage baselines as well as contributions so PR diffs focus on behavior.
