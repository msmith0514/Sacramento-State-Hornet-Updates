# Sac State Baseball Daily — Hornets-only v6

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
