const data = window.SAC_STATE_DATA;
const $ = (id) => document.getElementById(id);

const APPROVED_HORNETS = new Set([
  "Travis Adams", "Rhys Hoskins", "James Outman", "Sam Long", "Nathan Lukes",
  "Austin Roberts", "Erick Dessens", "Ethan Lay", "Kade Brown", "JP Smith II",
  "Carson Latimer", "Gunner Gouldsmith", "Eli Saul", "Wehiwa Aloy"
]);

const approvedPlayer = name => data.trackedAlumni.find(p => p.name === name);
const photoFor = name => approvedPlayer(name)?.profileImage || "";
const slugFor = name => approvedPlayer(name)?.slug || "";
const imageTag = (name, className, initials) => {
  const src = photoFor(name);
  if (!src) return `<div class="${className.includes('result') ? 'result-avatar' : 'player-avatar'}">${initials || ''}</div>`;
  return `<img class="${className}" src="${src}" alt="${name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"/><div class="${className.includes('result') ? 'result-avatar' : 'player-avatar'} photo-fallback">${initials || ''}</div>`;
};

// Hard safety lock: only approved former Sacramento State players can render.
data.trackedAlumni = (data.trackedAlumni || []).filter(p => APPROVED_HORNETS.has(p.name));
data.liveGames = (data.liveGames || []).filter(g => APPROVED_HORNETS.has(g.hornet));
data.yesterday = (data.yesterday || []).filter(p => APPROVED_HORNETS.has(p.name));
data.videos = (data.videos || []).filter(v => !v.player || APPROVED_HORNETS.has(v.player));

$("refreshText").textContent = `Last refreshed: ${data.refreshedAt}`;

function emptyState(message) {
  return `<div class="empty-state"><strong>${message}</strong><p>Only verified updates involving a tracked former Sacramento State Hornet will appear here.</p></div>`;
}

function gameCard(game) {
  const p = approvedPlayer(game.hornet);
  return `
    <article class="game-card">
      <div class="game-topline"><span>${game.level} · ${game.status}</span>${game.live ? '<span class="live-badge">LIVE</span>' : ''}</div>
      <div class="team-row">
        <div class="team"><div class="team-logo">${game.away.abbr}</div><div class="team-name">${game.away.name}</div></div>
        <div class="score">${game.away.score} – ${game.home.score}</div>
        <div class="team"><div class="team-logo">${game.home.abbr}</div><div class="team-name">${game.home.name}</div></div>
      </div>
      <div class="hornet-strip"><strong>FORMER SAC STATE HORNET:</strong> ${game.hornet}</div>
      <div class="live-box">${game.hornetLine}</div>
      ${game.watchUrl ? `<a class="game-link" href="${game.watchUrl}" target="_blank" rel="noopener">${game.watchLabel} ↗</a>` : `<span class="game-link">${game.watchLabel || 'Broadcast info unavailable'}</span>`}
      ${p ? `<a class="game-link" href="players/${p.slug}/">Player profile →</a>` : ''}
    </article>`;
}

$("liveGames").innerHTML = data.liveGames.length ? data.liveGames.map(gameCard).join("") : emptyState("No verified former-Hornet live games loaded right now.");

// Persistent front-page results behavior:
// 1) verified yesterday results win;
// 2) otherwise reuse the last verified game set saved in this browser;
// 3) otherwise show the site's latest verified season snapshots.
let frontResults = [...data.yesterday];
let resultMode = "yesterday";
try {
  if (frontResults.length) {
    localStorage.setItem("sacStateLastVerifiedResultsV6", JSON.stringify(frontResults));
  } else {
    const cached = JSON.parse(localStorage.getItem("sacStateLastVerifiedResultsV6") || "[]");
    const safeCached = Array.isArray(cached) ? cached.filter(p => APPROVED_HORNETS.has(p.name)) : [];
    if (safeCached.length) { frontResults = safeCached; resultMode = "cached"; }
  }
} catch (_) {}
if (!frontResults.length) { frontResults = data.latestUpdates || []; resultMode = "snapshot"; }

if (resultMode !== "yesterday") {
  $("resultsHeading").textContent = "MOST RECENT FORMER HORNET UPDATES";
  $("resultsMode").textContent = resultMode === "cached" ? "Last verified game results" : "Latest verified season snapshots";
}
$("persistenceNotice").textContent = resultMode === "yesterday"
  ? "Verified results from yesterday are displayed. These will remain available until a newer verified update replaces them."
  : resultMode === "cached"
    ? "No verified games were loaded for yesterday, so the most recent verified game results are being kept on the homepage until newer results replace them."
    : "No verified previous-day game results are loaded, so the latest verified player snapshots remain on the homepage until newer verified results replace them.";

const performanceResults = frontResults.filter(p => !p.isSnapshot && typeof p.score === "number");
const topOverall = [...performanceResults].sort((a,b) => b.score - a.score)[0];
const topPitcher = [...performanceResults].filter(p => p.type === "pitcher").sort((a,b) => b.score - a.score)[0];

function awardCard(label, player) {
  if (!player) return `<div><p class="eyebrow gold">${label}</p><h3>No new verified game award</h3><p>The most recent verified player information remains below until a new game performance is loaded.</p></div>`;
  return `${imageTag(player.name,'award-photo',player.initials)}<div><p class="eyebrow gold">${label}</p><h3>${player.name}</h3><div class="alumni-badge">FORMER SACRAMENTO STATE HORNET</div><p>${player.team}</p><p>${player.summary}</p><p><strong>Performance score:</strong> ${player.score.toFixed(1)}</p><a class="profile-button" href="players/${slugFor(player.name)}/">View profile →</a></div>`;
}

$("playerOfDay").innerHTML = awardCard("PLAYER OF THE DAY", topOverall);
$("topPitcher").innerHTML = awardCard("TOP PITCHING PERFORMANCE", topPitcher);

$("yesterdayResults").innerHTML = frontResults.length ? frontResults.map(p => `
  <div class="result-row">
    <div>${imageTag(p.name,'result-photo',p.initials)}</div>
    <div><div class="result-name">${p.name}</div><div class="alumni-inline">FORMER SAC STATE HORNET</div><div class="result-stat">${p.stat}</div><span class="update-date">${p.date ? `Updated ${p.date}` : ''}</span><a class="profile-button" href="players/${slugFor(p.name)}/">Profile →</a></div>
    <div class="result-record">${p.result || ''}<br><span style="color:#a9b7b0;font-weight:500">${p.team || ''}</span></div>
  </div>`).join("") : emptyState("No verified former-Hornet updates are available yet.");

const reportDate = new Date(); reportDate.setDate(reportDate.getDate() - 1);
$("reportDate").textContent = resultMode === "yesterday" ? reportDate.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"}) : data.snapshotDate;
$("storyHeadline").textContent = resultMode === "yesterday" ? "Former Hornets Across Professional Baseball" : "Latest Verified Hornet Information Remains on Watch";
$("storyBody").textContent = resultMode === "yesterday"
  ? "This report contains only verified performances by former Sacramento State baseball players on the tracked alumni list."
  : "No newer verified previous-day results are loaded. The homepage is intentionally retaining the most recent verified information for each tracked former Hornet until a newer update is available.";

$("videoGrid").innerHTML = data.videos.length ? data.videos.map(v => `<article class="video-card"><div class="video-thumb">▶</div><div class="video-body"><div class="video-source">${v.source}</div><h3>${v.title}</h3><p>${v.player}</p>${v.url ? `<a class="video-link" href="${v.url}" target="_blank" rel="noopener">Watch highlight ↗</a>` : `<span class="video-link">No verified video URL yet</span>`}</div></article>`).join("") : emptyState("No verified former-Hornet highlights loaded yet.");

function renderPlayers(filter = "all") {
  const rows = data.players.filter(p => filter === "all" || p.category.includes(filter));
  $("playerGrid").innerHTML = rows.map(p => `
    <article class="player-card former-hornet-card" tabindex="0">
      <div class="player-top"><div class="player-photo-wrap">${imageTag(p.name,'player-photo',p.initials)}</div><span class="sac-state-mark">SAC STATE</span></div>
      <div class="player-body"><div class="alumni-badge">FORMER SACRAMENTO STATE HORNET</div><h3>${p.name}</h3><div class="player-meta">${p.position} · ${p.org}</div><div class="player-meta">${p.years}</div><div class="player-statline">${p.stat}</div><a class="profile-button" href="players/${p.slug}/">View full profile →</a></div>
    </article>`).join("");
}
renderPlayers();

document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");renderPlayers(btn.dataset.filter);}));
const menuButton=$("menuButton"), mobileMenu=$("mobileMenu");
menuButton.addEventListener("click",()=>{const open=menuButton.getAttribute("aria-expanded")==="true";menuButton.setAttribute("aria-expanded",String(!open));mobileMenu.hidden=open;});
mobileMenu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{mobileMenu.hidden=true;menuButton.setAttribute("aria-expanded","false");}));
