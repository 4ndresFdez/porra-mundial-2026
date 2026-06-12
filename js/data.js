// ============================================================
// ESTRUCTURA DEL MUNDIAL 2026
// 48 equipos, 12 grupos (A-L), 4 equipos por grupo
// Avanzan: 1º y 2º de cada grupo (24) + 8 mejores terceros = 32
// ============================================================

// Grupos oficiales del Mundial 2026
const WORLD_CUP_GROUPS = {
  A: ["México", "Sudáfrica", "Corea del Sur", "Chequia"],
  B: ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"],
  C: ["Brasil", "Marruecos", "Haití", "Escocia"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Países Bajos", "Japón", "Suecia", "Túnez"],
  G: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
  H: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"],
  I: ["Francia", "Senegal", "Irak", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "República Democrática del Congo", "Uzbekistán", "Colombia"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"],
};

const GROUPS = Object.keys(WORLD_CUP_GROUPS);

// Crea los slots de grupos con los equipos oficiales
// order: [índice del 1º, índice del 2º, índice del 3º, índice del 4º]
function createGroupSlots() {
  return GROUPS.map(letter => ({
    name: `Grupo ${letter}`,
    letter,
    pool: WORLD_CUP_GROUPS[letter],       // los 4 equipos fijos
    order: [null, null, null, null],       // índices en orden 1º,2º,3º,4º
  }));
}

// Devuelve el equipo en la posición dada (1-4) según el orden del usuario
function getTeamAt(group, pos) {
  const idx = group.order[pos - 1];
  return (idx !== null && idx !== undefined) ? group.pool[idx] : "";
}

// Devuelve array de 4 equipos ordenados [1º, 2º, 3º, 4º]
function getOrderedTeams(group) {
  return [1, 2, 3, 4].map(p => getTeamAt(group, p));
}

// ============================================================
// BRACKET OFICIAL FIFA WORLD CUP 2026
// Fuente: FIFA.com
// ============================================================

// ─── Dieciseisavos (16 partidos) ─────────────────────────
// Cada partido tiene referencias estructuradas para resolver los nombres reales
// home/away: { type: 'group', group: 'X', pos: N } o { type: 'third', rank: N }
const R32_MATCHES = [
  { id: 73, home: { type:'group', group:'A', pos:2 }, away: { type:'group', group:'B', pos:2 }, loc: "Los Ángeles", label: "2ºA vs 2ºB" },
  { id: 74, home: { type:'group', group:'E', pos:1 }, away: { type:'third', rank:1 }, loc: "Boston", label: "1ºE vs Mejor 3º" },
  { id: 75, home: { type:'group', group:'F', pos:1 }, away: { type:'group', group:'C', pos:2 }, loc: "Monterrey", label: "1ºF vs 2ºC" },
  { id: 76, home: { type:'group', group:'C', pos:1 }, away: { type:'group', group:'F', pos:2 }, loc: "Houston", label: "1ºC vs 2ºF" },
  { id: 77, home: { type:'group', group:'I', pos:1 }, away: { type:'third', rank:2 }, loc: "NY/NJ", label: "1ºI vs Mejor 3º" },
  { id: 78, home: { type:'group', group:'E', pos:2 }, away: { type:'group', group:'I', pos:2 }, loc: "Dallas", label: "2ºE vs 2ºI" },
  { id: 79, home: { type:'group', group:'A', pos:1 }, away: { type:'third', rank:3 }, loc: "Ciudad de México", label: "1ºA vs Mejor 3º" },
  { id: 80, home: { type:'group', group:'L', pos:1 }, away: { type:'third', rank:4 }, loc: "Filadelfia", label: "1ºL vs Mejor 3º" },
  { id: 81, home: { type:'group', group:'D', pos:1 }, away: { type:'third', rank:5 }, loc: "Atlanta", label: "1ºD vs Mejor 3º" },
  { id: 82, home: { type:'group', group:'G', pos:1 }, away: { type:'third', rank:6 }, loc: "Miami", label: "1ºG vs Mejor 3º" },
  { id: 83, home: { type:'group', group:'K', pos:2 }, away: { type:'group', group:'L', pos:2 }, loc: "San Francisco", label: "2ºK vs 2ºL" },
  { id: 84, home: { type:'group', group:'H', pos:1 }, away: { type:'group', group:'J', pos:2 }, loc: "Kansas City", label: "1ºH vs 2ºJ" },
  { id: 85, home: { type:'group', group:'B', pos:1 }, away: { type:'third', rank:7 }, loc: "Vancouver", label: "1ºB vs Mejor 3º" },
  { id: 86, home: { type:'group', group:'F', pos:2 }, away: { type:'group', group:'G', pos:2 }, loc: "Seattle", label: "2ºF vs 2ºG" },
  { id: 87, home: { type:'group', group:'J', pos:1 }, away: { type:'group', group:'H', pos:2 }, loc: "Toronto", label: "1ºJ vs 2ºH" },
  { id: 88, home: { type:'group', group:'K', pos:1 }, away: { type:'third', rank:8 }, loc: "Los Ángeles", label: "1ºK vs Mejor 3º" },
];

// ─── Resuelve el nombre de un equipo desde el estado ─────
// ref: { type:'group', group:'X', pos:N } o { type:'third', rank:N }
function resolveTeamName(ref, groups, thirds) {
  if (!ref) return "?";
  if (ref.type === 'group') {
    const g = groups.find(gr => gr.letter === ref.group);
    if (!g) return "?";
    const name = getTeamAt(g, ref.pos);
    if (!name) return `${ref.pos}\u00ba ${ref.group}`;
    const flag = getFlag(name);
    return flag ? `${flag} ${name}` : name;
  }
  if (ref.type === 'third') {
    // Buscar el tercero en el ranking dado
    const ranked = thirds
      .map((t, i) => ({ ...t, idx: i }))
      .filter(t => t._selected && t._rank)
      .sort((a, b) => a._rank - b._rank);
    const t = ranked[ref.rank - 1];
    if (!t || !t.teamName) return `Mejor 3\u00ba #${ref.rank}`;
    const flag = getFlag(t.teamName);
    return flag ? `${flag} ${t.teamName}` : t.teamName;
  }
  return "?";
}

// ─── Octavos ────────────────────────────────────────────
// homeRef/awayRef apuntan al partido de la ronda anterior
const R16_MATCHES = [
  { id: 89, homeRef: { matchId: 74 }, awayRef: { matchId: 73 }, loc: "Filadelfia", label: "Gan P74 vs Gan P73" },
  { id: 90, homeRef: { matchId: 75 }, awayRef: { matchId: 76 }, loc: "Houston", label: "Gan P75 vs Gan P76" },
  { id: 91, homeRef: { matchId: 77 }, awayRef: { matchId: 78 }, loc: "NY/NJ", label: "Gan P77 vs Gan P78" },
  { id: 92, homeRef: { matchId: 79 }, awayRef: { matchId: 80 }, loc: "Ciudad de México", label: "Gan P79 vs Gan P80" },
  { id: 93, homeRef: { matchId: 81 }, awayRef: { matchId: 82 }, loc: "Seattle", label: "Gan P81 vs Gan P82" },
  { id: 94, homeRef: { matchId: 83 }, awayRef: { matchId: 84 }, loc: "Vancouver", label: "Gan P83 vs Gan P84" },
  { id: 95, homeRef: { matchId: 85 }, awayRef: { matchId: 86 }, loc: "Atlanta", label: "Gan P85 vs Gan P86" },
  { id: 96, homeRef: { matchId: 87 }, awayRef: { matchId: 88 }, loc: "Boston", label: "Gan P87 vs Gan P88" },
];

// ─── Cuartos ────────────────────────────────────────────
const QF_MATCHES = [
  { id: 97,  homeRef: { matchId: 89 }, awayRef: { matchId: 90 }, loc: "Boston", label: "Gan P89 vs Gan P90" },
  { id: 98,  homeRef: { matchId: 91 }, awayRef: { matchId: 92 }, loc: "Miami", label: "Gan P91 vs Gan P92" },
  { id: 99,  homeRef: { matchId: 93 }, awayRef: { matchId: 94 }, loc: "Kansas City", label: "Gan P93 vs Gan P94" },
  { id: 100, homeRef: { matchId: 95 }, awayRef: { matchId: 96 }, loc: "Los Ángeles", label: "Gan P95 vs Gan P96" },
];

// ─── Semifinales ────────────────────────────────────────
const SF_MATCHES = [
  { id: 101, homeRef: { matchId: 97 }, awayRef: { matchId: 98 }, loc: "Dallas", label: "Gan P97 vs Gan P98" },
  { id: 102, homeRef: { matchId: 99 }, awayRef: { matchId: 100 }, loc: "Atlanta", label: "Gan P99 vs Gan P100" },
];

// ─── Tercer puesto y Final ──────────────────────────────
const THIRD_MATCH = { id: 103, homeRef: { matchId: 101, loser: true }, awayRef: { matchId: 102, loser: true }, loc: "Miami", label: "Per SF1 vs Per SF2" };
const FINAL_MATCH = { id: 104, homeRef: { matchId: 101 }, awayRef: { matchId: 102 }, loc: "NY/NJ - MetLife Stadium", label: "Gan SF1 vs Gan SF2" };

// ============================================================
// ÍNDICE DE PARTIDOS (para búsqueda rápida)
// ============================================================
const ALL_MATCHES = {};
[...R32_MATCHES, ...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, THIRD_MATCH, FINAL_MATCH].forEach(m => {
  ALL_MATCHES[m.id] = m;
});

// ============================================================
// RESOLUCIÓN DE NOMBRES EN EL BRACKET (recursivo)
// Dado el estado del usuario, resuelve los nombres de cada partido
// ============================================================

// Cache para evitar recalcular en cada render
let _resolveCache = null;
let _resolveCacheKey = null;

function resolveAllMatches(state) {
  // Cache key simple: JSON de picks + grupos + thirds
  const key = JSON.stringify({
    o: state.groups.map(g => g.order),
    t: state.thirds.map(t => ({ s: t._selected, r: t._rank })),
    r32: state.r32, r16: state.r16, qf: state.qf, sf: state.sf,
    f: state.final, t3: state.third,
  });
  if (_resolveCache && _resolveCacheKey === key) return _resolveCache;

  const resolved = {};

  function getWinnerName(matchId, isLoser) {
    const match = ALL_MATCHES[matchId];
    if (!match) return "?";

    // Determinar de qué ronda es este partido
    let roundKey;
    if (R32_MATCHES.some(m => m.id === matchId)) roundKey = "r32";
    else if (R16_MATCHES.some(m => m.id === matchId)) roundKey = "r16";
    else if (QF_MATCHES.some(m => m.id === matchId)) roundKey = "qf";
    else if (SF_MATCHES.some(m => m.id === matchId)) roundKey = "sf";
    else if (THIRD_MATCH.id === matchId) roundKey = "third";
    else if (FINAL_MATCH.id === matchId) roundKey = "final";
    else return "?";

    const roundData = state[roundKey] || [];
    const pick = roundData.find(p => p.matchId === matchId);

    if (!pick || !pick.winner) return null; // aún no elegido

    if (isLoser) {
      // El perdedor es el lado contrario al ganador
      const loserSide = pick.winner === 'A' ? 'B' : 'A';
      const resolvedMatch = resolved[matchId];
      if (!resolvedMatch) return "?";
      return loserSide === 'A' ? resolvedMatch.homeName : resolvedMatch.awayName;
    }

    const resolvedMatch = resolved[matchId];
    if (!resolvedMatch) return "?";
    return pick.winner === 'A' ? resolvedMatch.homeName : resolvedMatch.awayName;
  }

  // Resolver en orden: R32 → R16 → QF → SF → Final/Third
  const allMatchesInOrder = [...R32_MATCHES, ...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, THIRD_MATCH, FINAL_MATCH];

  for (const match of allMatchesInOrder) {
    let homeName, awayName;

    // Home
    if (match.home) {
      // R32: referencia directa a grupo/tercero
      homeName = resolveTeamName(match.home, state.groups, state.thirds);
    } else if (match.homeRef) {
      homeName = getWinnerName(match.homeRef.matchId, match.homeRef.loser) || "...";
    } else {
      homeName = "?";
    }

    // Away
    if (match.away) {
      awayName = resolveTeamName(match.away, state.groups, state.thirds);
    } else if (match.awayRef) {
      awayName = getWinnerName(match.awayRef.matchId, match.awayRef.loser) || "...";
    } else {
      awayName = "?";
    }

    resolved[match.id] = { homeName, awayName };
  }

  _resolveCache = resolved;
  _resolveCacheKey = key;
  return resolved;
}

// ============================================================
// BANDERAS (emoji flags)
// ============================================================
const FLAGS = {
  "México": "🇲🇽", "Sudáfrica": "🇿🇦", "Corea del Sur": "🇰🇷", "Chequia": "🇨🇿",
  "Canadá": "🇨🇦", "Bosnia y Herzegovina": "🇧🇦", "Catar": "🇶🇦", "Suiza": "🇨🇭",
  "Brasil": "🇧🇷", "Marruecos": "🇲🇦", "Haití": "🇭🇹", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Turquía": "🇹🇷",
  "Alemania": "🇩🇪", "Curazao": "🇨🇼", "Costa de Marfil": "🇨🇮", "Ecuador": "🇪🇨",
  "Países Bajos": "🇳🇱", "Japón": "🇯🇵", "Suecia": "🇸🇪", "Túnez": "🇹🇳",
  "Bélgica": "🇧🇪", "Egipto": "🇪🇬", "Irán": "🇮🇷", "Nueva Zelanda": "🇳🇿",
  "España": "🇪🇸", "Cabo Verde": "🇨🇻", "Arabia Saudita": "🇸🇦", "Uruguay": "🇺🇾",
  "Francia": "🇫🇷", "Senegal": "🇸🇳", "Irak": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argelia": "🇩🇿", "Austria": "🇦🇹", "Jordania": "🇯🇴",
  "Portugal": "🇵🇹", "República Democrática del Congo": "🇨🇩", "Uzbekistán": "🇺🇿", "Colombia": "🇨🇴",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croacia": "🇭🇷", "Ghana": "🇬🇭", "Panamá": "🇵🇦",
};

function getFlag(teamName) {
  return FLAGS[teamName] || "";
}

// ============================================================
// CALENDARIO COMPLETO DE PARTIDOS (para apuestas)
// Formato: { id, date: "YYYY-MM-DD", time: "HH:MM", group, home, away, homeScore, awayScore }
// homeScore/awayScore solo si el partido ya se jugó
// ============================================================
const MATCH_SCHEDULE = [
  // JORNADA 1
  { id:1011, date:"2026-06-11", time:"21:00", group:"A", home:"México", away:"Sudáfrica", homeScore:2, awayScore:0 },
  { id:1012, date:"2026-06-12", time:"04:00", group:"A", home:"Corea del Sur", away:"Chequia", homeScore:2, awayScore:1 },
  { id:1013, date:"2026-06-12", time:"21:00", group:"B", home:"Canadá", away:"Bosnia y Herzegovina" },
  { id:1014, date:"2026-06-13", time:"03:00", group:"D", home:"Estados Unidos", away:"Paraguay" },
  { id:1015, date:"2026-06-13", time:"21:00", group:"B", home:"Catar", away:"Suiza" },
  { id:1016, date:"2026-06-14", time:"00:00", group:"C", home:"Brasil", away:"Marruecos" },
  { id:1017, date:"2026-06-14", time:"03:00", group:"C", home:"Haití", away:"Escocia" },
  { id:1018, date:"2026-06-14", time:"06:00", group:"D", home:"Australia", away:"Turquía" },
  { id:1019, date:"2026-06-14", time:"19:00", group:"E", home:"Alemania", away:"Curazao" },
  { id:1020, date:"2026-06-14", time:"22:00", group:"F", home:"Países Bajos", away:"Japón" },
  { id:1021, date:"2026-06-15", time:"01:00", group:"E", home:"Costa de Marfil", away:"Ecuador" },
  { id:1022, date:"2026-06-15", time:"04:00", group:"F", home:"Suecia", away:"Túnez" },
  { id:1023, date:"2026-06-15", time:"18:00", group:"H", home:"España", away:"Cabo Verde" },
  { id:1024, date:"2026-06-15", time:"21:00", group:"G", home:"Bélgica", away:"Egipto" },
  { id:1025, date:"2026-06-16", time:"00:00", group:"H", home:"Arabia Saudita", away:"Uruguay" },
  { id:1026, date:"2026-06-16", time:"03:00", group:"G", home:"Irán", away:"Nueva Zelanda" },
  { id:1027, date:"2026-06-16", time:"21:00", group:"I", home:"Francia", away:"Senegal" },
  { id:1028, date:"2026-06-17", time:"00:00", group:"I", home:"Irak", away:"Noruega" },
  { id:1029, date:"2026-06-17", time:"03:00", group:"J", home:"Argentina", away:"Argelia" },
  { id:1030, date:"2026-06-17", time:"06:00", group:"J", home:"Austria", away:"Jordania" },
  { id:1031, date:"2026-06-17", time:"19:00", group:"K", home:"Portugal", away:"República Democrática del Congo" },
  { id:1032, date:"2026-06-17", time:"22:00", group:"L", home:"Inglaterra", away:"Croacia" },
  { id:1033, date:"2026-06-18", time:"01:00", group:"L", home:"Ghana", away:"Panamá" },
  { id:1034, date:"2026-06-18", time:"04:00", group:"K", home:"Uzbekistán", away:"Colombia" },
  // JORNADA 2
  { id:2001, date:"2026-06-18", time:"18:00", group:"A", home:"Chequia", away:"Sudáfrica" },
  { id:2002, date:"2026-06-18", time:"21:00", group:"B", home:"Suiza", away:"Bosnia y Herzegovina" },
  { id:2003, date:"2026-06-19", time:"00:00", group:"B", home:"Canadá", away:"Catar" },
  { id:2004, date:"2026-06-19", time:"03:00", group:"A", home:"México", away:"Corea del Sur" },
  { id:2005, date:"2026-06-19", time:"21:00", group:"D", home:"Estados Unidos", away:"Australia" },
  { id:2006, date:"2026-06-20", time:"00:00", group:"C", home:"Escocia", away:"Marruecos" },
  { id:2007, date:"2026-06-20", time:"02:30", group:"C", home:"Brasil", away:"Haití" },
  { id:2008, date:"2026-06-20", time:"05:00", group:"D", home:"Turquía", away:"Paraguay" },
  { id:2009, date:"2026-06-20", time:"19:00", group:"F", home:"Países Bajos", away:"Suecia" },
  { id:2010, date:"2026-06-20", time:"22:00", group:"E", home:"Alemania", away:"Costa de Marfil" },
  { id:2011, date:"2026-06-21", time:"02:00", group:"E", home:"Ecuador", away:"Curazao" },
  { id:2012, date:"2026-06-21", time:"06:00", group:"F", home:"Túnez", away:"Japón" },
  { id:2013, date:"2026-06-21", time:"18:00", group:"H", home:"España", away:"Arabia Saudita" },
  { id:2014, date:"2026-06-21", time:"21:00", group:"G", home:"Bélgica", away:"Irán" },
  { id:2015, date:"2026-06-22", time:"00:00", group:"H", home:"Uruguay", away:"Cabo Verde" },
  { id:2016, date:"2026-06-22", time:"03:00", group:"G", home:"Egipto", away:"Nueva Zelanda" },
  { id:2017, date:"2026-06-22", time:"18:00", group:"J", home:"Argentina", away:"Austria" },
  { id:2018, date:"2026-06-22", time:"22:00", group:"I", home:"Francia", away:"Irak" },
  { id:2019, date:"2026-06-23", time:"01:00", group:"I", home:"Noruega", away:"Senegal" },
  { id:2020, date:"2026-06-23", time:"04:00", group:"J", home:"Jordania", away:"Argelia" },
  { id:2021, date:"2026-06-23", time:"18:00", group:"K", home:"Portugal", away:"Uzbekistán" },
  { id:2022, date:"2026-06-23", time:"21:00", group:"L", home:"Inglaterra", away:"Ghana" },
  { id:2023, date:"2026-06-24", time:"01:00", group:"L", home:"Panamá", away:"Croacia" },
  { id:2024, date:"2026-06-24", time:"04:00", group:"K", home:"Colombia", away:"República Democrática del Congo" },
  // JORNADA 3
  { id:3001, date:"2026-06-24", time:"21:00", group:"A", home:"Sudáfrica", away:"Chequia" },
  { id:3002, date:"2026-06-24", time:"21:00", group:"A", home:"Corea del Sur", away:"México" },
  { id:3003, date:"2026-06-25", time:"00:00", group:"B", home:"Bosnia y Herzegovina", away:"Catar" },
  { id:3004, date:"2026-06-25", time:"00:00", group:"B", home:"Suiza", away:"Canadá" },
  { id:3005, date:"2026-06-25", time:"18:00", group:"C", home:"Marruecos", away:"Haití" },
  { id:3006, date:"2026-06-25", time:"18:00", group:"C", home:"Escocia", away:"Brasil" },
  { id:3007, date:"2026-06-25", time:"21:00", group:"E", home:"Curazao", away:"Costa de Marfil" },
  { id:3008, date:"2026-06-25", time:"21:00", group:"E", home:"Ecuador", away:"Alemania" },
  { id:3009, date:"2026-06-26", time:"00:00", group:"F", home:"Japón", away:"Suecia" },
  { id:3010, date:"2026-06-26", time:"00:00", group:"F", home:"Túnez", away:"Países Bajos" },
  { id:3011, date:"2026-06-26", time:"18:00", group:"D", home:"Paraguay", away:"Australia" },
  { id:3012, date:"2026-06-26", time:"18:00", group:"D", home:"Turquía", away:"Estados Unidos" },
  { id:3013, date:"2026-06-26", time:"21:00", group:"G", home:"Egipto", away:"Irán" },
  { id:3014, date:"2026-06-26", time:"21:00", group:"G", home:"Nueva Zelanda", away:"Bélgica" },
  { id:3015, date:"2026-06-27", time:"00:00", group:"H", home:"Cabo Verde", away:"Arabia Saudita" },
  { id:3016, date:"2026-06-27", time:"00:00", group:"H", home:"Uruguay", away:"España" },
  { id:3017, date:"2026-06-27", time:"18:00", group:"I", home:"Noruega", away:"Francia" },
  { id:3018, date:"2026-06-27", time:"18:00", group:"I", home:"Senegal", away:"Irak" },
  { id:3019, date:"2026-06-27", time:"21:00", group:"L", home:"Croacia", away:"Ghana" },
  { id:3020, date:"2026-06-27", time:"21:00", group:"L", home:"Panamá", away:"Inglaterra" },
  { id:3021, date:"2026-06-28", time:"00:00", group:"J", home:"Argelia", away:"Austria" },
  { id:3022, date:"2026-06-28", time:"00:00", group:"J", home:"Jordania", away:"Argentina" },
  { id:3023, date:"2026-06-28", time:"03:30", group:"K", home:"República Democrática del Congo", away:"Uzbekistán" },
  { id:3024, date:"2026-06-28", time:"03:30", group:"K", home:"Colombia", away:"Portugal" },
];

// Helper: obtener partidos entre dateFrom y dateTo
function getMatchesBetween(fromDate, toDate) {
  const from = typeof fromDate === 'string' ? fromDate : fromDate.toISOString().slice(0,10);
  const to = typeof toDate === 'string' ? toDate : toDate.toISOString().slice(0,10);
  return MATCH_SCHEDULE.filter(m => m.date >= from && m.date <= to);
}
