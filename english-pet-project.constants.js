// Static config — XP weights, career levels, calendar labels (edit thresholds here)
const ENG_KEY = 'eng_progress_v3'; // focus board fields migrated in getState()
const CAL_START = new Date('2026-04-01T00:00:00'); // learning journey start — update if needed
const CAL_START_STR = CAL_START.toISOString().slice(0, 10);

const SESSION_XP = { vocab:25, grammar:25, speaking:30, transcript:15, kindle:0, anki:5, setup:0 };
// XP philosophy: only real learning actions count.
// 1 card reviewed (correct) = +1 XP | 1 card learned = +3 XP  [tracked via Anki sync, future phase]
// kindle highlights = 0 (value is in the cards created, not the push itself)
// transcript analysis = 15 (moderate — you get the XP from the cards + speaking practice that follows)
// setup/infrastructure = 0 (meta-work ≠ English improvement)
const SESSION_LABELS = { vocab:'Vocab', grammar:'Grammar', speaking:'Speaking', transcript:'Transcript', kindle:'Kindle', anki:'Anki', setup:'System' };

const CAREER_LEVELS = [
  { name:'B2 Plateau',   icon:'📊', xpMin:0    },
  { name:'Breaking Out', icon:'🔓', xpMin:200  },
  { name:'C1 Candidate', icon:'🎯', xpMin:450  },
  { name:'C1 Manager',   icon:'💼', xpMin:750  },
  { name:'C1+ Director', icon:'🏆', xpMin:1100 },
];

const LEVEL_INFO = [
  { name: 'No activity',   desc: 'Click to mark this day',                        color: '#4b5563' },
  { name: 'Anki',          desc: 'Quick card practice · 5–15 min',                color: '#60a5fa' },
  { name: 'Session',       desc: 'Focused vocab / grammar / speaking · 20–40 min', color: '#818cf8' },
  { name: 'Core Work',     desc: 'Intensive session + cards created or analysed',  color: '#a78bfa' },
  { name: 'Deep Work',     desc: '60+ cards reviewed or 1h+ learning block',       color: '#4ade80' },
];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_FULL = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

/** Max topics in "In focus" (soft limit — UI warns) */
const C1_FOCUS_MAX = 7;

/**
 * Built-in C1+ syllabus topics — each row includes `source`, `refs`, and optional:
 * `plainEnglish`, `goal`, `steps[]`, `acceptance[]`, `resourceLinks[]` ({ label, url, kind: 'rules'|'practice' }).
 */
const C1_TOPICS = [
  {
    id: 'c1-range',
    category: 'CEFR skills',
    icon: '📚',
    title: 'Broad linguistic range',
    blurb: 'Command of a broad range of language; flexible use for social, academic and professional purposes.',
    source: 'CEFR C1 · Global scale',
    refs: [{ label: 'CEFR', url: 'https://www.coe.int/en/web/common-european-framework-reference-languages' }],
    plainEnglish: 'You can talk or write about the same idea in a Slack message, a client email, and a slide — without sounding stiff in one place and sloppy in another.',
    goal: 'Move one work topic across three registers (informal note → neutral email → short spoken update) using varied but accurate wording.',
    steps: [
      'Pick one real work message you sent this week.',
      'Rewrite it in two other registers: more formal, then more spoken.',
      'Underline 5 words you changed; check if each change was for tone or precision.',
      'Save the best phrases to Anki with a “register” tag.',
    ],
    acceptance: [
      'You produced three versions of the same content with clearly different tone.',
      'You can name at least two vocabulary or grammar swaps you made on purpose.',
    ],
    resourceLinks: [
      { label: 'CEFR global scale (official)', url: 'https://www.coe.int/en/web/common-european-framework-reference-languages', kind: 'rules' },
      { label: 'British Council · Writing & tone', url: 'https://learnenglish.britishcouncil.org/skills/writing', kind: 'practice' },
    ],
  },
  {
    id: 'c1-coherence',
    category: 'CEFR skills',
    icon: '🔗',
    title: 'Coherence & cohesion',
    blurb: 'Clear, smoothly flowing, spontaneous speech and structured writing with cohesive devices.',
    source: 'CEFR C1 · Spoken / Written interaction',
    refs: [{ label: 'CEFR', url: 'https://www.coe.int/en/web/common-european-framework-reference-languages' }],
    plainEnglish: 'Listeners and readers follow your logic easily: paragraphs and turns connect, not just individual sentences.',
    goal: 'Use explicit signposting and reference words so a 90-second spoken answer or a short report reads as one piece.',
    steps: [
      'Take a messy draft paragraph (your own writing).',
      'Add one sentence-initial linker for contrast, one for cause, and one summarising the section.',
      'Read aloud: if you pause where the idea jumps, fix the link.',
    ],
    acceptance: [
      'Every paragraph (or 3–4 sentences in speech) has a clear “why this comes next” link.',
      'Someone else could sketch your structure from your linkers alone.',
    ],
    resourceLinks: [
      { label: 'British Council · C1 · Contrasting ideas (linking)', url: 'https://learnenglish.britishcouncil.org/grammar/c1-grammar/contrasting-ideas', kind: 'rules' },
      { label: 'Manchester Academic Phrasebank', url: 'https://www.phrasebank.manchester.ac.uk/', kind: 'practice' },
    ],
  },
  {
    id: 'cae-reading',
    category: 'Cambridge C1 Advanced',
    icon: '📖',
    title: 'Reading — gist, detail, opinion',
    blurb: 'Long texts: understanding attitude, tone, implicit meaning and text organisation.',
    source: 'Cambridge C1 Advanced · Reading',
    refs: [{ label: 'C1 Advanced', url: 'https://www.cambridgeenglish.org/exams-and-tests/advanced/' }],
    plainEnglish: 'You don’t just understand words — you see what the writer really thinks, what is implied, and how the text is built.',
    goal: 'After one long article, state main idea, two supporting points, and the writer’s stance — without copying phrases.',
    steps: [
      'Skim for purpose in 2 minutes; note the genre (opinion, report, review).',
      'Read for detail: highlight attitude words (verbs/adverbs that judge).',
      'Write 3 bullet “author would agree / disagree” statements and check against the text.',
    ],
    acceptance: [
      'You can quote or paraphrase evidence for your reading of tone/attitude.',
      'You identify how one paragraph supports the next (e.g. example → consequence).',
    ],
    resourceLinks: [
      { label: 'Cambridge · C1 Advanced (exam hub)', url: 'https://www.cambridgeenglish.org/exams-and-tests/advanced/', kind: 'rules' },
      { label: 'Flo-Joe · CAE reading practice', url: 'https://www.flo-joe.co.uk/cae/students/reading/index.htm', kind: 'practice' },
    ],
  },
  {
    id: 'cae-writing',
    category: 'Cambridge C1 Advanced',
    icon: '✍️',
    title: 'Writing — essays, proposals, reports',
    blurb: 'Clear, well-structured, developed writing with appropriate register for the task.',
    source: 'Cambridge C1 Advanced · Writing',
    refs: [{ label: 'C1 Advanced', url: 'https://www.cambridgeenglish.org/exams-and-tests/advanced/' }],
    plainEnglish: 'You match the document type (essay vs proposal vs report): layout, tone, and how you persuade the reader.',
    goal: 'Produce one short exam-style piece with correct headings/register and a clear recommendation or conclusion.',
    steps: [
      'Underline the task: who reads, what outcome, what format.',
      'Plan: intro hook, 2 body ideas with mini-examples, closing action.',
      'Write; then cut 10% of words — C1 rewards density, not padding.',
    ],
    acceptance: [
      'Format matches the task (headings where required).',
      'Reader knows your position or recommendation in the last paragraph.',
    ],
    resourceLinks: [
      { label: 'Cambridge · C1 Advanced (exam hub)', url: 'https://www.cambridgeenglish.org/exams-and-tests/advanced/', kind: 'rules' },
      { label: 'Flo-Joe · CAE writing practice', url: 'https://www.flo-joe.co.uk/cae/students/writing/index.htm', kind: 'practice' },
    ],
  },
  {
    id: 'cae-listening',
    category: 'Cambridge C1 Advanced',
    icon: '🎧',
    title: 'Listening — extended speech',
    blurb: 'Follow extended speech, lectures, discussions; grasp implicit meaning and attitude.',
    source: 'Cambridge C1 Advanced · Listening',
    refs: [{ label: 'C1 Advanced', url: 'https://www.cambridgeenglish.org/exams-and-tests/advanced/' }],
    plainEnglish: 'You keep up with fast, natural speech and notice when someone is being ironic, hesitant, or disagreeing politely.',
    goal: 'After one 5–8 minute talk, summarise content + speaker attitude in your own words.',
    steps: [
      'Listen once without stopping; note only topic + speaker goal.',
      'Second pass: pause every 90s and say one sentence summary aloud.',
      'List 3 attitude markers (e.g. “I’m not convinced”, “frankly”).',
    ],
    acceptance: [
      'Your summary includes both information and stance.',
      'You caught at least one implicit meaning (hint, joke, or polite objection).',
    ],
    resourceLinks: [
      { label: 'Cambridge · C1 Advanced (exam hub)', url: 'https://www.cambridgeenglish.org/exams-and-tests/advanced/', kind: 'rules' },
      { label: 'BBC Learning English · 6 Minute English', url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english', kind: 'practice' },
    ],
  },
  {
    id: 'cae-speaking',
    category: 'Cambridge C1 Advanced',
    icon: '🗣️',
    title: 'Speaking — long turns & collaboration',
    blurb: 'Fluency, discourse management, collaborative tasks and responding to peers.',
    source: 'Cambridge C1 Advanced · Speaking',
    refs: [{ label: 'C1 Advanced', url: 'https://www.cambridgeenglish.org/exams-and-tests/advanced/' }],
    plainEnglish: 'You can speak at length without rambling, invite others into the conversation, and respond to what they said.',
    goal: 'Deliver a 90-second coherent mini-presentation on a work topic, then ask one follow-up that references your partner.',
    steps: [
      'Record 90s on “a problem my team faced this quarter” — no script.',
      'Listen back: mark one place you repeated yourself; re-record with a linker.',
      'Practice one collaborative phrase: “Building on that…”, “I’d push back slightly…”.',
    ],
    acceptance: [
      'Long turn has clear opening, development, and close.',
      'You use at least two interactive phrases appropriately.',
    ],
    resourceLinks: [
      { label: 'Cambridge · C1 Advanced (exam hub)', url: 'https://www.cambridgeenglish.org/exams-and-tests/advanced/', kind: 'rules' },
      { label: 'British Council · Speaking skills', url: 'https://learnenglish.britishcouncil.org/speaking', kind: 'practice' },
    ],
  },
  {
    id: 'bc-hedging',
    category: 'Discourse & pragmatics',
    icon: '💬',
    title: 'Hedging & stance',
    blurb: 'Soften claims, express degrees of certainty, and sound appropriately tentative in professional talk.',
    source: 'British Council · Grammar / pragmatics',
    refs: [{ label: 'LearnEnglish', url: 'https://learnenglish.britishcouncil.org/grammar' }],
    plainEnglish: 'You don’t sound like you’re 100% sure about everything — you sound careful and credible when data is incomplete.',
    goal: 'Rewrite five strong claims from your emails using hedging (modal + adverb + vague noun) where appropriate.',
    steps: [
      'Collect 5 sentences with “will / must / always” from your sent mail.',
      'Rewrite each with one hedge (might, tend to, appear to, generally).',
      'Read aloud: still sound confident enough for work?',
    ],
    acceptance: [
      'At least three rewrites keep meaning but reduce overstated certainty.',
      'You can explain when you would not hedge (legal commitment, deadline).',
    ],
    resourceLinks: [
      { label: 'British Council · Modals (deductions & probability)', url: 'https://learnenglish.britishcouncil.org/grammar/b1-b2-grammar/modals-deductions-about-past', kind: 'rules' },
      { label: 'Perfect English Grammar · Modal verbs', url: 'https://www.perfect-english-grammar.com/modal-verbs.html', kind: 'practice' },
    ],
  },
  {
    id: 'bc-linking',
    category: 'Discourse & pragmatics',
    icon: '🔀',
    title: 'Discourse markers & flow',
    blurb: 'Signposting, contrast, cause and reformulation in extended monologue.',
    source: 'British Council · Grammar',
    refs: [{ label: 'LearnEnglish', url: 'https://learnenglish.britishcouncil.org/grammar' }],
    plainEnglish: 'You guide the listener: “first / on the other hand / in other words” — so your speech feels organised.',
    goal: 'Use a varied set of markers in a 2-minute spoken update (not just “and”, “but”, “so”).',
    steps: [
      'List your top 5 overused connectors from a transcript of yourself.',
      'Prepare 8 alternatives (contrast, cause, example, summary).',
      'Re-record the same update using at least 5 different markers.',
    ],
    acceptance: [
      'No single linker appears more than twice in the 2 minutes.',
      'Someone listening can tell when you shift to a new sub-point.',
    ],
    resourceLinks: [
      { label: 'British Council · C1 · Participle clauses (flow)', url: 'https://learnenglish.britishcouncil.org/grammar/c1-grammar/participle-clauses', kind: 'rules' },
      { label: 'Perfect English Grammar · Grammar exercises index', url: 'https://www.perfect-english-grammar.com/grammar-exercises.html', kind: 'practice' },
    ],
  },
  {
    id: 'bc-inversion',
    category: 'Grammar & patterns',
    icon: '🔧',
    title: 'Inversion & emphasis',
    blurb: 'Negative adverbial fronting, "Not only…", "Rarely…" — formal spoken and written English.',
    source: 'British Council · Grammar (advanced patterns)',
    refs: [{ label: 'LearnEnglish', url: 'https://learnenglish.britishcouncil.org/grammar' }],
    plainEnglish: 'You can front a negative or limiting phrase for emphasis (“Never have I…”) — mostly for formal style.',
    goal: 'Produce four correct inversion sentences tied to real work contexts (not random grammar drills).',
    steps: [
      'Review the pattern with one example each: negative adverb, “not only”, “little”.',
      'Write 4 sentences about your project using different triggers.',
      'Check subject–auxiliary inversion after the fronted phrase.',
    ],
    acceptance: [
      'All four inversions are grammatically correct and sound natural in context.',
      'You avoid inversion in casual chat where it would sound odd.',
    ],
    resourceLinks: [
      { label: 'British Council · C1 · Inversion & conditionals', url: 'https://learnenglish.britishcouncil.org/grammar/c1-grammar/inversion-conditionals', kind: 'rules' },
      { label: 'Perfect English Grammar · Inversion exercises', url: 'https://www.perfect-english-grammar.com/inversion-exercise-1.html', kind: 'practice' },
    ],
  },
  {
    id: 'bc-conditionals',
    category: 'Grammar & patterns',
    icon: '⚡',
    title: 'Mixed & advanced conditionals',
    blurb: 'Past unreal, mixed time frames and natural use in argumentation.',
    source: 'British Council · Grammar',
    refs: [{ label: 'LearnEnglish', url: 'https://learnenglish.britishcouncil.org/grammar' }],
    plainEnglish: 'You mix time references naturally: past condition → present result, or present habit → past consequence.',
    goal: 'Write or say 6 mixed conditionals about real decisions (3rd + 2nd mixes) with correct time alignment.',
    steps: [
      'List two past regrets and two current hypotheticals at work.',
      'Match each to a mixed pattern (if + past perfect, would + base / would have + pp).',
      'Say them aloud; fix any tense slip.',
    ],
    acceptance: [
      'Each sentence mixes time frames deliberately and correctly.',
      'You can explain the time logic in one short phrase.',
    ],
    resourceLinks: [
      { label: 'British Council · Conditionals (third & mixed)', url: 'https://learnenglish.britishcouncil.org/grammar/b1-b2-grammar/conditionals-third-mixed', kind: 'rules' },
      { label: 'Perfect English Grammar · Mixed conditionals', url: 'https://www.perfect-english-grammar.com/third-conditional.html', kind: 'practice' },
    ],
  },
  {
    id: 'bc-passive',
    category: 'Grammar & patterns',
    icon: '🏗️',
    title: 'Advanced passive & reporting',
    blurb: 'Passives and reporting structures for formal description and process focus.',
    source: 'British Council · Grammar',
    refs: [{ label: 'LearnEnglish', url: 'https://learnenglish.britishcouncil.org/grammar' }],
    plainEnglish: 'You describe processes and decisions without always saying “we” — focus moves to the action or outcome.',
    goal: 'Rewrite an active paragraph from a status report into passive / impersonal style where appropriate.',
    steps: [
      'Take a paragraph with many “we / I” subjects.',
      'Convert 4–6 clauses to passive or “It was agreed that…”.',
      'Check: still clear who is responsible where it matters?',
    ],
    acceptance: [
      'Passives are not used to hide accountability on purpose.',
      'Formal tone fits document type (e.g. release notes, executive summary).',
    ],
    resourceLinks: [
      { label: 'British Council · C1 · Advanced passives review', url: 'https://learnenglish.britishcouncil.org/grammar/c1-grammar/advanced-passives-review', kind: 'rules' },
      { label: 'Perfect English Grammar · Passive exercises', url: 'https://www.perfect-english-grammar.com/passive-exercise-1.html', kind: 'practice' },
    ],
  },
  {
    id: 'bc-lexis',
    category: 'Lexis & collocation',
    icon: '📝',
    title: 'Lexical precision & collocation',
    blurb: 'Choosing precise words and natural word combinations in formal contexts.',
    source: 'British Council · Vocabulary',
    refs: [{ label: 'LearnEnglish', url: 'https://learnenglish.britishcouncil.org/vocabulary' }],
    plainEnglish: 'You pick words that go together naturally (“conduct a review”, not “do a review” in formal docs — both exist, but register differs).',
    goal: 'Replace 10 vague words (get, make, thing, nice) in one document with precise pairs you verify in a dictionary.',
    steps: [
      'Paste a work paragraph into a doc and highlight vague words.',
      'Use Oxford Learner’s or Longman collocations to find two options each.',
      'Pick one; add the collocation to Anki.',
    ],
    acceptance: [
      'At least 7 replacements are more precise and collocate naturally.',
      'You recorded the noun–verb pattern (e.g. mitigate risk, allocate budget).',
    ],
    resourceLinks: [
      { label: 'British Council · Vocabulary', url: 'https://learnenglish.britishcouncil.org/vocabulary', kind: 'rules' },
      { label: 'Ozdic · Collocation dictionary', url: 'https://ozdic.com/', kind: 'practice' },
    ],
  },
  {
    id: 'bc-pronunciation',
    category: 'Pronunciation & delivery',
    icon: '🎙️',
    title: 'Connected speech & clarity',
    blurb: 'Word stress, weak forms and chunking for intelligible, fluent delivery.',
    source: 'British Council · Speaking',
    refs: [{ label: 'LearnEnglish', url: 'https://learnenglish.britishcouncil.org/speaking' }],
    plainEnglish: 'You sound easier to follow: words link, unstressed words shrink, and key terms still stand out.',
    goal: 'Record one minute of speech; mark 5 places to add weak forms or linking; re-record and compare.',
    steps: [
      'Choose a short script (your own 6–8 sentences).',
      'Mark content words vs function words; practise schwa in function words.',
      'Clap chunk boundaries; re-read in phrases, not word-by-word.',
    ],
    acceptance: [
      'Second recording is smoother; less “robotic” word stress.',
      'You can name one fix you applied (linking, weak form, or chunking).',
    ],
    resourceLinks: [
      { label: 'British Council · Pronunciation', url: 'https://learnenglish.britishcouncil.org/pronunciation', kind: 'rules' },
      { label: 'BBC Learning English · The Sounds of English', url: 'https://www.bbc.co.uk/learningenglish/english/features/pronunciation', kind: 'practice' },
    ],
  },
  {
    id: 'bc-meetings',
    category: 'Professional situations',
    icon: '🤝',
    title: 'Meetings & interaction',
    blurb: 'Turn-taking, clarifying, agreeing and disagreeing in professional discussions.',
    source: 'British Council · Business / Speaking',
    refs: [{ label: 'LearnEnglish', url: 'https://learnenglish.britishcouncil.org/speaking' }],
    plainEnglish: 'You don’t just present — you interrupt politely, check understanding, and disagree without damaging rapport.',
    goal: 'Roleplay or simulate: agree, add a caveat, and summarise decisions in three short turns.',
    steps: [
      'Write 6 stock phrases: clarify, stall, agree with reservation, close topic.',
      'Use them in a 5-minute mock meeting on a real agenda item.',
      'Record; count fillers; replace with pauses.',
    ],
    acceptance: [
      'You used at least one phrase each for agreement, pushback, and alignment.',
      'You summarised “what we decided” in one sentence.',
    ],
    resourceLinks: [
      { label: 'British Council · Managing meetings (Business magazine)', url: 'https://learnenglish.britishcouncil.org/business-english/business-magazine/managing-meetings', kind: 'rules' },
      { label: 'British Council · Business English', url: 'https://learnenglish.britishcouncil.org/business-english', kind: 'practice' },
    ],
  },
];

/**
 * Core Exercise Bank — single source of truth for IDs, session log labels, and UI copy.
 * Add a row here; cards render from `renderExerciseBank()` (no duplicate IDs in HTML).
 */
const EXERCISES = [
  {
    id: 'anki-review',
    title: 'Anki Production Review',
    exTag: 'vocab',
    exTagLabel: 'Vocabulary',
    sessionType: 'anki',
    sessionLabel: 'Anki Production Review',
    bodyHtml: 'Open Anki → review all due cards in fill-in-the-blank mode. For any card you get wrong — write a new example sentence using the phrase in your current work context. <br><span class="highlight">Outcome: Moves phrases from passive to active memory. The new sentence goes into Examples field.</span>',
  },
  {
    id: 'kindle-card',
    title: 'Kindle → Card → Use',
    exTag: 'vocab',
    exTagLabel: 'Vocabulary',
    sessionType: 'kindle',
    sessionLabel: 'Kindle → Card → Use',
    bodyHtml: 'Push latest Kindle highlights → Cursor creates cards → immediately use each new phrase in 1 sentence about your current project. Then add to Anki. <br><span class="highlight">Outcome: Reading turns into production practice within the same session.</span>',
  },
  {
    id: 'sentence-upgrade',
    title: 'Sentence Upgrade Drill',
    exTag: 'writing',
    exTagLabel: 'Writing',
    sessionType: 'vocab',
    sessionLabel: 'Sentence Upgrade Drill',
    bodyHtml: 'Write 5 sentences about your current work situation in B2 English. Then rewrite each one at C1 level. Cursor reviews and gives you the "native" version. <br><span class="highlight">Outcome: Active vocabulary + grammar range simultaneously. New phrases → Anki cards.</span>',
  },
  {
    id: 'conditional',
    title: 'Conditional Transformation',
    exTag: 'grammar',
    exTagLabel: 'Grammar',
    sessionType: 'grammar',
    sessionLabel: 'Conditional Transformation drill',
    bodyHtml: 'Start with a real scenario from your work. Cursor gives you a 2nd/3rd/mixed conditional stem — you complete it. Then reverse: result given, you give condition. 10 rounds. <br><span class="highlight">Outcome: Conditionals become automatic, not effortful.</span>',
  },
  {
    id: 'stakeholder',
    title: 'Stakeholder Roleplay',
    exTag: 'speaking',
    exTagLabel: 'Speaking',
    sessionType: 'speaking',
    sessionLabel: 'Stakeholder Roleplay session',
    bodyHtml: 'Describe a scenario (e.g., "I need to convince my CTO to delay a release"). Cursor plays the skeptical stakeholder. You argue, persuade, handle objections. After 5 exchanges: specific language feedback + cards for phrases you should have used. <br><span class="highlight">Outcome: Real-context fluency + professional vocabulary under pressure.</span>',
  },
  {
    id: 'transcript-review',
    title: 'Meeting Transcript Review',
    exTag: 'speaking',
    exTagLabel: 'Speaking',
    sessionType: 'transcript',
    sessionLabel: 'Meeting Transcript Review',
    bodyHtml: 'Share any meeting transcript → Cursor finds your lines → flags filler words, hedging gaps, register issues → suggests C1 upgrades → creates cards from the gap between what you said and what you should have said. <br><span class="highlight">Outcome: Learning from YOUR real language, not generic examples.</span>',
  },
  {
    id: 'collocation',
    title: 'Collocation Mining',
    exTag: 'vocab',
    exTagLabel: 'Vocabulary',
    sessionType: 'vocab',
    sessionLabel: 'Collocation Mining session',
    bodyHtml: 'Take 5 words you know (e.g., "risk", "strategy", "impact"). Cursor gives 8 C1 collocations for each — C1 and C2 variants. You build sentences using ones that feel unnatural. <br><span class="highlight">Outcome: Richer vocabulary without learning new words — just new combinations.</span>',
  },
  {
    id: 'email-rewrite',
    title: 'Weekly Email Rewrite',
    exTag: 'writing',
    exTagLabel: 'Writing',
    sessionType: 'vocab',
    sessionLabel: 'Weekly Email Rewrite',
    bodyHtml: 'Take a real email you wrote in English this week. Cursor rewrites it at C1+ level and annotates every change. You study the diff — the most impactful patterns become Anki cards. <br><span class="highlight">Outcome: Immediate application to real work + accelerated learning from your own output.</span>',
  },
];
