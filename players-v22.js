const data = window.SAC_STATE_DATA || {};
const $ = id => document.getElementById(id);
function renderPlayers(filter='all'){
  const rows=(data.players||[]).filter(p=>filter==='all'||(p.category||[]).includes(filter));
  $('playerGrid').innerHTML=rows.map(p=>`<article class="player-card former-hornet-card"><div class="player-top"><div class="player-photo-wrap"><img class="player-photo" src="${p.profileImage||p.collegeHeadshot||''}" data-fallback="${p.collegeHeadshot||''}" alt="${p.name}" onerror="if(this.dataset.fallback&&this.src!==this.dataset.fallback){this.src=this.dataset.fallback}else{this.style.display='none'}"></div><span class="sac-state-mark">SAC STATE</span></div><div class="player-body"><div class="alumni-badge">FORMER SACRAMENTO STATE HORNET</div><h3>${p.name}</h3><div class="player-meta">${p.position} · ${p.org}</div><div class="player-meta">${p.years}</div><div class="player-statline">${p.stat}</div><a class="profile-button" href="${p.slug}/">View full profile →</a></div></article>`).join('');
}
renderPlayers();
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderPlayers(btn.dataset.filter);}));
const menuButton=$('menuButton'),mobileMenu=$('mobileMenu');if(menuButton&&mobileMenu){menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));mobileMenu.hidden=open;});}
