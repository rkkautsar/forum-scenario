# Forum

A small Reddit-style community forum. Requires Node.js 24 or newer; no installation or external service is needed.

Run `npm start` and open http://localhost:3001. `npm test` exercises the API. Choose a demo identity, open a thread, and leave a comment. Data persists in `data/forum.sqlite`; set `FORUM_DATABASE` or `PORT` to override it.

This is a local training application. Demo identities are selectable, not real authentication. The server binds localhost. Follow Game Master issue #1 in your playthrough repository for the release brief and contributions. After merging, pull the code and restart the server.
