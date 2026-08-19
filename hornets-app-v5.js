const data = window.SAC_STATE_DATA;
const $ = (id) => document.getElementById(id);

const APPROVED_HORNETS = new Set([
  "Travis Adams", "Rhys Hoskins", "James Outman", "Sam Long", "Nathan Lukes",
  "Austin Roberts", "Erick Dessens", "Ethan Lay", "Kade Brown", "JP Smith II",
  "Carson Latimer", "Gunner Gouldsmith", "Eli Saul", "Wehiwa Aloy"
]);

// Safety lock: the public site must never render a player outside the approved
// former Sacramento State alumni watchlist. This also protects against stale
// or accidentally reintroduced demo records.
data.trackedAlumni = (data.trackedAlumni || []).filter(p => APPROVED_HORNETS.has(p.name));
data.liveGames = (data.liveGames || []).filter(g => APPROVED_HORNETS.has(g.hornet));
data.yesterday = (data.yesterday || []).filter(p => APPROVED_HORNETS.has(p.name));
data.videos = (data.videos || []).filter(v => !v.player || APPROVED_HORNETS.has(v.player));


$("refreshText").textContent = `Last refreshed: ${data.refreshedAt}`;

function emptyState(message) {
  return `<div class="empty-state"><strong>${message}</strong><p>Only verified updates involving a tracked former Sacramento State Hornet will appear here.</p></div>`;
}

function gameCard(game) {
  return `
    <article class="game-card">
      <div class="game-topline">
        <span>${game.level} · ${game.status}</span>
        ${game.live ? '<span class="live-badge">LIVE</span>' : ''}
      </div>
      <div class="team-row">
        <div class="team"><div class="team-logo">${game.away.abbr}</div><div class="team-name">${game.away.name}</div></div>
        <div class="score">${game.away.score} – ${game.home.score}</div>
        <div class="team"><div class="team-logo">${game.home.abbr}</div><div class="team-name">${game.home.name}</div></div>
      </div>
      <div class="hornet-strip"><strong>FORMER SAC STATE HORNET:</strong> ${game.hornet}</div>
      <div class="live-box">${game.hornetLine}</div>
      ${game.watchUrl ? `<a class="game-link" href="${game.watchUrl}" target="_blank" rel="noopener">${game.watchLabel} ↗</a>` : `<span class="game-link">${game.watchLabel || 'Broadcast info unavailable'}</span>`}
    </article>`;
}

$("liveGames").innerHTML = data.liveGames.length
  ? data.liveGames.map(gameCard).join("")
  : emptyState("No verified former-Hornet live games loaded right now.");

const topOverall = [...data.yesterday].sort((a,b) => b.score - a.score)[0];
const topPitcher = [...data.yesterday].filter(p => p.type === "pitcher").sort((a,b) => b.score - a.score)[0];

function awardCard(label, player) {
  if (!player) return `<div><p class="eyebrow gold">${label}</p><h3>Statistics currently unavailable.</h3><p>Waiting for a verified performance by a tracked former Sacramento State Hornet.</p></div>`;
  return `<div class="player-avatar">${player.initials}</div><div><p class="eyebrow gold">${label}</p><h3>${player.name}</h3><div class="alumni-badge">FORMER SACRAMENTO STATE HORNET</div><p>${player.team}</p><p>${player.summary}</p><p><strong>Performance score:</strong> ${player.score.toFixed(1)}</p></div>`;
}

$("playerOfDay").innerHTML = awardCard("PLAYER OF THE DAY", topOverall);
$("topPitcher").innerHTML = awardCard("TOP PITCHING PERFORMANCE", topPitcher);

$("yesterdayResults").innerHTML = data.yesterday.length ? data.yesterday.map(p => `
  <div class="result-row">
    <div class="result-avatar">${p.initials}</div>
    <div><div class="result-name">${p.name}</div><div class="alumni-inline">FORMER SAC STATE HORNET</div><div class="result-stat">${p.stat}</div></div>
    <div class="result-record">${p.result}<br><span style="color:#a9b7b0;font-weight:500">${p.team}</span></div>
  </div>`).join("") : emptyState("No verified former-Hornet results loaded for yesterday.");

const reportDate = new Date();
reportDate.setDate(reportDate.getDate() - 1);
$("reportDate").textContent = reportDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
$("storyHeadline").textContent = "Former Hornets Across Professional Baseball";
$("storyBody").textContent = data.yesterday.length
  ? "This report contains only verified performances by former Sacramento State baseball players on the tracked alumni list."
  : "Statistics currently unavailable. The Daily Hornet Report will publish only when a verified game record is available for one of the tracked former Sacramento State players.";

$("videoGrid").innerHTML = data.videos.length ? data.videos.map(v => `
  <article class="video-card"><div class="video-thumb">▶</div><div class="video-body"><div class="video-source">${v.source}</div><h3>${v.title}</h3><p>${v.player}</p>${v.url ? `<a class="video-link" href="${v.url}" target="_blank" rel="noopener">Watch highlight ↗</a>` : `<span class="video-link">No verified video URL yet</span>`}</div></article>`).join("") : emptyState("No verified former-Hornet highlights loaded yet.");

function renderPlayers(filter = "all") {
  const rows = data.players.filter(p => filter === "all" || p.category.includes(filter));
  $("playerGrid").innerHTML = rows.map(p => `
    <article class="player-card former-hornet-card" tabindex="0">
      <div class="player-top"><div class="player-initials">${p.initials}</div><span class="sac-state-mark">SAC STATE</span></div>
      <div class="player-body">
        <div class="alumni-badge">FORMER SACRAMENTO STATE HORNET</div>
        <h3>${p.name}</h3>
        <div class="player-meta">${p.position} · ${p.org}</div>
        <div class="player-meta">${p.years}</div>
        <div class="player-statline">${p.stat}</div>
        <a class="profile-button" href="players/${p.slug}/">View full profile →</a>
      </div>
    </article>`).join("");
}
renderPlayers();

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPlayers(btn.dataset.filter);
  });
});

const menuButton = $("menuButton");
const mobileMenu = $("mobileMenu");
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  mobileMenu.hidden = open;
});
mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mobileMenu.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
}));
