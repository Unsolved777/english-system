// topics — depends on: constants, state, calculations

function getTopicById(state, id) {
  if (!id) return null;
  if (String(id).startsWith('custom-')) {
    const t = (state.customTopics || []).find(x => x.id === id);
    if (!t) return null;
    return {
      ...t,
      custom: true,
      icon: '💼',
      blurb: '',
      refs: [],
      source: 'Custom',
      title: t.title || 'Custom topic',
    };
  }
  const t = C1_TOPICS.find(x => x.id === id);
  return t ? { ...t, custom: false } : null;
}

function renderTopicBreakdownHTML(topic) {
  if (topic.custom) {
    const note = (topic.note || '').trim();
    return `
    <details class="topic-details" draggable="false">
      <summary class="topic-details-summary" draggable="false">Your breakdown</summary>
      <div class="topic-details-inner" draggable="false">
        <p class="topic-plain">${note
          ? escapeHtml(note)
          : 'Add detail in the note field when you create the topic, or describe your goal in your journal. Pair this card with the Exercises tab and Anki.'}</p>
        <p class="topic-hint">Tip: one measurable mini-goal per week beats a vague “get better at this”.</p>
      </div>
    </details>`;
  }
  const plain = topic.plainEnglish;
  const goal = topic.goal;
  const steps = topic.steps && topic.steps.length;
  const acceptance = topic.acceptance && topic.acceptance.length;
  const links = topic.resourceLinks && topic.resourceLinks.length;
  if (!plain && !goal && !steps && !acceptance && !links) return '';

  const stepsHtml = steps
    ? `<div class="topic-subsection"><span class="topic-subhead">Steps</span><ol class="topic-steps">${topic.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol></div>`
    : '';
  const acceptHtml = acceptance
    ? `<div class="topic-subsection"><span class="topic-subhead">Acceptance criteria</span><ul class="topic-accept">${topic.acceptance.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul></div>`
    : '';
  const linksHtml = links
    ? `<div class="topic-subsection topic-resource-links"><span class="topic-subhead">Rules &amp; practice</span><div class="topic-link-row">${topic.resourceLinks
        .map(l => {
          const kind = l.kind === 'practice' ? 'practice' : 'rules';
          const tag = kind === 'practice' ? 'Practice' : 'Rules';
          return `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" class="topic-resource-link topic-resource-link--${kind}" draggable="false"><span class="topic-resource-tag">${tag}</span><span class="topic-resource-label">${escapeHtml(l.label)}</span></a>`;
        })
        .join('')}</div></div>`
    : '';

  return `
    <details class="topic-details" draggable="false">
      <summary class="topic-details-summary" draggable="false">Breakdown &amp; practice</summary>
      <div class="topic-details-inner" draggable="false">
        ${plain ? `<div class="topic-subsection"><span class="topic-subhead">In plain English</span><p class="topic-plain">${escapeHtml(plain)}</p></div>` : ''}
        ${goal ? `<div class="topic-subsection"><span class="topic-subhead">Goal</span><p class="topic-goal">${escapeHtml(goal)}</p></div>` : ''}
        ${stepsHtml}
        ${acceptHtml}
        ${linksHtml}
      </div>
    </details>`;
}

function renderTopicCardHTML(topic, zone) {
  const isFocus = zone === 'focus';
  const refs = topic.refs || [];
  const refsHtml = refs
    .map(
      r =>
        `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="topic-ref" draggable="false">${escapeHtml(r.label)}</a>`
    )
    .join(' · ');
  const sourceHtml = topic.source ? `<span class="topic-source">${escapeHtml(topic.source)}</span>` : '';
  const displayBlurb = topic.custom
    ? topic.note || 'Your custom learning focus — pair with Anki or transcript drills.'
    : topic.blurb || '';
  const badgeHtml = topic.custom ? '<span class="topic-badge">Custom</span>' : '';
  const tid = escapeHtml(topic.id);
  const delBtn = topic.custom
    ? `<button type="button" class="topic-btn-icon" draggable="false" onclick="removeCustomTopic('${tid}')" title="Delete custom topic">×</button>`
    : '';
  const navBtns = isFocus
    ? `<div class="topic-card-actions">
        <button type="button" class="topic-btn-small" draggable="false" onclick="topicMoveFocus('${tid}',-1)">↑</button>
        <button type="button" class="topic-btn-small" draggable="false" onclick="topicMoveFocus('${tid}',1)">↓</button>
        <button type="button" class="topic-btn-small" draggable="false" onclick="topicMoveToPool('${tid}')">To pool</button>
      </div>`
    : `<div class="topic-card-actions">
        <button type="button" class="topic-btn-small" draggable="false" onclick="topicMoveToFocus('${tid}')">Add to focus</button>
      </div>`;
  const catHtml = topic.category ? `<span class="topic-cat">${escapeHtml(topic.category)}</span>` : '';
  const breakdownHtml = renderTopicBreakdownHTML(topic);
  return `
    <div class="topic-card ${topic.custom ? 'topic-card-custom' : ''}" draggable="true" data-topic-id="${escapeHtml(topic.id)}" data-zone="${zone}">
      <div class="topic-card-head">
        <span class="topic-icon" aria-hidden="true">${topic.icon || '📌'}</span>
        <div class="topic-card-titles">
          <div class="topic-title-row">${catHtml}<span class="topic-title">${escapeHtml(topic.title)}</span>${badgeHtml}</div>
        </div>
        ${delBtn}
      </div>
      <p class="topic-blurb">${escapeHtml(displayBlurb)}</p>
      <div class="topic-meta">${sourceHtml}${refsHtml ? (sourceHtml ? ' · ' : '') + refsHtml : ''}</div>
      ${breakdownHtml}
      ${navBtns}
    </div>`;
}

function renderTopicBoard(state) {
  const focusEl = document.getElementById('topic-focus-zone');
  const poolEl = document.getElementById('topic-pool-zone');
  const warnEl = document.getElementById('topic-focus-warning');
  if (!focusEl || !poolEl) return;

  const focusIds = state.focusTopicIds || [];
  const focusTopics = focusIds.map(id => getTopicById(state, id)).filter(Boolean);

  const focusSet = new Set(focusIds);
  const poolBuilt = C1_TOPICS.filter(t => !focusSet.has(t.id));
  const poolCustom = (state.customTopics || []).filter(t => t && t.id && !focusSet.has(t.id));
  const poolTopics = [
    ...poolBuilt.map(t => ({ ...t, custom: false })),
    ...poolCustom.map(t => getTopicById(state, t.id)).filter(Boolean),
  ];

  focusEl.innerHTML = focusTopics.length
    ? focusTopics.map(t => renderTopicCardHTML(t, 'focus')).join('')
    : '<div class="topic-board-empty">Drop topics here or use <strong>Add to focus</strong> on a card below.</div>';

  poolEl.innerHTML = poolTopics.length
    ? poolTopics.map(t => renderTopicCardHTML(t, 'pool')).join('')
    : '<div class="topic-board-empty">All syllabus topics are in focus — or add a custom topic above.</div>';

  if (warnEl) {
    if (focusIds.length >= C1_FOCUS_MAX) {
      warnEl.style.display = 'block';
      warnEl.textContent = `Focus stack is at ${C1_FOCUS_MAX} topics — move one to the pool before adding more.`;
    } else {
      warnEl.style.display = 'none';
      warnEl.textContent = '';
    }
  }
}

function topicMoveToFocus(topicId) {
  const state = getState();
  const focus = [...(state.focusTopicIds || [])];
  if (focus.includes(topicId)) return;
  if (focus.length >= C1_FOCUS_MAX) {
    alert(`Keep focus to ${C1_FOCUS_MAX} topics or fewer — move one to the pool first.`);
    return;
  }
  focus.push(topicId);
  state.focusTopicIds = focus;
  saveState(state);
  renderTopicBoard(state);
}

function topicMoveToPool(topicId) {
  const state = getState();
  state.focusTopicIds = (state.focusTopicIds || []).filter(id => id !== topicId);
  saveState(state);
  renderTopicBoard(state);
}

function topicMoveFocus(topicId, delta) {
  const state = getState();
  const focus = [...(state.focusTopicIds || [])];
  const i = focus.indexOf(topicId);
  if (i < 0) return;
  const j = i + delta;
  if (j < 0 || j >= focus.length) return;
  [focus[i], focus[j]] = [focus[j], focus[i]];
  state.focusTopicIds = focus;
  saveState(state);
  renderTopicBoard(state);
}

function addCustomTopic() {
  const titleEl = document.getElementById('custom-topic-title');
  const noteEl = document.getElementById('custom-topic-note');
  const title = titleEl && titleEl.value.trim();
  if (!title) {
    alert('Enter a title for your custom topic.');
    return;
  }
  const note = noteEl && noteEl.value.trim();
  const state = getState();
  if (!state.customTopics) state.customTopics = [];
  const id = 'custom-' + Date.now();
  state.customTopics.push({
    id,
    title,
    note: note || '',
    createdAt: new Date().toISOString(),
  });
  if (titleEl) titleEl.value = '';
  if (noteEl) noteEl.value = '';
  saveState(state);
  renderTopicBoard(state);
}

function removeCustomTopic(topicId) {
  if (!confirm('Delete this custom topic? It will be removed from focus and the pool.')) return;
  const state = getState();
  state.customTopics = (state.customTopics || []).filter(t => t.id !== topicId);
  state.focusTopicIds = (state.focusTopicIds || []).filter(id => id !== topicId);
  saveState(state);
  renderTopicBoard(state);
}

function initTopicBoardDnD() {
  const tab = document.getElementById('tab-gaps');
  if (!tab || tab._topicBoardDnd) return;
  tab._topicBoardDnd = true;

  tab.addEventListener('dragstart', e => {
    const card = e.target.closest('.topic-card');
    if (!card) return;
    if (e.target.closest('button, a, summary')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', card.dataset.topicId);
    e.dataTransfer.setData('application/x-zone', card.dataset.zone || '');
    e.dataTransfer.effectAllowed = 'move';
    card.classList.add('topic-card-dragging');
  });

  tab.addEventListener('dragend', e => {
    const card = e.target.closest('.topic-card');
    if (card) card.classList.remove('topic-card-dragging');
    document.querySelectorAll('.topic-drop-zone').forEach(z => z.classList.remove('topic-drop-active'));
  });

  tab.addEventListener('dragover', e => {
    const zone = e.target.closest('.topic-drop-zone');
    const fCard = e.target.closest('.topic-card[data-zone="focus"]');
    if (zone || fCard) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
    if (zone) zone.classList.add('topic-drop-active');
  });

  tab.addEventListener('dragleave', e => {
    const zone = e.target.closest('.topic-drop-zone');
    if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove('topic-drop-active');
  });

  tab.addEventListener('drop', e => {
    e.preventDefault();
    document.querySelectorAll('.topic-drop-zone').forEach(z => z.classList.remove('topic-drop-active'));
    const topicId = e.dataTransfer.getData('text/plain');
    if (!topicId) return;

    const dropCard = e.target.closest('.topic-card');
    const focusZone = document.getElementById('topic-focus-zone');
    const poolZone = document.getElementById('topic-pool-zone');
    if (!focusZone || !poolZone) return;

    const state = getState();
    let focus = [...(state.focusTopicIds || [])];
    const inFocus = focus.indexOf(topicId) >= 0;

    if (poolZone.contains(e.target) && (!dropCard || dropCard.dataset.zone === 'pool')) {
      if (inFocus) {
        state.focusTopicIds = focus.filter(id => id !== topicId);
        saveState(state);
        renderTopicBoard(state);
      }
      return;
    }

    const overFocus = focusZone.contains(e.target);
    if (!overFocus) return;

    if (inFocus) {
      if (dropCard && dropCard.dataset.zone === 'focus' && dropCard.dataset.topicId !== topicId) {
        const fromIdx = focus.indexOf(topicId);
        let toIdx = focus.indexOf(dropCard.dataset.topicId);
        if (fromIdx < 0 || toIdx < 0) return;
        focus.splice(fromIdx, 1);
        if (fromIdx < toIdx) toIdx--;
        focus.splice(toIdx, 0, topicId);
        state.focusTopicIds = focus;
        saveState(state);
        renderTopicBoard(state);
      }
      return;
    }

    if (focus.length >= C1_FOCUS_MAX) {
      alert(`Keep focus to ${C1_FOCUS_MAX} topics or fewer — move one to the pool first.`);
      return;
    }
    let insertIdx = focus.length;
    if (dropCard && dropCard.dataset.zone === 'focus') {
      const ti = focus.indexOf(dropCard.dataset.topicId);
      if (ti >= 0) insertIdx = ti;
    }
    focus.splice(insertIdx, 0, topicId);
    state.focusTopicIds = focus;
    saveState(state);
    renderTopicBoard(state);
  });
}
