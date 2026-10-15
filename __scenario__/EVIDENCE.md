# Defect witnesses

`verify.ts` exports every captured application ref from the scenario's versioned
stage prefix, plus the canonical `main` snapshot, into a temporary directory.
It links the installed dependencies and runs the snapshot's tests, TypeScript
check, and production build. It also checks the authored defect witness for each
initial/revision pair below. These are separate from ordinary happy-path tests:
each witness must fail on the initial snapshot and pass on its prepared fix.

| Contribution              | Initial witness                                                                                     | Prepared revision witness                                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `launch/comment-edit`     | Sam changes Maya's stored comment by submitting Sam's own `authorId`; the request must be rejected. | The same forged request is rejected while an edit by the stored author succeeds.                                                                     |
| `launch/bookmarks`        | Sam's saved-only list includes a thread bookmarked only by Maya.                                    | Sam's list excludes Maya's thread and retains Sam's own saved thread.                                                                                |
| `launch/pagination`       | `NaN` and fractional offset/limit values are accepted or coerced.                                   | Both are rejected as invalid integer inputs.                                                                                                         |
| `launch/search-regex`     | Query punctuation is treated as regex syntax and an unmatched `[` produces an error response.       | Punctuation is matched literally and malformed regex-looking text is safe.                                                                           |
| `launch/compact-previews` | Preview implements a second whitespace/Unicode/truncation policy instead of using `excerpt`.        | Preview delegates to the shared `excerpt` helper.                                                                                                    |
| `launch/rich-text`        | Stored HTML reaches React's `dangerouslySetInnerHTML` sink and can create markup.                   | HTML remains text while `**bold**` and line breaks retain their formatting.                                                                          |
| `growing/notifications`   | Sam sees replies on Maya-owned threads.                                                             | Sam sees replies only on Sam-owned threads and not Sam's own comments; changing the selected identity hides replies fetched for the previous member. |

The semantic checks are intentionally run against source from each captured
ref. No answer-key test is copied into a player snapshot. CI uses the scenario repository's source refs and grants no credentials to repository code.
