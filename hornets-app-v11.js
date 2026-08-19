const data = window.SAC_STATE_DATA;
const $ = (id) => document.getElementById(id);

const APPROVED_HORNETS = new Set([
  "Travis Adams", "Rhys Hoskins", "James Outman", "Sam Long", "Nathan Lukes",
  "Austin Roberts", "Erick Dessens", "Ethan Lay", "Kade Brown", "JP Smith II",
  "Carson Latimer", "Gunner Gouldsmith", "Eli Saul", "Wehiwa Aloy"
]);

const approvedPlayer = name => data.trackedAlumni.find(p => p.name === name);
const slugFor = name => approvedPlayer(name)?.slug || "";
const imageTag = (name, className, initials) => {
  const player = approvedPlayer(name);
  const pro = player?.profileImage || "";
  const college = player?.collegeHeadshot || "";
  const avatarClass = className.includes('result') ? 'result-avatar' : 'player-avatar';
  if (!pro && !college) return `<div class="${avatarClass}">${initials || ''}</div>`;
  const src = pro || college;
  return `<img class="${className}" src="${src}" data-college="${college}" alt="${name}" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.dataset.college && this.src !== this.dataset.college){this.src=this.dataset.college;}else{this.style.display='none';this.nextElementSibling.style.display='grid';}"/><div class="${avatarClass} photo-fallback">${initials || ''}</div>`;
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

// Live section priority:
// 1) show verified former-Hornet games when present;
// 2) otherwise fetch today's MLB scoreboard directly from MLB Stats API.
const liveHeading = document.querySelector("#live .section-heading h2");
const liveNote = document.querySelector("#live .section-note");

const TEAM_ABBR = {
  108:"LAA",109:"AZ",110:"BAL",111:"BOS",112:"CHC",113:"CIN",114:"CLE",115:"COL",116:"DET",117:"HOU",
  118:"KC",119:"LAD",120:"WSH",121:"NYM",133:"OAK",134:"PIT",135:"SD",136:"SEA",137:"SF",138:"STL",
  139:"TB",140:"TEX",141:"TOR",142:"MIN",143:"PHI",144:"ATL",145:"CWS",146:"MIA",147:"NYY",158:"MIL"
};

function todayIsoLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

function escapeHtml(value="") {
  return String(value).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
}

function mlbGameStatus(game) {
  const state = game.status?.abstractGameState || "Preview";
  const detail = game.status?.detailedState || "Scheduled";
  const ls = game.linescore || {};
  if (state === "Live") {
    const inning = ls.currentInningOrdinal || (ls.currentInning ? `Inning ${ls.currentInning}` : "Live");
    const half = ls.inningHalf || "";
    const outs = Number.isFinite(ls.outs) ? `${ls.outs} out${ls.outs === 1 ? "" : "s"}` : "";
    return [half, inning, outs].filter(Boolean).join(" · ");
  }
  if (state === "Final") return detail || "Final";
  const when = game.gameDate ? new Date(game.gameDate) : null;
  return when && !Number.isNaN(when.valueOf())
    ? when.toLocaleTimeString([], {hour:"numeric", minute:"2-digit", timeZoneName:"short"})
    : detail;
}

function mlbScoreboardCard(game) {
  const away = game.teams?.away || {};
  const home = game.teams?.home || {};
  const awayTeam = away.team || {};
  const homeTeam = home.team || {};
  const state = game.status?.abstractGameState || "Preview";
  const isLive = state === "Live";
  const isFinal = state === "Final";
  const showScore = isLive || isFinal;
  const awayScore = showScore ? (away.score ?? 0) : "–";
  const homeScore = showScore ? (home.score ?? 0) : "–";
  const awayAbbr = TEAM_ABBR[awayTeam.id] || escapeHtml((awayTeam.name || "AWAY").split(" ").map(x=>x[0]).join("").slice(0,3));
  const homeAbbr = TEAM_ABBR[homeTeam.id] || escapeHtml((homeTeam.name || "HOME").split(" ").map(x=>x[0]).join("").slice(0,3));
  const badge = isLive ? '<span class="mini-status live">LIVE</span>' : isFinal ? '<span class="mini-status final">FINAL</span>' : '<span class="mini-status scheduled">SCHED</span>';
  return `
    <article class="mlb-mini-card">
      <div class="mlb-mini-top"><span>${escapeHtml(mlbGameStatus(game))}</span>${badge}</div>
      <a class="mlb-mini-matchup" href="https://www.mlb.com/gameday/${game.gamePk}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(awayTeam.name || "Away")} at ${escapeHtml(homeTeam.name || "Home")} on MLB Gameday">
        <div class="mlb-mini-team">
          <div class="mlb-mini-logo"><img src="https://www.mlbstatic.com/team-logos/${awayTeam.id}.svg" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span>${awayAbbr}</span></div>
          <span class="mlb-mini-name">${escapeHtml(awayTeam.name || "Away")}</span>
          <strong class="mlb-mini-score">${awayScore}</strong>
        </div>
        <div class="mlb-mini-team">
          <div class="mlb-mini-logo"><img src="https://www.mlbstatic.com/team-logos/${homeTeam.id}.svg" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span>${homeAbbr}</span></div>
          <span class="mlb-mini-name">${escapeHtml(homeTeam.name || "Home")}</span>
          <strong class="mlb-mini-score">${homeScore}</strong>
        </div>
      </a>
    </article>`;
}

async function loadMlbScoreboard() {
  liveHeading.textContent = "MLB SCOREBOARD";
  liveNote.textContent = "Live scores · auto-refresh";
  $("liveGames").classList.add("mlb-scoreboard-grid");
  $("liveGames").innerHTML = `<div class="scoreboard-loading"><strong>Loading today's MLB games…</strong></div>`;
  try {
    const date = todayIsoLocal();
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=linescore,team,venue`;
    const response = await fetch(url, {cache:"no-store"});
    if (!response.ok) throw new Error(`MLB returned ${response.status}`);
    const payload = await response.json();
    const games = (payload.dates || []).flatMap(d => d.games || []);
    if (!games.length) {
      $("liveGames").innerHTML = emptyState("No MLB games are scheduled today.");
      return;
    }
    const rank = g => g.status?.abstractGameState === "Live" ? 0 : g.status?.abstractGameState === "Preview" ? 1 : 2;
    games.sort((a,b) => rank(a)-rank(b) || new Date(a.gameDate)-new Date(b.gameDate));
    $("liveGames").innerHTML = `
      <div class="mlb-fallback-banner"><strong>No former Hornets are currently playing.</strong><span>Showing today's MLB scoreboard instead.</span><span id="mlbRefreshStamp"></span></div>
      ${games.map(mlbScoreboardCard).join("")}`;
    const stamp = $("mlbRefreshStamp");
    if (stamp) stamp.textContent = `Updated ${new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit",second:"2-digit"})}`;
  } catch (error) {
    console.error("MLB scoreboard unavailable", error);
    $("liveGames").innerHTML = `<div class="empty-state"><strong>MLB live scoreboard is temporarily unavailable.</strong><p>The page could not reach MLB's live schedule feed. Your former-Hornet updates remain available below.</p></div>`;
  }
}

if (data.liveGames.length) {
  $("liveGames").classList.remove("mlb-scoreboard-grid");
  $("liveGames").innerHTML = data.liveGames.map(gameCard).join("");
} else {
  loadMlbScoreboard();
  window.setInterval(loadMlbScoreboard, 30000);
}

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

const gameResults = frontResults.filter(p => !p.isSnapshot);
const scoredResults = gameResults.filter(p => typeof p.score === "number");
const newestHitter = frontResults.find(p => p.type !== "pitcher");
const newestPitcher = frontResults.find(p => p.type === "pitcher");
const topHitter = [...scoredResults].filter(p => p.type !== "pitcher").sort((a,b) => b.score - a.score)[0]
  || gameResults.find(p => p.type !== "pitcher")
  || newestHitter
  || data.latestUpdates.find(p => p.type !== "pitcher");
const topPitcher = [...scoredResults].filter(p => p.type === "pitcher").sort((a,b) => b.score - a.score)[0]
  || gameResults.find(p => p.type === "pitcher")
  || newestPitcher
  || data.latestUpdates.find(p => p.type === "pitcher");

function awardCard(label, player) {
  if (!player) return `<div><p class="eyebrow gold">${label}</p><h3>Awaiting verified update</h3><p>No verified tracked Hornet information is available yet.</p></div>`;
  const isGame = !player.isSnapshot;
  const dateLabel = player.date || data.snapshotDate || "Most recent verified update";
  const article = isGame
    ? `${player.summary || player.stat || "Verified game performance."}`
    : `${player.name}'s newest verified information remains featured until a more recent game performance is available. ${player.summary || player.stat || ""}`;
  const scoreLine = typeof player.score === "number" ? `<p class="award-score"><strong>Performance score:</strong> ${player.score.toFixed(1)}</p>` : "";
  const statusLabel = resultMode === "yesterday" && isGame ? label : `MOST RECENT ${label}`;
  return `${imageTag(player.name,'award-photo',player.initials)}<div class="award-copy"><p class="eyebrow gold">${statusLabel}</p><h3>${player.name}</h3><div class="alumni-badge">FORMER SACRAMENTO STATE HORNET</div><p class="award-team">${player.team || approvedPlayer(player.name)?.currentOrg || ""}</p><p class="award-date">${dateLabel}</p><p class="award-article">${article}</p>${scoreLine}<a class="profile-button" href="players/${slugFor(player.name)}/">Read player profile →</a></div>`;
}

$("playerOfDay").innerHTML = awardCard("PLAYER OF THE DAY", topHitter);
$("topPitcher").innerHTML = awardCard("PITCHER OF THE DAY", topPitcher);

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
