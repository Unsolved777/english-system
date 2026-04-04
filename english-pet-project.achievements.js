// achievements — depends on: calculations
const ACHIEVEMENTS = [
  { id: 'pipeline', icon: '🏗️', name: 'Pipeline Architect', desc: 'Built your AI learning stack', check: s => s.sessions.some(x => x.type === 'setup') },
  { id: 'kindle', icon: '📚', name: 'Kindle Scholar', desc: 'Pushed first highlights to Anki', check: s => s.sessions.some(x => x.type === 'kindle') },
  { id: 'transcript', icon: '🎙️', name: 'Evidence-Based', desc: 'Analyzed a real meeting transcript', check: s => s.sessions.some(x => x.type === 'transcript') },
  { id: 'sessions5', icon: '📈', name: 'Getting Started', desc: '5+ sessions logged', check: s => s.sessions.length >= 5 },
  { id: 'sessions15', icon: '⚡', name: 'Into the Habit', desc: '15+ sessions logged', check: s => s.sessions.length >= 15 },
  { id: 'streak7', icon: '🔥', name: 'Consistency Wins', desc: '7+ active days in a row', check: s => calcStreak(s.habitDays) >= 7 },
  { id: 'c1cand', icon: '🎯', name: 'C1 Candidate', desc: 'Reached 450+ Career XP', check: s => calcXP(s.sessions, s.ankiXP) >= 450 },
  { id: 'director', icon: '🏆', name: 'Director English', desc: 'Reached C1+ Director level', check: s => calcXP(s.sessions, s.ankiXP) >= 1100 },
];
