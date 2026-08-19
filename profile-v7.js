const data = window.SAC_STATE_DATA;
const slug = document.body.dataset.player;
const player = data.trackedAlumni.find(p => p.slug === slug);
const $ = id => document.getElementById(id);
function chips(items){ return items.map(x => `<span class="stat-chip">${x}</span>`).join(""); }
function awards(items){ return items.length ? items.map(x => `<li>${x}</li>`).join("") : '<li>No verified awards loaded.</li>'; }
if (!player) {
  document.querySelector('main').innerHTML='<section class="section"><h1>Player not found</h1><a href="../../index.html#players">Return to directory</a></section>';
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
  $('sacCareerStats').innerHTML=chips(player.sacCareerStats);
  $('proCareerLabel').textContent=player.proCareerLabel;
  $('proCareerStats').innerHTML=chips(player.proCareerStats);
  $('collegeAwards').innerHTML=awards(player.collegeAwards);
  $('proAwards').innerHTML=awards(player.proAwards);
  $('sourceLinks').innerHTML=player.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener">${s.label} ↗</a>`).join('');
}
