// state — depends on: constants
function defaultState() {
  return {
    sessions: [
      { id: 1, type: 'transcript', date: '2026-04-01', label: 'Transcript analysis: Integration Landscape Deep Dive', xp: 15 },
      { id: 2, type: 'speaking', date: '2026-04-02', label: 'Progress dashboard — first tracking session', xp: 30 },
    ],
    habitDays: {
      '2026-04-01': 3,
      '2026-04-02': 2,
    },
    gapProgress: { vocab: 30, fluency: 50, conditionals: 45, meeting: 40, director: 35 },
    focusTopicIds: [],
    customTopics: [],
    exerciseDone: {},
    ankiXP: 0,
    ankiStats: null,
    nextId: 3,
  };
}

function normalizeTopicState(raw) {
  const d = defaultState();
  const s = { ...d, ...raw };
  if (!Array.isArray(s.focusTopicIds)) s.focusTopicIds = [];
  if (!Array.isArray(s.customTopics)) s.customTopics = [];
  const seen = new Set();
  s.focusTopicIds = s.focusTopicIds.filter(id => {
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const valid = new Set(C1_TOPICS.map(t => t.id));
  (s.customTopics || []).forEach(t => {
    if (t && t.id) valid.add(t.id);
  });
  s.focusTopicIds = s.focusTopicIds.filter(id => valid.has(id));
  return s;
}

function getState() {
  try {
    const raw = JSON.parse(localStorage.getItem(ENG_KEY));
    if (!raw) return defaultState();
    return normalizeTopicState(raw);
  } catch (e) {
    return defaultState();
  }
}

function saveState(s) {
  localStorage.setItem(ENG_KEY, JSON.stringify(s));
}
