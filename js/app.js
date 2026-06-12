// ============================================================
// PORRA MUNDIAL 2026 - Lógica principal
// ============================================================

const App = (() => {
  // ─── Estado ───────────────────────────────────────────
  let state = {
    userName: "",
    groups: [],           // { name, teams: [4], letter }
    thirds: [],           // [{ groupLetter, teamName }] hasta 8
    r32: [],              // [{ matchId, winner }]
    r16: [],
    qf: [],
    sf: [],
    final: null,
    third: null,
    champion: null,
  };

  let compareList = [];   // [{ userName, data }] - para comparar

  // ─── Navegación ──────────────────────────────────────
  function goTo(screenName) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById("screen-" + screenName);
    if (target) target.classList.add("active");
    window.scrollTo(0, 0);

    if (screenName === "groups") renderGroups();
    if (screenName === "thirds") renderThirds();
    if (screenName === "r32") renderBracket("r32", R32_MATCHES, "r32");
    if (screenName === "r16") renderBracket("r16", R16_MATCHES, "r16");
    if (screenName === "qf") renderBracket("qf", QF_MATCHES, "qf");
    if (screenName === "sf") renderBracket("sf", SF_MATCHES, "sf");
    if (screenName === "third") renderBracket("third", [THIRD_MATCH], "third");
    if (screenName === "final") renderBracket("final", [FINAL_MATCH], "final");
    if (screenName === "share") renderShare();
  }

  // ─── Inicio ──────────────────────────────────────────
  function startNew() {
    const name = document.getElementById("input-name").value.trim();
    if (!name) { shakeInput("input-name"); return; }
    state.userName = name;

    // Inicializar grupos vacíos
    state.groups = createGroupSlots();
    state.thirds = [];
    state.r32 = [];
    state.r16 = [];
    state.qf = [];
    state.sf = [];
    state.final = null;
    state.third = null;
    state.champion = null;

    // Intentar cargar desde localStorage (para continuar una porra)
    const local = loadFromLocalRaw();
    if (local && local.userName === name) {
      state.groups = local.groups || state.groups;
      state.thirds = local.thirds || state.thirds;
      state.r32 = local.r32 || [];
      state.r16 = local.r16 || [];
      state.qf = local.qf || [];
      state.sf = local.sf || [];
      state.final = local.final || null;
      state.third = local.third || null;
      state.champion = local.champion || null;
    }

    goTo("groups");
  }

  // ─── Grupos ──────────────────────────────────────────
  function renderGroups() {
    const container = document.getElementById("groups-container");
    container.innerHTML = state.groups.map((g, gi) => {
      const selectedByPos = [1, 2, 3, 4].map(p => g.order[p - 1]); // índice seleccionado en cada posición
      const usedIndices = selectedByPos.filter(i => i !== null);

      return `
        <div class="group-card">
          <h4>${g.name}</h4>
          ${[0, 1, 2, 3].map(posIdx => {
            const pos = posIdx + 1;
            const selIdx = g.order[posIdx]; // índice del equipo en esta posición
            // Equipos disponibles: los del pool, pero los ya usados en otras pos se deshabilitan
            const options = g.pool.map((team, ti) => {
              const disabled = selIdx !== ti && usedIndices.includes(ti);
              const flag = getFlag(team);
              return `<option value="${ti}" ${selIdx === ti ? 'selected' : ''} ${disabled ? 'disabled' : ''}>${flag} ${team}</option>`;
            }).join("");
            const noSelection = selIdx === null || selIdx === undefined;
            return `
              <div class="team-slot">
                <span class="team-pos pos-${pos}">${pos}º</span>
                <select data-group="${gi}" data-pos="${posIdx}" onchange="App.setTeamOrder(this)" class="team-select">
                  <option value="" ${noSelection ? 'selected' : ''}>-- Elegir --</option>
                  ${options}
                </select>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }).join("");
  }

  function setTeamOrder(select) {
    const gi = parseInt(select.dataset.group);
    const posIdx = parseInt(select.dataset.pos);
    const val = select.value;
    state.groups[gi].order[posIdx] = val === "" ? null : parseInt(val);
    renderGroups(); // Re-render para actualizar disponibilidad
  }

  function saveGroups() {
    // Validar que todos los grupos tengan las 4 posiciones asignadas
    for (const g of state.groups) {
      const filled = g.order.filter(o => o !== null).length;
      if (filled < 4) {
        alert(`Completa las 4 posiciones del ${g.name}`);
        return;
      }
      // Verificar que no haya duplicados
      const unique = new Set(g.order);
      if (unique.size !== 4) {
        alert(`Hay equipos repetidos en el ${g.name}. Cada equipo solo puede ocupar una posición.`);
        return;
      }
    }

    // Generar lista de terceros automáticamente (preservando selección previa)
    const oldThirds = state.thirds || [];
    state.thirds = state.groups.map(g => {
      const old = oldThirds.find(t => t.groupLetter === g.letter);
      const thirdIdx = g.order[2]; // índice del 3º
      return {
        groupLetter: g.letter,
        teamName: thirdIdx !== null ? g.pool[thirdIdx] : "",
        _selected: old ? old._selected : false,
        _rank: old ? old._rank : null,
      };
    });
    saveToLocal();
    goTo("thirds");
  }

  // ─── Mejores Terceros ────────────────────────────────
  let selectedThirdsOrder = []; // índices en orden de selección

  function renderThirds() {
    const container = document.getElementById("thirds-container");
    selectedThirdsOrder = state.thirds
      .map((t, i) => t._selected ? ({ idx: i, rank: t._rank }) : null)
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank)
      .map(x => x.idx);

    container.innerHTML = state.thirds.map((t, i) => {
      const selIdx = selectedThirdsOrder.indexOf(i);
      const isSelected = selIdx >= 0;
      const flag = getFlag(t.teamName);
      return `
        <div class="third-item ${isSelected ? 'selected' : ''}" data-idx="${i}">
          <span class="third-rank">${isSelected ? selIdx + 1 : ''}</span>
          <span class="third-name">${flag} ${t.groupLetter}: ${escHtml(t.teamName)}</span>
          <span class="third-hint">${isSelected ? 'Clasificado ' + (selIdx + 1) + '\u00ba' : 'Click para seleccionar'}</span>
        </div>
      `;
    }).join("");
  }

  function toggleThird(idx) {
    const alreadyIdx = selectedThirdsOrder.indexOf(idx);
    if (alreadyIdx >= 0) {
      // Deseleccionar
      selectedThirdsOrder.splice(alreadyIdx, 1);
      state.thirds[idx]._selected = false;
      state.thirds[idx]._rank = null;
      // Re-rankea los demás
      selectedThirdsOrder.forEach((si, rank) => {
        state.thirds[si]._rank = rank + 1;
      });
    } else {
      if (selectedThirdsOrder.length >= 8) {
        alert("Solo puedes seleccionar 8 mejores terceros.");
        return;
      }
      selectedThirdsOrder.push(idx);
      state.thirds[idx]._selected = true;
      state.thirds[idx]._rank = selectedThirdsOrder.length;
    }
    renderThirds();
  }

  function saveThirds() {
    if (selectedThirdsOrder.length !== 8) {
      alert("Selecciona exactamente 8 mejores terceros.");
      return;
    }
    saveToLocal();
    goTo("r32");
  }

  // ─── Brackets (genérico) ──────────────────────────────
  function renderBracket(containerId, matches, key) {
    const container = document.getElementById(containerId + "-container");
    if (!container) return;

    const data = state[key] || [];
    const resolved = resolveAllMatches(state);

    container.innerHTML = matches.map(m => {
      const pick = data.find(d => d.matchId === m.id);
      const winner = pick ? pick.winner : null;
      const r = resolved[m.id];
      const teamA = r ? r.homeName : (m.label.split(' vs ')[0]);
      const teamB = r ? r.awayName : (m.label.split(' vs ')[1] || '?');

      return `
        <div class="match-card ${winner ? 'picked' : ''}">
          <div class="match-label">P${m.id} ${m.loc ? '· ' + m.loc : ''}</div>
          <div class="match-teams">
            <div class="match-team ${winner === 'A' ? 'winner' : ''}"
                 data-key="${key}" data-match="${m.id}" data-side="A">
              ${teamA}
            </div>
            <div class="match-vs">vs</div>
            <div class="match-team ${winner === 'B' ? 'winner' : ''}"
                 data-key="${key}" data-match="${m.id}" data-side="B">
              ${teamB}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function pickWinner(key, matchId, side) {
    if (!Array.isArray(state[key])) state[key] = [];

    const existing = state[key].find(d => d.matchId === matchId);
    if (existing) {
      existing.winner = side;
    } else {
      state[key].push({ matchId, winner: side });
    }

    // Re-render solo el bracket actual
    const containerMap = {
      r32: "r32", r16: "r16", qf: "qf",
      sf: "sf", third: "third", final: "final",
    };
    const matchMap = {
      r32: R32_MATCHES, r16: R16_MATCHES, qf: QF_MATCHES,
      sf: SF_MATCHES, third: [THIRD_MATCH], final: [FINAL_MATCH],
    };

    // Si es final o third, solo re-render ese bracket
    if (key === "final" || key === "third") {
      renderBracket(containerMap[key], matchMap[key], key);
    } else {
      renderBracket(containerMap[key], matchMap[key], key);
    }
  }

  function saveR32() {
    if (!state.r32 || state.r32.length < 16) {
      alert("Elige un ganador para cada uno de los 16 partidos de dieciseisavos.");
      return;
    }
    saveToLocal();
    goTo("r16");
  }

  function saveR16() {
    if (!state.r16 || state.r16.length < 8) { alert("Completa los 8 partidos de octavos."); return; }
    saveToLocal();
    goTo("qf");
  }

  function saveQF() {
    if (!state.qf || state.qf.length < 4) { alert("Completa los 4 partidos de cuartos."); return; }
    saveToLocal();
    goTo("sf");
  }

  function saveSF() {
    if (!state.sf || state.sf.length < 2) { alert("Completa las 2 semifinales."); return; }
    saveToLocal();
    goTo("third");
  }

  function saveThird() {
    if (!state.third || state.third.length < 1) { alert("Elige el ganador del tercer puesto."); return; }
    saveToLocal();
    goTo("final");
  }

  function saveFinal() {
    if (!state.final || state.final.length < 1) { alert("Elige el ganador de LA FINAL."); return; }

    // Campeón es el ganador de la final
    const finalPick = state.final[0];
    state.champion = finalPick.winner;

    saveToLocal();
    goTo("share");
  }

  // ─── Compartir ────────────────────────────────────────
  function renderShare() {
    document.getElementById("share-username").textContent =
      `¡${state.userName}, tu porra está lista!`;

    const url = encodeToUrl();
    document.getElementById("share-url").textContent = url;

    // Mostrar campeón
    const resolved = resolveAllMatches(state);
    const finalResolved = resolved[104]; // FINAL_MATCH id
    let championName = "?";
    if (finalResolved && state.champion) {
      championName = state.champion === 'A' ? finalResolved.homeName : finalResolved.awayName;
    }
    document.getElementById("champion-name").textContent = championName;

    // Lanzar confeti
    launchConfetti();

    // Resumen
    const summary = document.getElementById("share-summary");
    const groupsOk = state.groups.filter(g => g.order.every(o => o !== null)).length;
    summary.innerHTML = `
      <div class="share-summary-line">
        📋 <strong>${groupsOk}/12 grupos completados</strong>
      </div>
      <div class="share-summary-line">
        🥉 <strong>${state.thirds.filter(t => t._selected).length}/8 mejores terceros</strong>
      </div>
      <div class="share-summary-line">
        ⚽ <strong>Dieciseisavos:</strong> ${(state.r32 || []).length}/16 partidos
      </div>
      <div class="share-summary-line">
        🏟️ <strong>Octavos:</strong> ${(state.r16 || []).length}/8 · 
        <strong>Cuartos:</strong> ${(state.qf || []).length}/4 · 
        <strong>Semis:</strong> ${(state.sf || []).length}/2
      </div>
      <div class="share-summary-line">
        🏆 <strong>Campeón:</strong> ${championName}
        · 🥉 <strong>Tercero:</strong> ${state.third && state.third.length ? 'elegido' : '?'}
      </div>
    `;
  }

  // ─── Guardar en localStorage ─────────────────────────
  function saveToLocal() {
    const toSave = {
      userName: state.userName,
      groups: state.groups,
      thirds: state.thirds,
      r32: state.r32,
      r16: state.r16,
      qf: state.qf,
      sf: state.sf,
      final: state.final,
      third: state.third,
      champion: state.champion,
    };
    try {
      localStorage.setItem("porra_mundial_2026_me", JSON.stringify(toSave));
    } catch (e) { /* quota exceeded, ignore */ }
  }

  function loadFromLocalRaw() {
    try {
      const raw = localStorage.getItem("porra_mundial_2026_me");
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  }

  function loadFromLocal() {
    const data = loadFromLocalRaw();
    if (data) {
      state = { ...state, ...data };
      document.getElementById("input-name").value = state.userName || "";
      return true;
    }
    return false;
  }

  // ─── URL Encoding/Decoding ────────────────────────────
  function encodeToUrl() {
    const payload = {
      n: state.userName,
      o: state.groups.map(g => g.order),  // solo el orden (los equipos son fijos)
      t: state.thirds.map(t => ({ l: t.groupLetter, s: !!t._selected, r: t._rank })),
      r32: (state.r32 || []).map(m => [m.matchId, m.winner]),
      r16: (state.r16 || []).map(m => [m.matchId, m.winner]),
      qf: (state.qf || []).map(m => [m.matchId, m.winner]),
      sf: (state.sf || []).map(m => [m.matchId, m.winner]),
      f: state.final ? state.final.map(m => [m.matchId, m.winner]) : [],
      t3: state.third ? state.third.map(m => [m.matchId, m.winner]) : [],
      c: state.champion,
    };

    const json = JSON.stringify(payload);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const base = window.location.href.split("?")[0];
    return base + "?p=" + encoded;
  }

  function decodeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("p");
    if (!encoded) return null;

    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      const p = JSON.parse(json);

      const groups = createGroupSlots();
      if (p.o && Array.isArray(p.o)) {
        p.o.forEach((order, i) => {
          if (i < groups.length && Array.isArray(order)) {
            groups[i].order = order.map(v => (v !== null && v !== undefined) ? v : null);
          }
        });
      }

      const thirds = groups.map(g => {
        const thirdIdx = g.order[2];
        return {
          groupLetter: g.letter,
          teamName: thirdIdx !== null ? g.pool[thirdIdx] : "",
          _selected: false,
          _rank: null,
        };
      });

      if (p.t && Array.isArray(p.t)) {
        p.t.forEach((t, i) => {
          if (i < thirds.length) {
            thirds[i]._selected = !!t.s;
            thirds[i]._rank = t.r || null;
          }
        });
      }

      function parseMatches(arr) {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.map(m => ({ matchId: m[0], winner: m[1] }));
      }

      return {
        userName: p.n || "",
        groups,
        thirds,
        r32: parseMatches(p.r32),
        r16: parseMatches(p.r16),
        qf: parseMatches(p.qf),
        sf: parseMatches(p.sf),
        final: parseMatches(p.f),
        third: parseMatches(p.t3),
        champion: p.c || null,
      };
    } catch (e) {
      console.error("Error decoding URL:", e);
      return null;
    }
  }

  function copyLink() {
    const url = document.getElementById("share-url").textContent;
    navigator.clipboard.writeText(url).then(() => {
      showToast("¡Enlace copiado!");
      document.getElementById("copy-confirm").textContent = "✅ ¡Copiado! Compártelo por WhatsApp, Telegram...";
    }).catch(() => {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("¡Enlace copiado!");
    });

    saveToLocal();
  }

  // ─── Comparar ─────────────────────────────────────────
  function showCompare() {
    goTo("compare");
    renderCompareList();
  }

  function addFriend() {
    const input = document.getElementById("input-friend-link");
    const raw = input.value.trim();
    if (!raw) return;

    // Extraer parámetro p=
    let encoded;
    try {
      const url = new URL(raw);
      encoded = url.searchParams.get("p");
    } catch {
      // Quizá es solo el parámetro
      if (raw.startsWith("p=")) {
        encoded = raw.substring(2);
      } else {
        encoded = raw;
      }
    }

    if (!encoded) {
      alert("No se ha podido leer el enlace. Asegúrate de que es un enlace válido.");
      return;
    }

    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      const p = JSON.parse(json);

      // Ver si ya existe
      if (compareList.find(c => c.userName === p.n)) {
        alert(`${p.n} ya está en la lista.`);
        input.value = "";
        return;
      }

      compareList.push({ userName: p.n, raw: encoded, data: p });
      saveCompareList();
      renderCompareList();
      input.value = "";
      showToast(`¡${p.n} añadido!`);
    } catch (e) {
      alert("Enlace inválido. Asegúrate de copiarlo completo.");
    }
  }

  function removeFriend(idx) {
    compareList.splice(idx, 1);
    saveCompareList();
    renderCompareList();
  }

  function saveCompareList() {
    try {
      localStorage.setItem("porra_mundial_2026_friends", JSON.stringify(compareList.map(c => ({
        userName: c.userName, raw: c.raw
      }))));
    } catch (e) { /* ignore */ }
  }

  function loadCompareList() {
    try {
      const raw = localStorage.getItem("porra_mundial_2026_friends");
      if (raw) {
        const arr = JSON.parse(raw);
        compareList = arr.map(c => {
          try {
            const encoded = c.raw;
            const json = decodeURIComponent(escape(atob(encoded)));
            return { userName: c.userName, raw: c.raw, data: JSON.parse(json) };
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      }
    } catch (e) { /* ignore */ }
  }

  function renderCompareList() {
    const container = document.getElementById("friends-list");
    if (!container) return;

    if (compareList.length === 0) {
      container.innerHTML = '<p class="empty-msg">Todavía no has añadido a nadie. Pega un enlace arriba.</p>';
    } else {
      container.innerHTML = compareList.map((c, i) => `
        <div class="friend-item">
          <span class="friend-name">👤 ${escHtml(c.userName)}</span>
          <button class="btn btn-small btn-danger" onclick="App.removeFriend(${i})">🗑️</button>
        </div>
      `).join("");
    }

    renderComparison();
  }

  function renderComparison() {
    const container = document.getElementById("compare-results");
    const championsDiv = document.getElementById("champions-compare");
    const fullDiv = document.getElementById("full-compare");

    if (!container || compareList.length === 0) {
      if (container) container.style.display = "none";
      return;
    }

    container.style.display = "block";

    // Campeones
    championsDiv.innerHTML = compareList.map(c => {
      const state = friendToState(c.data);
      const res = resolveAllMatches(state);
      const finalR = res[104];
      const champName = finalR ? (c.data.c === 'A' ? finalR.homeName : finalR.awayName) : '?';
      return `<span class="champion-badge">
        🏆 <span class="name">${champName}</span>
        <span class="user">(${escHtml(c.userName)})</span>
      </span>`;
    }).join("");

    // Desglose completo por amigo
    fullDiv.innerHTML = compareList.map(c => {
      const state = friendToState(c.data);
      const res = resolveAllMatches(state);
      const d = c.data;
      const groupsOk = (d.o || []).filter(o => Array.isArray(o) && o.every(v => v !== null)).length;

      function pickIcon(matches, matchId) {
        const p = (matches || []).find(m => m[0] === matchId);
        return p ? (p[1] === 'A' ? '🅰️' : '🅱️') : '⬜';
      }

      function renderMatchLabel(matchDef, matches) {
        const r = res[matchDef.id];
        const home = r ? r.homeName : '?';
        const away = r ? r.awayName : '?';
        const icon = pickIcon(matches, matchDef.id);
        return `${icon} ${home} vs ${away}`;
      }

      // Agrupar picks por ronda
      const r32Picks = renderRoundLines(R32_MATCHES, d.r32, res, pickIcon);
      const r16Picks = renderRoundLines(R16_MATCHES, d.r16, res, pickIcon);
      const qfPicks = renderRoundLines(QF_MATCHES, d.qf, res, pickIcon);
      const sfPicks = renderRoundLines(SF_MATCHES, d.sf, res, pickIcon);
      const thirdPick = renderRoundLines([THIRD_MATCH], d.t3, res, pickIcon);
      const finalPick = renderRoundLines([FINAL_MATCH], d.f, res, pickIcon);

      // Grupos
      let groupsHtml = "";
      if (d.o) {
        groupsHtml = GROUPS.map((letter, gi) => {
          const order = d.o[gi] || [];
          const teams = WORLD_CUP_GROUPS[letter];
          const ranked = order.map(idx => idx !== null ? teams[idx] : '?');
          return `<div class="cmp-group-line">${letter}: ${ranked.map((t,i)=>`<span class="cmp-pos pos-${i+1}">${i+1}º</span> ${getFlag(t)} ${t}`).join(' · ')}</div>`;
        }).join("");
      }

      // Terceros
      let thirdsHtml = "";
      if (d.t) {
        const rankedThirds = d.t
          .map((t, i) => ({ ...t, letter: GROUPS[i] }))
          .filter(t => t.s)
          .sort((a, b) => (a.r || 99) - (b.r || 99));
        thirdsHtml = rankedThirds.map(t => {
          const teamIdx = (d.o[t.letter.charCodeAt(0)-65] || [])[2];
          const name = teamIdx !== null && teamIdx !== undefined ? WORLD_CUP_GROUPS[t.letter][teamIdx] : '?';
          return `<span class="cmp-third-badge">${t.r}º ${getFlag(name)} ${name}</span>`;
        }).join(" ");
      }

      return `
        <div class="card cmp-friend-card">
          <h4>👤 ${escHtml(c.userName)}</h4>
          <details class="cmp-section">
            <summary>📋 Grupos (${groupsOk}/12)</summary>
            <div class="cmp-groups">${groupsHtml}</div>
          </details>
          <details class="cmp-section">
            <summary>🥉 Mejores terceros</summary>
            <div class="cmp-thirds">${thirdsHtml || 'No seleccionados'}</div>
          </details>
          <details class="cmp-section">
            <summary>⚽ Dieciseisavos (${(d.r32||[]).length}/16)</summary>
            <div class="cmp-round">${r32Picks}</div>
          </details>
          <details class="cmp-section">
            <summary>🏟️ Octavos (${(d.r16||[]).length}/8)</summary>
            <div class="cmp-round">${r16Picks}</div>
          </details>
          <details class="cmp-section">
            <summary>🏟️ Cuartos (${(d.qf||[]).length}/4)</summary>
            <div class="cmp-round">${qfPicks}</div>
          </details>
          <details class="cmp-section">
            <summary>🏟️ Semifinales (${(d.sf||[]).length}/2)</summary>
            <div class="cmp-round">${sfPicks}</div>
          </details>
          <details class="cmp-section">
            <summary>🥉 Tercer puesto</summary>
            <div class="cmp-round">${thirdPick}</div>
          </details>
          <details class="cmp-section">
            <summary>🏆 FINAL</summary>
            <div class="cmp-round">${finalPick}</div>
          </details>
        </div>
      `;
    }).join("");
  }

  // ─── Helpers para comparación ─────────────────────────
  function friendToState(data) {
    const groups = createGroupSlots();
    if (data.o) {
      data.o.forEach((order, i) => {
        if (i < groups.length && Array.isArray(order)) {
          groups[i].order = order.map(v => (v !== null && v !== undefined) ? v : null);
        }
      });
    }
    const thirds = groups.map((g, i) => {
      const thirdIdx = g.order[2];
      const t = (data.t && data.t[i]) ? data.t[i] : {};
      return {
        groupLetter: g.letter,
        teamName: thirdIdx !== null ? g.pool[thirdIdx] : "",
        _selected: !!t.s,
        _rank: t.r || null,
      };
    });
    function pm(arr) {
      if (!arr || !Array.isArray(arr)) return [];
      return arr.map(m => ({ matchId: m[0], winner: m[1] }));
    }
    return {
      groups, thirds,
      r32: pm(data.r32), r16: pm(data.r16), qf: pm(data.qf), sf: pm(data.sf),
      final: pm(data.f), third: pm(data.t3),
    };
  }

  function renderRoundLines(matchDefs, picks, resolved, pickIcon) {
    return matchDefs.map(m => {
      const r = resolved[m.id];
      const icon = pickIcon(picks, m.id);
      const home = r ? r.homeName : '?';
      const away = r ? r.awayName : '?';
      return `<div class="cmp-match-line">${icon} <span class="cmp-teams">${home} vs ${away}</span></div>`;
    }).join("");
  }

  // ─── Resultados Reales ────────────────────────────────
  function showResultsEntry() {
    goTo("results");
    renderScores();
  }

  function renderScores() {
    const scoresBody = document.getElementById("scores-body");
    const scoresTable = document.getElementById("scores-table");
    const realChamp = document.getElementById("real-champion").value.trim();

    if (!realChamp || compareList.length === 0) {
      if (scoresTable) scoresTable.style.display = "none";
      return;
    }

    if (scoresTable) scoresTable.style.display = "block";

    // Calcular puntuaciones (por ahora solo campeón)
    const scores = compareList.map(c => {
      let points = 0;
      const champ = c.data.c;

      // Punto por acertar campeón (simplificado: lado de la final)
      // En una versión completa, se compararía con nombres reales
      points += 10; // placeholder

      return { name: c.userName, champion: champ, points };
    });

    scores.sort((a, b) => b.points - a.points);

    scoresBody.innerHTML = scores.map((s, i) => `
      <tr class="${i === 0 ? 'highlight' : ''}">
        <td><span class="${i === 0 ? 'rank-1' : ''}">${i === 0 ? '👑' : ''} ${escHtml(s.name)}</span></td>
        <td>Lado ${s.champion || '?'}</td>
        <td><strong>${s.points}</strong> pts</td>
      </tr>
    `).join("");
  }

  // Escuchar cambios en campeón real
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("real-champion");
    if (input) {
      input.addEventListener("input", renderScores);
    }
  });

  // ─── Event delegation para clicks en bracket (móvil-friendly) ──
  document.addEventListener("click", (e) => {
    // Click en equipo del bracket
    const team = e.target.closest(".match-team");
    if (team) {
      const key = team.dataset.key;
      const matchId = parseInt(team.dataset.match);
      const side = team.dataset.side;
      if (key && matchId && side) {
        e.preventDefault();
        pickWinner(key, matchId, side);
        return;
      }
    }
    // Click en tercero
    const third = e.target.closest(".third-item");
    if (third) {
      const idx = parseInt(third.dataset.idx);
      if (!isNaN(idx)) {
        e.preventDefault();
        toggleThird(idx);
        return;
      }
    }
  });

  // ─── Utilidades ────────────────────────────────────────
  function escHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function shakeInput(id) {
    const el = document.getElementById(id);
    el.style.borderColor = "var(--danger)";
    el.focus();
    setTimeout(() => { el.style.borderColor = ""; }, 1500);
  }

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove("show"), 2000);
  }

  // ─── Confeti ──────────────────────────────────────────
  function launchConfetti() {
    const container = document.getElementById("confetti-container");
    const colors = ["#fbbf24","#ef4444","#3b82f6","#22c55e","#a855f7","#f97316","#ec4899","#06b6d4"];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (1.5 + Math.random() * 2.5) + "s";
      piece.style.animationDelay = Math.random() * 1.5 + "s";
      piece.style.width = (6 + Math.random() * 8) + "px";
      piece.style.height = (6 + Math.random() * 8) + "px";
      frag.appendChild(piece);
    }
    container.innerHTML = "";
    container.appendChild(frag);
    // Limpiar después de la animación
    setTimeout(() => { container.innerHTML = ""; }, 4500);
  }

  // ─── Inicialización ──────────────────────────────────
  function init() {
    // Intentar cargar del localStorage
    loadCompareList();
    loadFriendBets();
    const hasLocal = loadFromLocal();

    if (hasLocal) {
      document.getElementById("input-name").value = state.userName || "";
    }

    // Si se abre un enlace compartido (?p=...), añadirlo a comparación
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("p");
    if (encoded) {
      try {
        const json = decodeURIComponent(escape(atob(encoded)));
        const data = JSON.parse(json);
        // Añadir automáticamente a la lista de comparación si no existe
        if (!compareList.find(c => c.userName === data.n)) {
          compareList.push({ userName: data.n, raw: encoded, data });
          saveCompareList();
        }
      } catch (e) { /* ignorar enlaces inválidos */ }
    }

    renderCompareList();
  }

  document.addEventListener("DOMContentLoaded", init);

  // ─── Apuestas ─────────────────────────────────────────
  function showBets() {
    goTo("bets");
    renderBets();
  }

  function getTodayRange() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomStr = tomorrow.toISOString().slice(0, 10);
    return { today, tomorrow: tomStr };
  }

  function loadBets() {
    try {
      const raw = localStorage.getItem("porra_mundial_2026_bets");
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function saveBet(matchId, homeBet, awayBet) {
    const bets = loadBets();
    bets[matchId] = { home: homeBet, away: awayBet };
    try {
      localStorage.setItem("porra_mundial_2026_bets", JSON.stringify(bets));
    } catch (e) { /* ignore */ }
  }

  function renderBets() {
    const container = document.getElementById("bets-container");
    const rangeLabel = document.getElementById("bets-date-range");
    if (!container) return;

    const { today, tomorrow } = getTodayRange();
    rangeLabel.textContent = `Partidos del ${formatDate(today)} y ${formatDate(tomorrow)}`;

    const matches = getMatchesBetween(today, tomorrow);
    const bets = loadBets();
    const friendBets = loadFriendBets();

    if (matches.length === 0) {
      container.innerHTML = '<div class="bets-none">🏟️ No hay partidos hoy ni mañana.<br>¡Vuelve cuando empiece la jornada!</div>';
      return;
    }

    container.innerHTML = matches.map(m => {
      const isPlayed = m.homeScore !== undefined && m.awayScore !== undefined;
      const bet = bets[m.id];
      const isSaved = bet && !isPlayed;
      const flagH = getFlag(m.home);
      const flagA = getFlag(m.away);

      // Apuestas de amigos para este partido
      let friendsHtml = "";
      const friendsForMatch = friendBets.filter(fb => fb.data && fb.data[m.id]);
      if (friendsForMatch.length > 0) {
        friendsHtml = `
          <div class="bet-friends">
            ${friendsForMatch.map(fb => {
              const b = fb.data[m.id];
              return `<span class="bet-friend-badge">👤 ${escHtml(fb.userName)}: <strong>${b.home}-${b.away}</strong></span>`;
            }).join("")}
          </div>`;
      }

      if (isPlayed) {
        return `
          <div class="bet-card played">
            <div class="bet-card-header">
              <span class="bet-time">${m.time}</span>
              <span class="bet-group">Grupo ${m.group}</span>
              <span style="margin-left:auto;font-size:11px;color:var(--text-muted)">Jugado</span>
            </div>
            <div class="bet-teams">
              <span class="bet-team-name">${flagH} ${m.home}</span>
              <span class="bet-vs-text">vs</span>
              <span class="bet-team-name">${flagA} ${m.away}</span>
            </div>
            <div class="bet-result">Resultado: ${m.homeScore} - ${m.awayScore}</div>
            ${friendsHtml}
          </div>`;
      }

      return `
        <div class="bet-card ${isSaved ? 'saved' : ''}" id="bet-${m.id}">
          <div class="bet-card-header">
            <span class="bet-time">${m.time}</span>
            <span class="bet-group">Grupo ${m.group}</span>
            <span style="margin-left:auto;font-size:11px">${formatDate(m.date)}</span>
          </div>
          <div class="bet-teams">
            <span class="bet-team-name">${flagH} ${m.home}</span>
            <span class="bet-vs-text">vs</span>
            <span class="bet-team-name">${flagA} ${m.away}</span>
          </div>
          <div class="bet-score-row">
            <input type="number" class="bet-score-input" id="bet-h-${m.id}" min="0" max="20"
                   value="${bet ? bet.home : ''}" placeholder="-" inputmode="numeric" pattern="[0-9]*">
            <span class="bet-score-dash">-</span>
            <input type="number" class="bet-score-input" id="bet-a-${m.id}" min="0" max="20"
                   value="${bet ? bet.away : ''}" placeholder="-" inputmode="numeric" pattern="[0-9]*">
          </div>
          <button class="btn btn-primary bet-save-btn" onclick="App.saveBetClick(${m.id})">
            ${isSaved ? '✅ Apuesta guardada' : '💾 Guardar apuesta'}
          </button>
          ${friendsHtml}
        </div>`;
    }).join("");
  }

  function saveBetClick(matchId) {
    const hInput = document.getElementById("bet-h-" + matchId);
    const aInput = document.getElementById("bet-a-" + matchId);
    const hVal = parseInt(hInput.value);
    const aVal = parseInt(aInput.value);
    if (isNaN(hVal) || isNaN(aVal)) {
      alert("Introduce los dos marcadores (ej: 2-1)");
      return;
    }
    saveBet(matchId, hVal, aVal);
    renderBets();
    showToast("¡Apuesta guardada!");
  }

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split("-");
    const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    return `${parseInt(d)} ${months[parseInt(m)-1]}`;
  }

  // ─── Compartir apuestas con amigos ────────────────────
  let friendBetList = [];

  function loadFriendBets() {
    try {
      const raw = localStorage.getItem("porra_mundial_2026_friend_bets");
      if (raw) friendBetList = JSON.parse(raw);
    } catch (e) { friendBetList = []; }
    return friendBetList;
  }

  function saveFriendBets() {
    try {
      localStorage.setItem("porra_mundial_2026_friend_bets", JSON.stringify(friendBetList));
    } catch (e) { /* ignore */ }
  }

  function copyBetLink() {
    const name = document.getElementById("input-name").value.trim() || "Anónimo";
    const bets = loadBets();
    const payload = { n: name, b: bets };
    const json = JSON.stringify(payload);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const base = window.location.href.split("?")[0];
    const url = base + "?bet=" + encoded;

    navigator.clipboard.writeText(url).then(() => {
      showToast("¡Enlace de apuestas copiado!");
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("¡Enlace copiado!");
    });
  }

  function addFriendBet() {
    const input = document.getElementById("input-friend-bet-link");
    const raw = input.value.trim();
    if (!raw) return;

    let encoded;
    try {
      const url = new URL(raw);
      encoded = url.searchParams.get("bet");
    } catch {
      if (raw.startsWith("bet=")) encoded = raw.substring(4);
      else encoded = raw;
    }

    if (!encoded) {
      alert("Enlace inválido. Usa el enlace generado con 'Copiar enlace de MIS apuestas'.");
      return;
    }

    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      const data = JSON.parse(json);

      if (friendBetList.find(f => f.userName === data.n)) {
        alert(`${data.n} ya está en la lista.`);
        input.value = "";
        return;
      }

      friendBetList.push({ userName: data.n, raw: encoded, data: data.b });
      saveFriendBets();
      renderBets();
      input.value = "";
      showToast(`¡Apuestas de ${data.n} añadidas!`);
    } catch (e) {
      alert("Enlace inválido.");
    }
  }

  // ─── API Pública ──────────────────────────────────────
  return {
    goTo,
    startNew,
    setTeamOrder,
    saveGroups,
    toggleThird,
    saveThirds,
    pickWinner,
    saveR32,
    saveR16,
    saveQF,
    saveSF,
    saveThird,
    saveFinal,
    copyLink,
    showCompare,
    addFriend,
    removeFriend,
    showResultsEntry,
    showBets,
    saveBetClick,
    copyBetLink,
    addFriendBet,
  };
})();
