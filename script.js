const data = window.SAC_STATE_DATA;

const $ = (id) => document.getElementById(id);

$("refreshText").textContent = `Last refreshed: ${data.refreshedAt}`;

function gameCard(game) {
  return `
    <article class="game-card">
      <div class="game-topline">
        <span>${game.level} · ${game.status}</span>
        ${game.live ? '<span class="live-badge">LIVE</span>' : ''}
      </div>
      <div class="team-row">
        <div class="team">
          <div class="team-logo">${game.away.abbr}</div>
          <div class="team-name">${game.away.name}</div>
        </div>
        <div class="score">${game.away.score} – ${game.home.score}</div>
        <div class="team">
          <div class="team-logo">${game.home.abbr}</div>
          <div class="team-name">${game.home.name}</div>
        </div>
      </div>
      <div class="hornet-strip"><strong>HORNET:</strong> ${game.hornet}</div>
      <div class="live-box">${game.hornetLine}</div>
      ${game.watchUrl ? `<a class="game-link" href="${game.watchUrl}">${game.watchLabel} ↗</a>` : `<span class="game-link">${game.watchLabel}</span>`}
    </article>`;
}

$("liveGames").innerHTML = data.liveGames.map(gameCard).join("");

const topOverall = [...data.yesterday].sort((a,b) => b.score - a.score)[0];
const topPitcher = [...data.yesterday].filter(p => p.type === "pitcher").sort((a,b) => b.score - a.score)[0];

function awardCard(label, player) {
  if (!player) return `<p>No qualifying performance available.</p>`;
  return `
    <div class="player-avatar">${player.initials}</div>
    <div>
      <p class="eyebrow gold">${label}</p>
      <h3>${player.name}</h3>
      <p>${player.team}</p>
      <p>${player.summary}</p>
      <p><strong>Performance score:</strong> ${player.score.toFixed(1)}</p>
    </div>`;
}

$("playerOfDay").innerHTML = awardCard("PLAYER OF THE DAY", topOverall);
$("topPitcher").innerHTML = awardCard("TOP PITCHING PERFORMANCE", topPitcher);

$("yesterdayResults").innerHTML = data.yesterday.map(p => `
  <div class="result-row">
    <div class="result-avatar">${p.initials}</div>
    <div>
      <div class="result-name">${p.name}</div>
      <div class="result-stat">${p.stat}</div>
    </div>
    <div class="result-record">${p.result}<br><span style="color:#a9b7b0;font-weight:500">${p.team}</span></div>
  </div>`).join("");

const reportDate = new Date();
reportDate.setDate(reportDate.getDate() - 1);
$("reportDate").textContent = reportDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const hitter = data.yesterday.find(p => p.type === "hitter");
const pitcher = data.yesterday.find(p => p.type === "pitcher");
$("storyBody").textContent = hitter && pitcher
  ? `${hitter.name} led the offensive group with ${hitter.stat}. On the mound, ${pitcher.name} delivered ${pitcher.stat}. This demo recap is generated only from the sample records stored in data.js; replace those records with verified game data before publishing.`
  : "Statistics currently unavailable.";

$("videoGrid").innerHTML = data.videos.map(v => `
  <article class="video-card">
    <div class="video-thumb">▶</div>
    <div class="video-body">
      <div class="video-source">${v.source}</div>
      <h3>${v.title}</h3>
      <p>${v.player}</p>
      ${v.url ? `<a class="video-link" href="${v.url}" target="_blank" rel="noopener">Watch highlight ↗</a>` : `<span class="video-link">No verified video URL yet</span>`}
    </div>
  </article>`).join("");

function renderPlayers(filter = "all") {
  const rows = data.players.filter(p => filter === "all" || p.category.includes(filter));
  $("playerGrid").innerHTML = rows.map(p => `
    <article class="player-card">
      <div class="player-top"><div class="player-initials">${p.initials}</div></div>
      <div class="player-body">
        <div class="player-meta">${p.position} · ${p.org}</div>
        <h3>${p.name}</h3>
        <div class="player-meta">${p.years}</div>
        <div class="player-statline">${p.stat}</div>
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
