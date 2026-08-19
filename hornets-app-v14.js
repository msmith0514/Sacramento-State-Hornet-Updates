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
  108:"LAA",109:"ARI",110:"BAL",111:"BOS",112:"CHC",113:"CIN",114:"CLE",115:"COL",116:"DET",117:"HOU",
  118:"KC",119:"LAD",120:"WAS",121:"NYM",133:"ATH",134:"PIT",135:"SD",136:"SEA",137:"SF",138:"STL",
  139:"TB",140:"TEX",141:"TOR",142:"MIN",143:"PHI",144:"ATL",145:"CHW",146:"MIA",147:"NYY",158:"MIL"
};

// CBS Sports uses these short team codes in GameTracker URLs.
const CBS_TEAM_CODE = {...TEAM_ABBR};

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

function cbsGameUrl(game, awayCode, homeCode) {
  const rawDate = game.officialDate || todayIsoLocal();
  const compactDate = rawDate.replaceAll("-", "");
  return `https://www.cbssports.com/mlb/gametracker/live/MLB_${compactDate}_${awayCode}%40${homeCode}/`;
}

function baseState(game) {
  const offense = game.linescore?.offense || {};
  const occupied = [Boolean(offense.first), Boolean(offense.second), Boolean(offense.third)];
  return `<span class="base-diamond ${occupied[2] ? "on" : ""}"></span><span class="base-diamond ${occupied[1] ? "on" : ""}"></span><span class="base-diamond ${occupied[0] ? "on" : ""}"></span>`;
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
  const awayCode = CBS_TEAM_CODE[awayTeam.id] || TEAM_ABBR[awayTeam.id] || "AWY";
  const homeCode = CBS_TEAM_CODE[homeTeam.id] || TEAM_ABBR[homeTeam.id] || "HME";
  const awayRecord = away.leagueRecord ? `${away.leagueRecord.wins}-${away.leagueRecord.losses}` : "";
  const homeRecord = home.leagueRecord ? `${home.leagueRecord.wins}-${home.leagueRecord.losses}` : "";
  const ls = game.linescore || {};
  const balls = Number.isFinite(ls.balls) ? ls.balls : null;
  const strikes = Number.isFinite(ls.strikes) ? ls.strikes : null;
  const outs = Number.isFinite(ls.outs) ? ls.outs : null;
  const countText = isLive && balls !== null && strikes !== null
    ? `${balls}-${strikes}${outs !== null ? `, ${outs} out${outs === 1 ? "" : "s"}` : ""}`
    : isFinal ? "Final" : "Tap for CBS GameTracker";
  const statusText = escapeHtml(mlbGameStatus(game));
  const url = cbsGameUrl(game, awayCode, homeCode);
  return `
    <a class="cbs-score-tile" href="${url}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(awayTeam.name || "Away")} at ${escapeHtml(homeTeam.name || "Home")} on CBS Sports">
      <div class="cbs-score-head">
        <strong>${statusText}</strong>
        <span class="cbs-bases" aria-hidden="true">${isLive ? baseState(game) : ""}</span>
        <span class="cbs-live-label">${isLive ? "LIVE" : isFinal ? "FINAL" : "CBS"}</span>
      </div>
      <div class="cbs-team-line">
        <img src="https://www.mlbstatic.com/team-logos/${awayTeam.id}.svg" alt="" onerror="this.style.visibility='hidden'">
        <strong class="cbs-team-code">${awayCode}</strong>
        <span class="cbs-record">${awayRecord}</span>
        <b class="cbs-score">${awayScore}</b>
      </div>
      <div class="cbs-team-line">
        <img src="https://www.mlbstatic.com/team-logos/${homeTeam.id}.svg" alt="" onerror="this.style.visibility='hidden'">
        <strong class="cbs-team-code">${homeCode}</strong>
        <span class="cbs-record">${homeRecord}</span>
        <b class="cbs-score">${homeScore}</b>
      </div>
      <div class="cbs-count">${escapeHtml(countText)}</div>
    </a>`;
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
$("persistenceNotice").textContent = `Featured performance date: ${frontResults[0]?.date || data.snapshotDate || "Latest verified update"}`;

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
  const article = `${player.summary || player.stat || "Verified performance information."}`;
  const scoreLine = typeof player.score === "number" ? `<p class="award-score"><strong>Performance score:</strong> ${player.score.toFixed(1)}</p>` : "";
  const statusLabel = resultMode === "yesterday" && isGame ? label : `MOST RECENT ${label}`;
  const articleHref = `articles/${slugFor(player.name)}/`;
  return `<a class="award-card-link" href="${articleHref}" aria-label="Read article about ${player.name}">${imageTag(player.name,'award-photo',player.initials)}<div class="award-copy"><p class="eyebrow gold">${statusLabel}</p><h3>${player.name}</h3><div class="alumni-badge">FORMER SACRAMENTO STATE HORNET</div><p class="award-team">${player.team || approvedPlayer(player.name)?.currentOrg || ""}</p><p class="award-date">${dateLabel}</p><p class="award-article">${article}</p>${scoreLine}<span class="profile-button award-read-link">Read story →</span></div></a>`;
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
$("storyHeadline").textContent = resultMode === "yesterday" ? "Former Hornets Across Professional Baseball" : "Former Hornets: Latest Professional Snapshot";
$("storyBody").textContent = resultMode === "yesterday"
  ? "This report contains only verified performances by former Sacramento State baseball players on the tracked alumni list."
  : `The latest verified professional snapshot features ${topHitter?.name || "Sacramento State alumni"} on the position-player side and ${topPitcher?.name || "a former Hornet pitcher"} on the mound. Open either featured card above for the full story and supporting statistics.`;

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

// v13 NCAA Division I baseball scoreboard.
// Uses ESPN's college-baseball scoreboard feed. During the offseason, the feed's
// most recent events are shown so the section does not become an empty panel.
const collegeGamesEl = $("collegeGames");
const collegeScoreNote = $("collegeScoreNote");
const collegeScoreBanner = $("collegeScoreBanner");

function espnDateLocal() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
}

function collegeStatus(event) {
  const comp = event.competitions?.[0] || {};
  const status = comp.status || event.status || {};
  const type = status.type || {};
  const state = type.state || "pre";
  if (state === "in") return type.shortDetail || type.detail || "LIVE";
  if (state === "post") return type.shortDetail || type.detail || "FINAL";
  const date = comp.date || event.date;
  if (!date) return type.shortDetail || "Scheduled";
  const when = new Date(date);
  return when.toLocaleTimeString([], {hour:"numeric", minute:"2-digit", timeZoneName:"short"});
}

function collegeRecord(competitor) {
  const rec = (competitor.records || []).find(r => r.type === "total") || competitor.records?.[0];
  return rec?.summary || "";
}

function collegeGameLink(event) {
  const links = event.links || [];
  const preferred = links.find(l => (l.rel || []).includes("summary"))
    || links.find(l => (l.rel || []).includes("event"))
    || links[0];
  return preferred?.href || `https://www.espn.com/college-baseball/scoreboard`;
}

function collegeScoreTile(event) {
  const comp = event.competitions?.[0] || {};
  const competitors = comp.competitors || [];
  const away = competitors.find(c => c.homeAway === "away") || competitors[0] || {};
  const home = competitors.find(c => c.homeAway === "home") || competitors[1] || {};
  const state = (comp.status?.type?.state || event.status?.type?.state || "pre");
  const isLive = state === "in";
  const isFinal = state === "post";
  const awayTeam = away.team || {};
  const homeTeam = home.team || {};
  const awayCode = awayTeam.abbreviation || awayTeam.shortDisplayName || "AWY";
  const homeCode = homeTeam.abbreviation || homeTeam.shortDisplayName || "HME";
  const awayLogo = awayTeam.logo || awayTeam.logos?.[0]?.href || "";
  const homeLogo = homeTeam.logo || homeTeam.logos?.[0]?.href || "";
  const awayScore = (isLive || isFinal) ? (away.score ?? "0") : "–";
  const homeScore = (isLive || isFinal) ? (home.score ?? "0") : "–";
  const broadcast = (comp.broadcasts || []).flatMap(b => b.names || []).join(" / ");
  const status = escapeHtml(collegeStatus(event));
  const url = collegeGameLink(event);
  return `
    <a class="cbs-score-tile college-score-tile" href="${escapeHtml(url)}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(awayTeam.displayName || awayCode)} at ${escapeHtml(homeTeam.displayName || homeCode)} college baseball game">
      <div class="cbs-score-head">
        <strong>${status}</strong>
        <span class="college-live-dot">${isLive ? "●" : ""}</span>
        <span class="cbs-live-label">${isLive ? "LIVE" : isFinal ? "FINAL" : escapeHtml(broadcast || "ESPN")}</span>
      </div>
      <div class="cbs-team-line">
        ${awayLogo ? `<img src="${escapeHtml(awayLogo)}" alt="" onerror="this.style.visibility='hidden'">` : `<span class="college-logo-fallback"></span>`}
        <strong class="cbs-team-code">${escapeHtml(awayCode)}</strong>
        <span class="cbs-record">${escapeHtml(collegeRecord(away))}</span>
        <b class="cbs-score">${escapeHtml(awayScore)}</b>
      </div>
      <div class="cbs-team-line">
        ${homeLogo ? `<img src="${escapeHtml(homeLogo)}" alt="" onerror="this.style.visibility='hidden'">` : `<span class="college-logo-fallback"></span>`}
        <strong class="cbs-team-code">${escapeHtml(homeCode)}</strong>
        <span class="cbs-record">${escapeHtml(collegeRecord(home))}</span>
        <b class="cbs-score">${escapeHtml(homeScore)}</b>
      </div>
      <div class="cbs-count">${escapeHtml(event.shortName || `${awayCode} at ${homeCode}`)}</div>
    </a>`;
}

async function loadCollegeScoreboard() {
  if (!collegeGamesEl) return;
  collegeGamesEl.innerHTML = `<div class="scoreboard-loading"><strong>Loading Division I baseball games…</strong></div>`;
  collegeScoreNote.textContent = "Live scores · auto-refresh";
  try {
    const today = espnDateLocal();
    let response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard?dates=${today}&limit=200`, {cache:"no-store"});
    if (!response.ok) throw new Error(`College baseball feed returned ${response.status}`);
    let payload = await response.json();
    let events = payload.events || [];
    let fallback = false;

    if (!events.length) {
      fallback = true;
      response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/scoreboard?limit=16`, {cache:"no-store"});
      if (!response.ok) throw new Error(`College baseball fallback returned ${response.status}`);
      payload = await response.json();
      events = payload.events || [];
    }

    if (!events.length) {
      collegeGamesEl.innerHTML = `<div class="empty-state"><strong>No NCAA Division I baseball games are available.</strong><p>The college scoreboard will populate when the feed publishes games.</p></div>`;
      collegeScoreBanner.textContent = "No NCAA Division I baseball games available";
      return;
    }

    const rank = e => {
      const state = e.competitions?.[0]?.status?.type?.state || e.status?.type?.state;
      return state === "in" ? 0 : state === "pre" ? 1 : 2;
    };
    events.sort((a,b) => rank(a)-rank(b) || new Date(a.date)-new Date(b.date));
    collegeGamesEl.innerHTML = events.slice(0, 12).map(collegeScoreTile).join("");
    collegeScoreBanner.innerHTML = fallback
      ? `<strong>College baseball is currently out of season.</strong><span> Showing the most recent NCAA Division I games.</span><span> Updated ${new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}</span>`
      : `<strong>Today's NCAA Division I baseball scoreboard.</strong><span> Updated ${new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}</span>`;
    collegeScoreNote.textContent = fallback ? "Most recent D-I games" : "Live scores · auto-refresh";
  } catch (error) {
    console.error("College baseball scoreboard unavailable", error);
    collegeGamesEl.innerHTML = `<div class="empty-state"><strong>Division I baseball scoreboard is temporarily unavailable.</strong><p>The page could not reach the college baseball score feed.</p></div>`;
    collegeScoreBanner.textContent = "College baseball feed temporarily unavailable";
  }
}

loadCollegeScoreboard();
window.setInterval(loadCollegeScoreboard, 60000);
