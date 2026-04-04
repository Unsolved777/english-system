// calculations — depends on: constants
function calcXP(sessions, ankiXP) {
  const sessionsXP = sessions.reduce((s, x) => s + (x.xp || SESSION_XP[x.type] || 0), 0);
  return sessionsXP + (ankiXP || 0);
}

function sessionsOnlyXP(sessions) {
  return sessions.reduce((s, x) => s + (x.xp || SESSION_XP[x.type] || 0), 0);
}

function calcStreak(habitDays) {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    if (habitDays[k]) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function gapColor(pct) {
  if (pct < 40) return '#ef4444';
  if (pct < 60) return '#f97316';
  if (pct < 75) return '#eab308';
  return '#22c55e';
}

function escapeHtml(s) {
  if (s == null || s === '') return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
