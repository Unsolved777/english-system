// render — depends on: constants, achievements, calculations

/** Progress tab: career, calendar, sessions, achievements, gaps, Anki stats, exercise buttons. */
function renderProgressTab(state) {
  renderCareerLevel(state);
  renderHabitCalendar(state);
  renderSessionLog(state);
  renderAchievements(state);
  renderGapProgress(state);
  renderAnkiStats(state);
  renderExerciseTrackers(state);
}

function renderCareerLevel(state) {
  const xp = calcXP(state.sessions, state.ankiXP || 0);
  const sXP = sessionsOnlyXP(state.sessions);
  const aXP = state.ankiXP || 0;
  const idx = CAREER_LEVELS.reduce((best, l, i) => (xp >= l.xpMin ? i : best), 0);
  const level = CAREER_LEVELS[idx];
  const next = CAREER_LEVELS[idx + 1];

  const stagesEl = document.getElementById('career-stages');
  if (stagesEl) {
    stagesEl.innerHTML = CAREER_LEVELS.map((l, i) => {
      const cls = i < idx ? 'done' : i === idx ? 'current' : '';
      return `<div class="career-stage ${cls}"><span class="stage-icon">${l.icon}</span><span class="stage-label">${l.name}</span></div>`;
    }).join('');
  }

  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  const setHTML = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = v;
  };
  set('xp-total', xp);
  set('level-name', level.name);
  set('xp-next-label', next ? `${next.xpMin - xp} XP to ${next.name}` : '🏆 Max level reached!');

  setHTML(
    'xp-sublabel',
    `Career XP · <span style="color:#a78bfa">${level.name}</span>
    <span class="anki-xp-pill sessions" style="margin-left:8px">📝 Sessions: ${sXP}</span>
    <span class="anki-xp-pill anki-reviews">🃏 Anki: ${aXP}</span>`
  );

  const bar = document.getElementById('xp-bar');
  if (bar) {
    const pct = next ? ((xp - level.xpMin) / (next.xpMin - level.xpMin)) * 100 : 100;
    bar.style.width = Math.min(100, pct) + '%';
  }
}

function renderHabitCalendar(state) {
  const wrap = document.getElementById('habit-calendar');
  if (!wrap) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const start = new Date(CAL_START);
  const startDow = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - startDow);

  const endSunday = new Date(today);
  const endDow = (today.getDay() + 6) % 7;
  endSunday.setDate(today.getDate() + (6 - endDow));

  const numWeeks = Math.max(4, Math.ceil((endSunday - start) / (7 * 24 * 3600 * 1000)));

  const monthRow = document.getElementById('habit-month-row');
  let monthHtml = '';
  let lastMonth = -1;

  let calHtml = '';
  for (let w = 0; w < numWeeks; w++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + w * 7);
    const wMonth = weekStart.getMonth();

    if (wMonth !== lastMonth) {
      monthHtml += `<div class="habit-month-label" style="width:${18 + 3}px">${MONTHS[wMonth]}</div>`;
      lastMonth = wMonth;
    } else {
      monthHtml += `<div style="width:${18 + 3}px"></div>`;
    }

    calHtml += '<div class="habit-week-col">';
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const ds = date.toISOString().slice(0, 10);
      const future = date > today;
      const isToday = ds === todayStr;
      const level = state.habitDays[ds] || 0;

      let cls = 'habit-day-cell';
      if (future) cls += ' future';
      if (isToday) cls += ' today';

      const lvAttr = level ? ` data-level="${level}"` : '';
      const dataDate = ` data-date="${ds}"`;
      const click = future ? '' : ` onclick="toggleHabitDay('${ds}')"`;
      calHtml += `<div class="${cls}"${lvAttr}${dataDate}${click}><span class="day-num">${date.getDate()}</span></div>`;
    }
    calHtml += '</div>';
  }

  if (monthRow) monthRow.innerHTML = '<div style="width:28px;flex-shrink:0"></div>' + monthHtml;
  wrap.innerHTML = calHtml;

  initCalendarTooltip();

  const streak = calcStreak(state.habitDays);
  const total = Object.keys(state.habitDays).filter(d => d >= CAL_START_STR).length;
  const sessionsFromStart = state.sessions.filter(s => s.date >= CAL_START_STR).length;
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  set('streak-current', streak);
  set('streak-total', total);
  set('streak-sessions', sessionsFromStart);
}

function initCalendarTooltip() {
  const tooltip = document.getElementById('habit-tooltip');
  if (!tooltip) return;

  const calWrap = document.querySelector('.habit-calendar-wrap');
  if (!calWrap || calWrap._tooltipInit) return;
  calWrap._tooltipInit = true;

  calWrap.addEventListener('mousemove', e => {
    const cell = e.target.closest('.habit-day-cell');
    if (!cell || cell.classList.contains('future')) {
      tooltip.style.display = 'none';
      return;
    }
    const ds = cell.dataset.date;
    const level = parseInt(cell.dataset.level || '0', 10);
    const info = LEVEL_INFO[level];

    if (!ds) return;

    const date = new Date(ds + 'T00:00:00');
    const dayName = DAYS_FULL[(date.getDay() + 6) % 7];
    const dateLabel = `${dayName}, ${MONTHS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
    const isToday = ds === new Date().toISOString().slice(0, 10);

    tooltip.innerHTML = `
      <div class="tt-date">${dateLabel}${isToday ? ' · <span style="color:#60a5fa">today</span>' : ''}</div>
      <div class="tt-level" style="color:${info.color}">${level > 0 ? '●' : '○'} ${info.name}</div>
      <div class="tt-desc">${info.desc}</div>
      <div class="tt-hint">Click to cycle level (${level} → ${level < 4 ? level + 1 : 0})</div>`;

    const x = e.clientX + 14;
    const y = e.clientY - 10;
    const tw = 220;
    tooltip.style.left = (x + tw > window.innerWidth ? e.clientX - tw - 14 : x) + 'px';
    tooltip.style.top = Math.min(y, window.innerHeight - 160) + 'px';
    tooltip.style.display = 'block';
  });

  calWrap.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
}

function renderSessionLog(state) {
  const list = document.getElementById('session-log-list');
  if (!list) return;
  const sorted = [...state.sessions].sort((a, b) => b.date.localeCompare(a.date));
  if (!sorted.length) {
    list.innerHTML = '<p style="color:#64748b;font-size:14px;padding:12px">No sessions yet.</p>';
    return;
  }
  list.innerHTML = sorted
    .map(s => {
      const typeLabel = SESSION_LABELS[s.type] || s.type;
      const xp = s.xp || SESSION_XP[s.type] || 0;
      const safeLabel = escapeHtml(s.label);
      return `<div class="session-entry">
      <span class="session-entry-date">${escapeHtml(s.date)}</span>
      <div class="session-entry-body">
        <span class="session-type-tag ${escapeHtml(s.type)}">${escapeHtml(typeLabel)}</span>
        <span class="session-entry-title">${safeLabel}</span>
      </div>
      <span class="session-entry-xp">+${xp} XP</span>
      <span class="session-entry-del" onclick="deleteSession(${s.id})" title="Remove">×</span>
    </div>`;
    })
    .join('');
}

function renderAchievements(state) {
  const grid = document.getElementById('achievements-grid');
  if (!grid) return;
  grid.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = a.check(state);
    return `<div class="ach-card ${unlocked ? 'unlocked' : 'locked'}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-name">${escapeHtml(a.name)}</div>
      <div class="ach-desc">${escapeHtml(a.desc)}</div>
    </div>`;
  }).join('');
}

function renderGapProgress(state) {
  ['vocab', 'fluency', 'conditionals', 'meeting', 'director'].forEach(k => {
    const pct = state.gapProgress[k] || 0;
    const bar = document.getElementById(`gap-bar-${k}`);
    const pctEl = document.getElementById(`gap-pct-${k}`);
    if (bar) {
      bar.style.width = pct + '%';
      bar.style.background = gapColor(pct);
    }
    if (pctEl) pctEl.textContent = pct + '%';
  });
}

function renderExerciseTrackers(state) {
  const today = new Date().toISOString().slice(0, 10);
  EXERCISES.forEach(ex => {
    const lastEl = document.getElementById(`ex-last-${ex.id}`);
    const btn = document.getElementById(`ex-btn-${ex.id}`);
    if (!lastEl) return;
    const last = state.exerciseDone?.[ex.id];
    if (last) {
      const diff = Math.round((new Date(today) - new Date(last)) / 86400000);
      lastEl.textContent = diff === 0 ? '✓ today' : diff === 1 ? 'yesterday' : `${diff}d ago`;
      if (btn) {
        btn.className = last === today ? 'btn-mark-done done-today' : 'btn-mark-done';
        btn.textContent = last === today ? '✓ Done!' : 'Mark done today';
      }
    } else {
      lastEl.textContent = 'never';
      if (btn) {
        btn.className = 'btn-mark-done';
        btn.textContent = 'Mark done today';
      }
    }
  });
}

/** Build exercise cards from EXERCISES (single source of truth). */
function renderExerciseBank() {
  const mount = document.getElementById('exercise-cards-mount');
  if (!mount) return;
  mount.innerHTML = EXERCISES.map(
    ex => `
      <div class="exercise-card">
        <h4>${escapeHtml(ex.title)} <span class="ex-tag ${escapeHtml(ex.exTag)}">${escapeHtml(ex.exTagLabel || ex.exTag)}</span></h4>
        <p>${ex.bodyHtml}</p>
        <div class="exercise-tracker-row">
          <span class="exercise-tracker-label">Last done: <span id="ex-last-${escapeHtml(ex.id)}" class="ex-last-date">never</span></span>
          <button type="button" id="ex-btn-${escapeHtml(ex.id)}" class="btn-mark-done" data-exercise-id="${escapeHtml(ex.id)}">Mark done today</button>
        </div>
      </div>`
  ).join('');
}

function renderAnkiStats(state) {
  const s = state.ankiStats;
  const setHTML = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = v;
  };
  if (!s) return;
  if (s.deckInfo) {
    setHTML('anki-stat-total', s.deckInfo.total);
    setHTML('anki-stat-new', s.deckInfo.newCount);
    setHTML('anki-stat-due', s.deckInfo.due);
  }
  setHTML('anki-stat-reviews', s.totalReviews || 0);
  setHTML('anki-stat-learned', s.learnedCount || 0);
  setHTML('anki-stat-xp', `+${state.ankiXP || 0}`);
  if (s.lastSync) {
    const el = document.getElementById('anki-last-sync');
    if (el && !el.textContent.includes('⚠')) {
      el.textContent = `Last synced: ${new Date(s.lastSync).toLocaleString()}`;
    }
  }
}
