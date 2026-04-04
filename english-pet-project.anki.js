// anki — depends on: state, render

async function ankiRequest(action, params = {}) {
  let res;
  try {
    res = await fetch('http://localhost:8765', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, version: 6, params }),
    });
  } catch (fetchErr) {
    const msg = fetchErr.message || String(fetchErr);
    if (msg.includes('CORS') || msg.includes('cross') || msg.includes('blocked')) {
      throw new Error('CORS_BLOCKED');
    }
    throw new Error('ANKI_NOT_OPEN');
  }
  if (!res.ok) throw new Error('ANKI_NOT_OPEN');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

async function syncWithAnki() {
  const btn = document.getElementById('anki-sync-btn');
  const syncLabel = document.getElementById('anki-last-sync');
  if (btn) {
    btn.textContent = '⟳ Syncing...';
    btn.disabled = true;
  }
  if (syncLabel) syncLabel.textContent = 'Connecting to AnkiConnect on localhost:8765…';

  try {
    await ankiRequest('version');
    if (syncLabel) syncLabel.textContent = '✓ Connected — pulling review data…';

    const allDeckNames = await ankiRequest('deckNames');
    const userDecks = allDeckNames.filter(d => d !== 'Default');
    if (syncLabel) syncLabel.textContent = `✓ Found ${userDecks.length} deck(s) — pulling reviews…`;

    const deckStats = await ankiRequest('getDeckStats', { decks: userDecks });

    const startMS = Date.now() - 90 * 24 * 3600 * 1000;
    const reviewArrays = await Promise.all(userDecks.map(deck => ankiRequest('cardReviews', { deck, startID: startMS }).catch(() => [])));

    const seen = new Set();
    const reviews = [];
    reviewArrays.forEach(arr => {
      if (!Array.isArray(arr)) return;
      arr.forEach(r => {
        const key = `${r[0]}_${r[1]}`;
        if (!seen.has(key)) {
          seen.add(key);
          reviews.push(r);
        }
      });
    });

    const state = getState();

    const byDate = {};
    let correctCount = 0;
    let learnedCount = 0;

    reviews.forEach(([timeMs, cardId, usn, buttonPressed, newIvl, prevIvl, newFactor, duration, reviewType]) => {
      const date = new Date(timeMs).toISOString().slice(0, 10);
      if (!byDate[date]) byDate[date] = { total: 0, correct: 0 };
      byDate[date].total++;
      if (buttonPressed >= 3) {
        byDate[date].correct++;
        correctCount++;
        if (reviewType === 0) learnedCount++;
      }
    });

    Object.entries(byDate).forEach(([date, data]) => {
      const level = data.total >= 30 ? 4 : data.total >= 15 ? 3 : data.total >= 5 ? 2 : 1;
      if (!state.habitDays[date] || state.habitDays[date] < level) {
        state.habitDays[date] = level;
      }
    });

    state.ankiXP = correctCount + learnedCount * 2;

    let deckInfo = { total: 0, newCount: 0, due: 0 };
    if (deckStats) {
      Object.values(deckStats).forEach(d => {
        deckInfo.total += d.total_in_deck || 0;
        deckInfo.newCount += d.new_count || 0;
        deckInfo.due += (d.review_count || 0) + (d.learn_count || 0);
      });
    }

    state.ankiStats = {
      lastSync: new Date().toISOString(),
      deckInfo,
      totalReviews: Object.values(byDate).reduce((s, d) => s + d.total, 0),
      correctCount,
      learnedCount,
    };

    saveState(state);
    renderProgressTab(state);

    if (btn) {
      btn.textContent = '✓ Synced';
      btn.disabled = false;
    }
    const totalReviews = Object.values(byDate).reduce((s, d) => s + d.total, 0);
    if (syncLabel) {
      syncLabel.textContent = `Last synced: ${new Date().toLocaleTimeString()} · ${userDecks.length} decks · ${totalReviews} reviews · ${state.ankiXP} Anki XP`;
    }
  } catch (e) {
    if (btn) {
      btn.textContent = '↻ Sync with Anki';
      btn.disabled = false;
    }
    console.error('[AnkiSync] Error:', e.message, e);

    let msg;
    if (e.message === 'CORS_BLOCKED' || e.message === 'Failed to fetch' || e.message.includes('NetworkError')) {
      msg = `⚠ CORS blocked — fix: open Anki → Tools → Add-ons → AnkiConnect → Config → add "null" to webCorsOriginList`;
    } else if (e.message === 'ANKI_NOT_OPEN') {
      msg = '⚠ Anki is not open — launch Anki desktop app, then try again';
    } else {
      msg = `⚠ Error: ${e.message}`;
    }
    if (syncLabel) syncLabel.textContent = msg;
  }
}
