// app — entry point, depends on all other modules (loaded via script tags)

function showTab(name, btn) {
  const pane = document.getElementById('tab-' + name);
  if (!pane) return;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  pane.classList.add('active');
  if (btn) btn.classList.add('active');
  if (name === 'progress') renderProgressTab(getState());
  if (name === 'exercises') renderExerciseTrackers(getState());
  if (name === 'gaps') {
    initTopicBoardDnD();
    renderTopicBoard(getState());
  }
}

function initNavTabs() {
  const nav = document.querySelector('.nav');
  if (!nav || nav._tabsInit) return;
  nav._tabsInit = true;
  nav.addEventListener('click', e => {
    const btn = e.target.closest('.nav-btn[data-tab]');
    if (!btn) return;
    e.preventDefault();
    showTab(btn.dataset.tab, btn);
  });
}

function toggleHabitDay(ds) {
  const state = getState();
  const cur = state.habitDays[ds] || 0;
  if (cur >= 4) delete state.habitDays[ds];
  else state.habitDays[ds] = cur + 1;
  saveState(state);
  renderHabitCalendar(state);
}

function addSession() {
  const type = document.getElementById('new-session-type')?.value;
  const date = document.getElementById('new-session-date')?.value;
  const label = document.getElementById('new-session-label')?.value.trim();
  if (!type || !date || !label) {
    alert('Please fill in all fields');
    return;
  }
  const state = getState();
  state.sessions.push({ id: state.nextId++, type, date, label, xp: SESSION_XP[type] || 10 });
  state.habitDays[date] = Math.max(state.habitDays[date] || 0, 3);
  saveState(state);
  document.getElementById('new-session-label').value = '';
  renderProgressTab(getState());
}

function deleteSession(id) {
  if (!confirm('Remove this session from the log?')) return;
  const state = getState();
  state.sessions = state.sessions.filter(s => s.id !== id);
  saveState(state);
  renderProgressTab(getState());
}

function updateGap(key, delta) {
  const state = getState();
  state.gapProgress[key] = Math.max(0, Math.min(100, (state.gapProgress[key] || 0) + delta));
  saveState(state);
  renderGapProgress(state);
}

function markExerciseDone(exId) {
  const ex = EXERCISES.find(e => e.id === exId);
  if (!ex) return;
  const state = getState();
  const today = new Date().toISOString().slice(0, 10);
  if (!state.exerciseDone) state.exerciseDone = {};
  state.exerciseDone[exId] = today;
  state.habitDays[today] = Math.max(state.habitDays[today] || 0, 2);
  state.sessions.push({
    id: state.nextId++,
    type: ex.sessionType,
    date: today,
    label: ex.sessionLabel,
    xp: SESSION_XP[ex.sessionType] || 10,
  });
  saveState(state);
  renderProgressTab(getState());
}

document.addEventListener('DOMContentLoaded', () => {
  initNavTabs();
  const dateEl = document.getElementById('new-session-date');
  if (dateEl) dateEl.value = new Date().toISOString().slice(0, 10);
  renderExerciseBank();
  renderExerciseTrackers(getState());
  initTopicBoardDnD();

  document.getElementById('exercise-cards-mount')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-exercise-id]');
    if (!btn) return;
    markExerciseDone(btn.dataset.exerciseId);
  });
});
