# Sac State Baseball Daily — GitHub Pages Edition

A mobile-first static sports site inspired by modern baseball media layouts and designed for Sacramento State baseball players and alumni.

## Important

The included player/game records are **fictional demo data**. Replace them with verified data before publishing sports claims.

## Upload to GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `styles.css`, `script.js`, and `data.js` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. Wait about 1–3 minutes, then open the GitHub Pages URL shown in Settings → Pages.

No npm, Node, Next.js, build workflow, or GitHub Actions are required for this version.

## Editing the content

All demo sports records are stored in `data.js`.

- `liveGames` = games playing today / scheduled games
- `yesterday` = yesterday's player performances
- `videos` = highlight cards
- `players` = player directory

## Where to watch

Only put a real link in `watchUrl` when you have a verified legal broadcast page. If it is blank, the site displays `Broadcast info unavailable`.
