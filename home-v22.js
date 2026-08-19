const data = window.SAC_STATE_DATA || {};
const $ = id => document.getElementById(id);
const players = (data.players || []).slice(0, 6);
const wrap = $("homeSnapshots");
if (wrap) {
  wrap.innerHTML = players.map(p => `
    <a class="home-snapshot-card" href="players/${p.slug}/">
      <div class="home-snapshot-photo"><img src="${p.profileImage || p.collegeHeadshot || ''}" data-fallback="${p.collegeHeadshot || ''}" alt="${p.name}" onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback}else{this.style.display='none'}"></div>
      <div><span>FORMER SACRAMENTO STATE HORNET</span><h3>${p.name}</h3><p>${p.position} · ${p.org}</p><b>${p.stat}</b></div>
    </a>`).join('');
}
const menuButton = $("menuButton"), mobileMenu = $("mobileMenu");
if (menuButton && mobileMenu) {
  menuButton.addEventListener("click",()=>{const open=menuButton.getAttribute("aria-expanded")==="true";menuButton.setAttribute("aria-expanded",String(!open));mobileMenu.hidden=open;});
  mobileMenu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobileMenu.hidden=true;menuButton.setAttribute("aria-expanded","false");}));
}
