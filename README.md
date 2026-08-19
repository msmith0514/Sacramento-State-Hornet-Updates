# Sac State Baseball Daily — Hornets-only v7

GitHub Pages static site tracking only the approved former Sacramento State baseball alumni list.

## v6 changes
- Official MLB/MiLB headshot URLs are used for all 14 tracked players. If MLB/MiLB has no current image, the site falls back to player initials.
- Every player has a dedicated profile page under `players/<slug>/`.
- The homepage no longer goes blank when yesterday has no verified results.
- If verified yesterday results exist, they are shown and saved in the browser.
- If yesterday is empty, the browser reuses the last verified game set it saw.
- For a first-time visitor with no cached game set, the site shows the latest verified season snapshot for every tracked alumnus until newer verified data is loaded.
- Only the approved former Sacramento State players can render.

Upload the contents of this folder to the root of the GitHub Pages repository and use **Deploy from a branch → main → /(root)**.


## Headshot fallback order (v7)
1. Official MLB/MiLB image keyed to the player's MLB ID.
2. If that image is unavailable, the player's final official Sacramento State roster headshot from HornetSports.
3. If both remote sources fail, initials are shown so the layout never breaks.

College fallback images link directly to official Sacramento State Athletics/HornetSports image assets.


## v8 hero update
The hero image uses an official Sacramento State Athletics photo of John Smith Field as the backdrop in the featured image panel.


## v11 scoreboard density
The MLB fallback uses two compact columns (four on wide desktop), with two team rows per game. Four matchups / eight teams fit in approximately the vertical space previously used by one full-size game card.


## v12 scoreboard
The MLB fallback uses compact CBS-inspired tiles. Each entire tile links to that game's CBS Sports GameTracker URL.

## v13
Adds an NCAA Division I baseball scoreboard in the same compact dark-tile style as the MLB scoreboard. It reads ESPN's college-baseball scoreboard feed, links each tile to the published ESPN game page, and falls back to the most recent D-I games during the offseason.
