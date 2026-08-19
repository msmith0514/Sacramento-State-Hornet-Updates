const data = window.SAC_STATE_DATA;
const slug = document.body.dataset.player;
const player = data.trackedAlumni.find(p => p.slug === slug);
const $ = id => document.getElementById(id);
function chips(items){ return items.map(x => `<span class="stat-chip">${x}</span>`).join(""); }
function awards(items){ return items.length ? items.map(x => `<li>${x}</li>`).join("") : '<li>No verified awards loaded.</li>'; }

const fallbackExtended = {
  "travis-adams": {type:"pitcher", stats:["46 SO","17 BB","26.4% K%","17.3% IN-ZONE SWING & MISS","1.000 FLD%","0 E"], note:"MLB / Baseball Savant season data"},
  "rhys-hoskins": {type:"hitter", stats:["47 BB","100 SO",".994 FLD%","2 E"], note:"MLB / Baseball Savant season data"},
  "james-outman": {type:"hitter", stats:["10 BB","71 SO",".983 FLD%","1 E"], note:"MLB / Baseball Savant season data"},
  "nathan-lukes": {type:"hitter", stats:["17 BB","39 SO","FLD% —","E —"], note:"Batting data available; fielding updates when official feed returns it"},
  "austin-roberts": {type:"pitcher", stats:["71 SO","BB —","K% —","IN-ZONE SWING & MISS —"], note:"Standard MiLB line shown; pitch-tracking availability varies by level"},
  "erick-dessens": {type:"hitter", stats:["BB —","SO —","FLD% —","E —"], note:"No official MiLB stat line posted yet"},
  "ethan-lay": {type:"pitcher", stats:["SO —","BB —","K% —","IN-ZONE SWING & MISS —"], note:"No official MiLB stat line posted yet"},
  "kade-brown": {type:"pitcher", stats:["37 SO","13 BB","24.5% K%","IN-ZONE SWING & MISS —"], note:"MiLB standard data; K% calculated from 37 K / 151 batters faced"},
  "jp-smith-ii": {type:"hitter", stats:["53 BB","67 SO","FLD% —","E —"], note:"Official MiLB batting data"},
  "carson-latimer": {type:"pitcher", stats:["24 SO","BB —","K% —","IN-ZONE SWING & MISS —"], note:"MiLB pitch-tracking availability varies by level"},
  "gunner-gouldsmith": {type:"hitter", stats:["40 BB","49 SO",".959 FLD%","9 E"], note:"2026 High-A fielding across 2B/3B/SS"},
  "eli-saul": {type:"pitcher", stats:["2026: no game stats","K% —","IN-ZONE SWING & MISS —"], note:"Released before recording an official 2026 appearance"},
  "wehiwa-aloy": {type:"hitter", stats:["BB —","SO —","FLD% —","E —"], note:"Official feed will fill these when returned"},
  "sam-long": {type:"pitcher", stats:["41 SO","24 BB","K% —","IN-ZONE SWING & MISS —"], note:"NPB season; MLB Statcast zone metrics do not apply"}
};

function advancedMarkup(ext){
  const title = ext.type === 'pitcher' ? 'Pitching Detail' : 'Batting & Fielding Detail';
  return `<div class="advanced-stat-block"><div class="advanced-stat-heading"><span>${title}</span><small id="advancedSourceNote">${ext.note || ''}</small></div><div id="advancedStats" class="stat-chip-grid advanced-stat-grid">${chips(ext.stats || [])}</div></div>`;
}

async function fetchOfficialSeasonDetail(player){
  if(!player.mlbId || player.currentLevel.includes('NPB') || player.currentLevel.includes('Free agent') || player.currentLevel.includes('Released')) return;
  const isPitcher = player.category.includes('pitcher');
  const sportIds = player.currentLevel === 'MLB' ? '1' : '11,12,13,14,15,16';
  const group = isPitcher ? 'pitching' : 'hitting';
  try {
    const [offRes, fldRes] = await Promise.all([
      fetch(`https://statsapi.mlb.com/api/v1/people/${player.mlbId}/stats?stats=season&group=${group}&season=2026&sportIds=${sportIds}`),
      fetch(`https://statsapi.mlb.com/api/v1/people/${player.mlbId}/stats?stats=season&group=fielding&season=2026&sportIds=${sportIds}`)
    ]);
    if(!offRes.ok) return;
    const offJson = await offRes.json();
    const fldJson = fldRes.ok ? await fldRes.json() : null;
    const off = offJson?.stats?.[0]?.splits?.[0]?.stat;
    const fldSplits = fldJson?.stats?.[0]?.splits || [];
    if(!off) return;
    let items = [];
    if(isPitcher){
      const k = Number(off.strikeOuts ?? 0);
      const bb = Number(off.baseOnBalls ?? 0);
      const bf = Number(off.battersFaced ?? 0);
      const kpct = bf ? `${(100*k/bf).toFixed(1)}% K%` : 'K% —';
      items = [`${k} SO`, `${bb} BB`, kpct];
      const zoneWhiff = player.slug === 'travis-adams' ? '17.3% IN-ZONE SWING & MISS' : 'IN-ZONE SWING & MISS —';
      items.push(zoneWhiff);
    } else {
      items = [`${off.baseOnBalls ?? '—'} BB`, `${off.strikeOuts ?? '—'} SO`];
      if(fldSplits.length){
        let tc=0, errs=0;
        fldSplits.forEach(s=>{ tc += Number(s.stat?.chances ?? 0); errs += Number(s.stat?.errors ?? 0); });
        const pct = tc ? ((tc-errs)/tc).toFixed(3).replace(/^0/,'') : '—';
        items.push(`${pct} FLD%`, `${errs} E`);
      } else items.push('FLD% —','E —');
    }
    const box = $('advancedStats');
    if(box) box.innerHTML = chips(items);
    const note = $('advancedSourceNote');
    if(note) note.textContent = 'Official MLB/MiLB season feed · 2026';
  } catch(e) { /* retain verified fallback snapshot */ }
}

if (!player) {
  document.querySelector('main').innerHTML='<section class="section"><h1>Player not found</h1><a href="../../players/">Return to directory</a></section>';
} else {
  document.title=`${player.name} | Sac State Baseball Daily`;
  const img=$('profilePhoto'); img.src=player.profileImage || player.collegeHeadshot || ''; img.alt=`${player.name} profile photo`; img.onerror=()=>{ if(player.collegeHeadshot && img.src !== player.collegeHeadshot){ img.src=player.collegeHeadshot; } else { img.style.display='none'; $('profileInitials').style.display='grid'; } };
  $('profileInitials').textContent=player.initials;
  $('profileName').textContent=player.name;
  $('profileMeta').textContent=`${player.position} · ${player.currentOrg} · ${player.currentLevel}`;
  $('profileYears').textContent=`Sacramento State: ${player.sacYears}`;
  $('profileBio').textContent=player.bio;
  $('seasonLabel').textContent=player.seasonLabel;
  $('seasonStats').innerHTML=chips(player.seasonStats);
  const ext = fallbackExtended[player.slug] || {type:player.category.includes('pitcher')?'pitcher':'hitter',stats:[],note:''};
  $('seasonStats').insertAdjacentHTML('afterend', advancedMarkup(ext));
  $('sacCareerStats').innerHTML=chips(player.sacCareerStats);
  $('proCareerLabel').textContent=player.proCareerLabel;
  $('proCareerStats').innerHTML=chips(player.proCareerStats);
  $('collegeAwards').innerHTML=awards(player.collegeAwards);
  $('proAwards').innerHTML=awards(player.proAwards);
  $('sourceLinks').innerHTML=player.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener">${s.label} ↗</a>`).join('');
  fetchOfficialSeasonDetail(player);
}
