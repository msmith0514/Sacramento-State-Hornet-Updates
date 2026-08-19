// IMPORTANT: DEMO DATA ONLY.
// Replace every sample record below with verified data before publishing factual sports information.

window.SAC_STATE_DATA = {
  refreshedAt: "Demo mode — sample data only",
  liveGames: [
    {
      level: "Triple-A",
      status: "LIVE · Top 6 · 1 out",
      live: true,
      away: { name: "River City Cats", abbr: "RC", score: 3 },
      home: { name: "Desert Aviators", abbr: "DA", score: 2 },
      hornet: "Marcus Green",
      hornetLine: "1-for-2, 2B, RBI",
      watchLabel: "Broadcast info unavailable",
      watchUrl: ""
    },
    {
      level: "Double-A",
      status: "7:05 PM PT",
      live: false,
      away: { name: "Bay City Seals", abbr: "BC", score: "—" },
      home: { name: "Valley Oaks", abbr: "VO", score: "—" },
      hornet: "Evan Torres",
      hornetLine: "Scheduled to start",
      watchLabel: "Game preview",
      watchUrl: "#"
    }
  ],
  yesterday: [
    {
      name: "Marcus Green",
      initials: "MG",
      team: "River City Cats",
      role: "INF",
      stat: "2-for-4, HR, 2 RBI, BB",
      result: "W 6-4",
      summary: "Green reached base three times and drove in two runs in a road win.",
      score: 9.4,
      type: "hitter"
    },
    {
      name: "Evan Torres",
      initials: "ET",
      team: "Valley Oaks",
      role: "RHP",
      stat: "6.0 IP, 2 H, 0 ER, 7 K",
      result: "W 3-1",
      summary: "Torres worked six scoreless innings and struck out seven.",
      score: 9.1,
      type: "pitcher"
    },
    {
      name: "Jordan Lee",
      initials: "JL",
      team: "Capitol Club",
      role: "OF",
      stat: "1-for-3, BB, R",
      result: "L 2-5",
      summary: "Lee reached twice and scored once.",
      score: 4.8,
      type: "hitter"
    }
  ],
  videos: [
    { title: "Official highlights will appear here", player: "Marcus Green", source: "MLB/MiLB/team source", url: "" },
    { title: "Player interview / feature", player: "Evan Torres", source: "Team or Sacramento State", url: "" },
    { title: "Game recap video", player: "Jordan Lee", source: "Official team channel", url: "" }
  ],
  players: [
    { name: "Marcus Green", initials: "MG", category: ["pro","position"], position: "INF", org: "River City Cats", years: "Sac State 2021–23", stat: ".287 AVG · 12 HR · 46 RBI" },
    { name: "Evan Torres", initials: "ET", category: ["pro","pitcher"], position: "RHP", org: "Valley Oaks", years: "Sac State 2020–22", stat: "3.42 ERA · 68 K" },
    { name: "Jordan Lee", initials: "JL", category: ["pro","position"], position: "OF", org: "Capitol Club", years: "Sac State 2019–21", stat: ".264 AVG · 18 SB" },
    { name: "Noah Ramirez", initials: "NR", category: ["current","pitcher"], position: "LHP", org: "Sacramento State", years: "Current Hornet", stat: "College season stats" },
    { name: "Tyler Brooks", initials: "TB", category: ["current","position"], position: "C", org: "Sacramento State", years: "Current Hornet", stat: "College season stats" },
    { name: "Alex Mendoza", initials: "AM", category: ["pro","pitcher"], position: "RHP", org: "Capital City Club", years: "Sac State 2018–20", stat: "2 SV · 31 K" }
  ]
};
