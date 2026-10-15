# Author evidence

Run `npm test` on a stage baseline and on each contribution. The contributed tests cover plausible happy paths; they intentionally do not prove every requirement.

Known witnesses: comment-edit initial allows sam to PATCH maya's seeded comment using authorId=sam; rev-1 returns 403. Pagination initial accepts offset=NaN and limit=1.5; rev-1 returns 400. Search-regex initial throws on q=[ and treats . as a wildcard; search-simple and rev-1 treat both literally. Bookmarks initial shows maya's saved post in sam's saved-only feed; rev-1 scopes it correctly. Rich-text initial inserts raw HTML from a post into the DOM; rev-1 creates text nodes. Compact-previews duplicates src/text.ts; rev-1 delegates to it. Notifications initial returns maya's comment on priya's post to sam; rev-1 returns an empty personal view.

The maintainer-sim test suite executes these API witnesses against exported snapshots. The browser check additionally verifies feature UI and safe rendering.
