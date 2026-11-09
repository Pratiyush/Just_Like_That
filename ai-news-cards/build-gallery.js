#!/usr/bin/env node
/*
 * Build the design gallery and the README catalog from designs/*\/meta.json.
 *
 *   node build-gallery.js                 writes gallery.html (uses output/*.png) and refreshes the README catalog
 *   node build-gallery.js --artifact DIR  writes DIR/index.html for publishing (body-only HTML, images at cards/<id>.jpg)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DESIGNS_DIR = path.join(ROOT, 'designs');
const REPO_OUTPUT_URL = 'https://github.com/Pratiyush/Just_Like_That/tree/HEAD/ai-news-cards/output';

const GOALS = {
  scroll: 'Stop the scroll',
  hold: 'Hold attention',
  save: 'Earn saves',
  send: 'Get sent',
  comment: 'Drive comments',
  trust: 'Build trust',
};

const PRINCIPLES = [
  { name: 'Pre-attentive processing', origin: 'Treisman & Gelade, 1980', effect: 'Colour, size and orientation register before reading starts, so one strong contrast stops the thumb.', re: /pre-?attentive|treisman/i },
  { name: 'Isolation (Von Restorff) effect', origin: 'von Restorff, 1933', effect: 'The one element that differs gets noticed and remembered.', re: /restorff|isolation/i },
  { name: 'First impressions in ~50 ms', origin: 'Lindgaard et al., 2006', effect: 'Visual appeal is judged before any words are read.', re: /lindgaard|first[- ]impression/i },
  { name: 'Information-gap curiosity', origin: 'Loewenstein, 1994', effect: 'A specific gap in knowledge creates an itch to close it.', re: /curiosity|information[- ]gap|loewenstein/i },
  { name: 'Zeigarnik effect / open loops', origin: 'Zeigarnik, 1927', effect: 'Unfinished things nag, so a "1/5" or cut-off shape pulls the next swipe.', re: /zeigarnik|open loop/i },
  { name: 'Processing fluency', origin: 'Reber & Schwarz, 1999', effect: 'Text that is easy to read feels more true and more likeable.', re: /fluency|reber/i },
  { name: 'High-arousal emotion', origin: 'Berger & Milkman, 2012', effect: 'Awe, excitement, amusement and anxiety get shared more than calm content.', re: /arousal|milkman|\bawe\b|amusement/i },
  { name: 'STEPPS: social currency & practical value', origin: 'Berger, 2013', effect: 'People share what makes them look informed and what is useful to others.', re: /stepps|social currency|practical value/i },
  { name: 'Negativity bias & loss aversion', origin: 'Baumeister et al., 2001; Kahneman & Tversky, 1979', effect: 'Threats and potential losses grab attention faster than gains.', re: /negativity|loss aversion|kahneman/i },
  { name: 'Picture superiority / dual coding', origin: 'Paivio, 1971', effect: 'Image plus words is remembered better than words alone.', re: /picture superiority|dual[- ]coding|paivio/i },
  { name: 'Chunking', origin: 'Miller, 1956; Cowan, 2001', effect: 'Working memory holds about four chunks, so 3 to 5 items per card.', re: /chunking|cowan/i },
  { name: 'Serial position effect', origin: 'Murdock, 1962', effect: 'First and last items in a list are remembered best.', re: /serial[- ]position|murdock/i },
  { name: 'Gestalt grouping', origin: 'Wertheimer, 1923; Palmer, 1992', effect: 'Proximity, common region and continuation organise a card at a glance.', re: /gestalt|common region|figure[- ]ground|continuation/i },
  { name: 'Gaze cueing', origin: 'Friesen & Kingstone, 1998', effect: 'Eyes, even cartoon ones, pull attention where they look.', re: /gaze/i },
  { name: 'Self-reference effect', origin: 'Rogers, Kuiper & Kirker, 1977', effect: 'Information about "you" is processed more deeply.', re: /self[- ]reference/i },
  { name: "Cialdini's levers", origin: 'Cialdini, 1984', effect: 'Authority, commitment and consistency, and social proof make claims persuasive.', re: /cialdini|authority|commitment/i },
  { name: 'Aesthetic-usability effect', origin: 'Kurosu & Kashimura, 1995', effect: 'Beautiful designs are perceived as easier to use and more credible.', re: /aesthetic[- ]usability|kurosu/i },
  { name: "Hick's law", origin: 'Hick, 1952', effect: 'Fewer elements, faster decisions: one clear focal point.', re: /hick/i },
  { name: 'Novelty & pattern interrupt', origin: 'Bunzeck & Düzel, 2006', effect: 'Unexpected formats activate reward circuits and earn a second look.', re: /novelty|bunzeck|pattern interrupt|expectation violation/i },
  { name: 'Social identity', origin: 'Tajfel & Turner, 1979', effect: 'Picking a side invites people to defend it in the comments.', re: /tajfel|in-group|social identity/i },
  { name: 'Cognitive dissonance', origin: 'Festinger, 1957', effect: 'A belief contradicted by a fact creates tension the reader wants to resolve.', re: /dissonance|festinger/i },
  { name: 'F-shaped scanning', origin: 'Nielsen, 2006', effect: 'Readers scan the top and left edge first, so that is where the hook goes.', re: /f-shaped|f-pattern|nielsen/i },
];

const esc = (s) =>
  String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function loadDesigns() {
  return fs
    .readdirSync(DESIGNS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^[_.]/.test(d.name))
    .map((d) => d.name)
    .sort()
    .map((id) => {
      const metaPath = path.join(DESIGNS_DIR, id, 'meta.json');
      let meta = {};
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      } catch (e) {
        console.warn(`! ${id}: missing or invalid meta.json (${e.message})`);
      }
      return {
        id,
        num: id.slice(0, 2),
        name: meta.name || id,
        style: meta.style || '',
        palette: Array.isArray(meta.palette) ? meta.palette : [],
        fonts: Array.isArray(meta.fonts) ? meta.fonts : [],
        bestFor: meta.bestFor || '',
        principles: Array.isArray(meta.principles) ? meta.principles : [],
        hookFormula: meta.hookFormula || '',
        captionTip: meta.captionTip || '',
        fields: Array.isArray(meta.fields) ? meta.fields : [],
        goal: GOALS[meta.goal] ? meta.goal : 'scroll',
      };
    });
}

function principleIndex(designs) {
  return PRINCIPLES.map((p) => ({
    ...p,
    designs: designs.filter((d) => d.principles.some((x) => p.re.test(x.name || ''))).map((d) => d.num),
  })).filter((p) => p.designs.length > 0);
}

function page(designs, { imgSrc, standalone }) {
  const counts = {};
  designs.forEach((d) => (counts[d.goal] = (counts[d.goal] || 0) + 1));
  const principles = principleIndex(designs);
  const data = designs.map((d) => ({ ...d, img: imgSrc(d) }));

  const head = `<title>AI News Card Kit</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap">
<style>
/* Layout: a lightbox contact sheet. 4:5 prints in a responsive grid, goal filter on top,
   a viewer dialog for the full card and its research notes, then usage and the research index. */
:root {
  --ground: #E4E5EA;
  --surface: #F6F6F8;
  --ink: #15161B;
  --muted: #565B68;
  --line: #C9CBD3;
  --accent: #2B3BD1;
  --shadow: 0 1px 2px rgb(20 22 30 / .10), 0 8px 24px -8px rgb(20 22 30 / .22);
  --font-display: 'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --ground: #101115; --surface: #1A1B21; --ink: #ECEDF2; --muted: #9A9FAD; --line: #2E3039; --accent: #93A0FF;
    --shadow: 0 1px 2px rgb(0 0 0 / .4), 0 10px 28px -10px rgb(0 0 0 / .7);
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --ground: #101115; --surface: #1A1B21; --ink: #ECEDF2; --muted: #9A9FAD; --line: #2E3039; --accent: #93A0FF;
  --shadow: 0 1px 2px rgb(0 0 0 / .4), 0 10px 28px -10px rgb(0 0 0 / .7);
  color-scheme: dark;
}
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--ground);
  color: var(--ink);
  font: 400 16px/1.55 var(--font-display);
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  -webkit-font-smoothing: antialiased;
}
.wrap { max-width: 1320px; margin: 0 auto; padding-block: 56px 96px; display: grid; gap: 72px; }
h1, h2, h3 { margin: 0; text-wrap: balance; }
p { margin: 0; }
a { color: var(--accent); }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
.label { font: 500 12px/1.3 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }

header { display: grid; gap: 20px; }
header h1 { font-size: clamp(44px, 8vw, 96px); font-weight: 800; letter-spacing: -.035em; line-height: .92; }
.lede { font-size: clamp(17px, 2vw, 20px); color: var(--muted); max-width: 62ch; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.chip {
  font: 500 13px/1 var(--font-mono); letter-spacing: .02em; color: var(--ink);
  background: transparent; border: 1px solid var(--line); border-radius: 999px; padding: 9px 14px; cursor: pointer;
}
.chip span { color: var(--muted); margin-left: 6px; }
.chip[aria-pressed="true"] { background: var(--ink); color: var(--ground); border-color: var(--ink); }
.chip[aria-pressed="true"] span { color: inherit; opacity: .7; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 236px), 1fr)); gap: 44px 24px; }
.design { display: grid; gap: 14px; align-content: start; min-width: 0; }
.shot {
  display: block; width: 100%; padding: 0; border: 0; cursor: zoom-in; background: var(--line);
  aspect-ratio: 4 / 5; max-width: 100%; border-radius: 6px; overflow: hidden; box-shadow: var(--shadow);
}
.shot img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .35s ease; }
.shot:hover img { transform: scale(1.025); }
.design-meta { display: grid; gap: 6px; min-width: 0; }
.title-row { display: flex; align-items: baseline; gap: 10px; }
.num { font: 500 13px/1 var(--font-mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.design h3 { font-size: 19px; font-weight: 700; letter-spacing: -.01em; }
.goal { font: 500 11.5px/1.3 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }
.best { font-size: 14.5px; color: var(--muted); line-height: 1.45; }
.tags { font-size: 13px; color: var(--muted); line-height: 1.5; }
.tags b { color: var(--ink); font-weight: 600; }
@media (max-width: 560px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 14px; }
  .tags { display: none; }
  .design h3 { font-size: 16px; }
  .best { font-size: 13px; }
}

section { display: grid; gap: 28px; }
section > h2 { font-size: clamp(28px, 4vw, 44px); font-weight: 800; letter-spacing: -.025em; line-height: 1; }
.section-intro { color: var(--muted); max-width: 64ch; }
.steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 16px; counter-reset: step; }
.steps li { counter-increment: step; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 22px; display: grid; gap: 12px; align-content: start; min-width: 0; }
.steps li::before { content: "Step " counter(step); font: 500 12px/1 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }
.steps h3 { font-size: 19px; }
.steps p { color: var(--muted); font-size: 15px; }
pre { margin: 0; overflow-x: auto; background: var(--ground); border: 1px solid var(--line); border-radius: 6px; padding: 12px 14px; font: 400 13px/1.55 var(--font-mono); color: var(--ink); }
code { font-family: var(--font-mono); font-size: .92em; }

.research { display: grid; border-top: 1px solid var(--line); }
.research-row { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .9fr) minmax(0, 1.9fr) minmax(0, 1fr); gap: 20px; padding-block: 16px; border-bottom: 1px solid var(--line); align-items: baseline; }
.research-row.head { padding-block: 10px; }
.research-row h3 { font-size: 16px; font-weight: 700; }
.research-row .origin { font: 400 13px/1.4 var(--font-mono); color: var(--muted); }
.research-row .effect { font-size: 15px; color: var(--muted); }
.used { display: flex; flex-wrap: wrap; gap: 6px; }
.used button { font: 500 12px/1 var(--font-mono); padding: 6px 8px; border-radius: 4px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; font-variant-numeric: tabular-nums; }
@media (max-width: 760px) {
  .research-row { grid-template-columns: 1fr; gap: 6px; }
  .research-row.head { display: none; }
}
.note { font-size: 14px; color: var(--muted); border-top: 1px solid var(--line); padding-top: 20px; }

dialog {
  width: min(1180px, 100%); max-height: 100%; padding: 0; border: 0; border-radius: 12px;
  background: var(--surface); color: var(--ink); box-shadow: 0 30px 80px rgb(0 0 0 / .45);
}
dialog::backdrop { background: rgb(8 9 12 / .72); }
.viewer { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.viewer-img { background: var(--ground); display: grid; place-items: center; padding: 24px; }
.viewer-img img { width: 100%; max-width: 100%; height: auto; aspect-ratio: 4 / 5; border-radius: 6px; box-shadow: var(--shadow); }
.viewer-body { padding: 28px 28px 32px; display: grid; gap: 22px; align-content: start; overflow-y: auto; max-height: min(92vh, 900px); min-width: 0; }
.viewer-top { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
.viewer-body h2 { font-size: clamp(28px, 3.4vw, 40px); font-weight: 800; letter-spacing: -.025em; line-height: 1; margin-top: 6px; }
.viewer-body .style { color: var(--muted); }
.block { display: grid; gap: 8px; }
.swatches { display: flex; flex-wrap: wrap; gap: 8px; }
.swatch { display: flex; align-items: center; gap: 6px; font: 400 12px/1 var(--font-mono); color: var(--muted); }
.swatch i { width: 22px; height: 22px; border-radius: 4px; border: 1px solid var(--line); display: inline-block; }
.why { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.why li { display: grid; gap: 2px; }
.why b { font-weight: 700; }
.why span { color: var(--muted); font-size: 15px; }
.formula { font-size: 18px; font-weight: 600; line-height: 1.35; border-left: 3px solid var(--accent); padding-left: 14px; }
.fields { display: flex; flex-wrap: wrap; gap: 6px; }
.fields code { background: var(--ground); border: 1px solid var(--line); border-radius: 4px; padding: 3px 6px; font-size: 12px; }
.icon-btn { font: 500 13px/1 var(--font-mono); background: transparent; color: var(--ink); border: 1px solid var(--line); border-radius: 999px; padding: 9px 13px; cursor: pointer; white-space: nowrap; }
.viewer-nav { display: flex; gap: 8px; }
@media (max-width: 820px) {
  dialog { border-radius: 0; height: 100%; max-height: 100%; width: 100%; max-width: 100%; margin: 0; }
  .viewer { grid-template-columns: 1fr; }
  .viewer-img { padding: 16px max(16px, env(safe-area-inset-right, 0px)) 8px max(16px, env(safe-area-inset-left, 0px)); padding-top: calc(16px + env(safe-area-inset-top, 0px)); }
  .viewer-img img { max-width: 520px; }
  .viewer-body { max-height: none; padding: 20px max(16px, env(safe-area-inset-right, 0px)) calc(32px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
  dialog[open] { overflow-y: auto; }
}
@media (prefers-reduced-motion: reduce) { .shot img { transition: none; } }
</style>`;

  const chips = [`<button class="chip" type="button" data-goal="all" aria-pressed="true">All<span>${designs.length}</span></button>`]
    .concat(
      Object.entries(GOALS)
        .filter(([k]) => counts[k])
        .map(([k, v]) => `<button class="chip" type="button" data-goal="${k}" aria-pressed="false">${esc(v)}<span>${counts[k]}</span></button>`)
    )
    .join('\n      ');

  const cards = data
    .map(
      (d, i) => `<article class="design" data-goal="${d.goal}" id="d-${esc(d.num)}">
        <button class="shot" type="button" data-open="${i}" aria-label="Open ${esc(d.name)}"><img src="${esc(d.img)}" alt="${esc(d.name)} card design" width="1080" height="1350" loading="${i < 8 ? 'eager' : 'lazy'}" decoding="async"></button>
        <div class="design-meta">
          <div class="title-row"><span class="num">${esc(d.num)}</span><h3>${esc(d.name)}</h3></div>
          <p class="goal">${esc(GOALS[d.goal])}</p>
          <p class="best">${esc(d.bestFor)}</p>
          <p class="tags">${d.principles.map((p) => esc(p.name)).join(' · ')}</p>
        </div>
      </article>`
    )
    .join('\n      ');

  const research = principles
    .map(
      (p) => `<div class="research-row">
          <h3>${esc(p.name)}</h3>
          <p class="origin">${esc(p.origin)}</p>
          <p class="effect">${esc(p.effect)}</p>
          <div class="used">${p.designs.map((n) => `<button type="button" data-open-num="${esc(n)}" aria-label="Open design ${esc(n)}">${esc(n)}</button>`).join('')}</div>
        </div>`
    )
    .join('\n        ');

  const body = `<div class="wrap">
    <header>
      <p class="label">${designs.length} templates · 1080 × 1350 · 4:5 portrait</p>
      <h1>AI News Card Kit</h1>
      <p class="lede">Instagram card designs for AI news. Each one is built around named attention research: what makes people stop scrolling, read, save, send and comment. Tap a card for the reasoning, a headline formula and a caption tip.</p>
      <div class="filters" role="group" aria-label="Filter by goal">
      ${chips}
      </div>
    </header>

    <main class="grid" id="grid">
      ${cards}
    </main>

    <section aria-labelledby="use-h">
      <h2 id="use-h">Make a card from your news</h2>
      <p class="section-intro">Every design reads the same JSON fields, so one story can be rendered in all ${designs.length} styles and you pick the strongest.</p>
      <ol class="steps">
        <li>
          <h3>Write the story as JSON</h3>
          <p>Use the shared fields. Unused fields are ignored; missing ones fall back to the sample.</p>
          <pre>{
  "kicker": "NEW MODEL",
  "headline": "Your hook in under 12 words",
  "highlight": "under 12 words",
  "subhead": "One line of context.",
  "stat": "10×", "statLabel": "cheaper",
  "source": "Source: the lab's blog",
  "date": "Nov 9, 2026",
  "handle": "@yourhandle"
}</pre>
        </li>
        <li>
          <h3>Render</h3>
          <p>Playwright opens each template and saves a 1080 × 1350 PNG.</p>
          <pre>npm install
npx playwright install chromium
node render.js --data my-story.json --sheet</pre>
        </li>
        <li>
          <h3>Pick and post</h3>
          <p>Compare the contact sheet, post the winner, and use the card's caption tip. Recolour any design with <code>"theme": { "--accent": "#00E5FF" }</code>.</p>
          <pre>node render.js --data my-story.json --only 02,09</pre>
        </li>
      </ol>
    </section>

    <section aria-labelledby="sci-h">
      <h2 id="sci-h">The research behind the designs</h2>
      <p class="section-intro">The principles these cards apply, where each comes from, and which designs use it. Tap a number to open that card.</p>
      <div class="research">
        <div class="research-row head"><span class="label">Principle</span><span class="label">Origin</span><span class="label">On a card</span><span class="label">Used in</span></div>
        ${research}
      </div>
    </section>

    <p class="note">Sample headlines, names and numbers on these cards are fictional placeholders. Replace them with your own verified news before posting. Full-size PNGs are in the <a href="${REPO_OUTPUT_URL}" target="_blank" rel="noopener">repository's output folder</a>.</p>
  </div>

  <dialog id="viewer" aria-labelledby="v-name">
    <div class="viewer">
      <div class="viewer-img"><img id="v-img" alt="" width="1080" height="1350"></div>
      <div class="viewer-body">
        <div class="viewer-top">
          <div><p class="label" id="v-num"></p><h2 id="v-name"></h2></div>
          <div class="viewer-nav">
            <button class="icon-btn" type="button" id="v-prev" aria-label="Previous design">←</button>
            <button class="icon-btn" type="button" id="v-next" aria-label="Next design">→</button>
            <button class="icon-btn" type="button" id="v-close">Close</button>
          </div>
        </div>
        <p class="goal" id="v-goal"></p>
        <p class="style" id="v-style"></p>
        <div class="block"><p class="label">Best for</p><p id="v-best"></p></div>
        <div class="block"><p class="label">Why it works</p><ul class="why" id="v-why"></ul></div>
        <div class="block"><p class="label">Headline formula</p><p class="formula" id="v-hook"></p></div>
        <div class="block"><p class="label">Caption tip</p><p id="v-caption"></p></div>
        <div class="block"><p class="label">Palette</p><div class="swatches" id="v-palette"></div></div>
        <div class="block"><p class="label">Type</p><p id="v-fonts"></p></div>
        <div class="block"><p class="label">Fields</p><div class="fields" id="v-fields"></div></div>
        <div class="block"><p class="label">Render it</p><pre id="v-cmd"></pre></div>
      </div>
    </div>
  </dialog>

  <script type="application/json" id="designs-data">${JSON.stringify({ designs: data, goals: GOALS }).replace(/</g, '\\u003c')}</script>
  <script>
  (function () {
    var payload = JSON.parse(document.getElementById('designs-data').textContent);
    var designs = payload.designs, goals = payload.goals;
    var dlg = document.getElementById('viewer');
    var current = 0;
    function $(id) { return document.getElementById(id); }
    function text(id, v) { $(id).textContent = v || ''; }
    function show(i) {
      current = (i + designs.length) % designs.length;
      var d = designs[current];
      $('v-img').src = d.img;
      $('v-img').alt = d.name + ' card design';
      text('v-num', d.num + ' / ' + designs.length);
      text('v-name', d.name);
      text('v-goal', goals[d.goal]);
      text('v-style', d.style);
      text('v-best', d.bestFor);
      text('v-hook', d.hookFormula);
      text('v-caption', d.captionTip);
      text('v-fonts', d.fonts.join(', '));
      text('v-cmd', 'node render.js --only ' + d.num + ' --data my-story.json');
      var why = $('v-why'); why.innerHTML = '';
      d.principles.forEach(function (p) {
        var li = document.createElement('li');
        var b = document.createElement('b'); b.textContent = p.name;
        var s = document.createElement('span'); s.textContent = p.how || '';
        li.appendChild(b); li.appendChild(s); why.appendChild(li);
      });
      var pal = $('v-palette'); pal.innerHTML = '';
      d.palette.forEach(function (c) {
        var w = document.createElement('span'); w.className = 'swatch';
        var i2 = document.createElement('i'); i2.style.background = c;
        w.appendChild(i2); w.appendChild(document.createTextNode(c)); pal.appendChild(w);
      });
      var f = $('v-fields'); f.innerHTML = '';
      d.fields.forEach(function (x) { var c = document.createElement('code'); c.textContent = x; f.appendChild(c); });
      if (!dlg.open) dlg.showModal();
      dlg.querySelector('.viewer-body').scrollTop = 0;
      dlg.scrollTop = 0;
    }
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-open],[data-open-num]');
      if (!t) return;
      if (t.hasAttribute('data-open')) show(+t.getAttribute('data-open'));
      else {
        var n = t.getAttribute('data-open-num');
        for (var i = 0; i < designs.length; i++) if (designs[i].num === n) { show(i); break; }
      }
    });
    $('v-close').addEventListener('click', function () { dlg.close(); });
    $('v-prev').addEventListener('click', function () { show(current - 1); });
    $('v-next').addEventListener('click', function () { show(current + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    var chips = document.querySelectorAll('.chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var g = chip.getAttribute('data-goal');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        document.querySelectorAll('.design').forEach(function (el) {
          el.hidden = g !== 'all' && el.getAttribute('data-goal') !== g;
        });
      });
    });
  })();
  </script>`;

  if (!standalone) return `${head}\n${body}\n`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
</head>
<body>
${body}
</body>
</html>
`;
}

function catalogMarkdown(designs) {
  const rows = designs.map(
    (d) =>
      `| ${d.num} | **${d.name}** | ${GOALS[d.goal]} | ${d.bestFor.replace(/\|/g, '/')} | ${d.principles.map((p) => p.name).join('; ').replace(/\|/g, '/')} | [card](designs/${d.id}/card.html) · [png](output/${d.id}.png) |`
  );
  return ['| # | Design | Goal | Best for | Attention principles | Files |', '|---|---|---|---|---|---|', ...rows].join('\n');
}

function main() {
  const argv = process.argv.slice(2);
  const designs = loadDesigns();
  if (!designs.length) {
    console.error('No designs found.');
    process.exit(1);
  }
  const ai = argv.indexOf('--artifact');
  if (ai !== -1) {
    const dir = path.resolve(argv[ai + 1] || 'artifact');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), page(designs, { imgSrc: (d) => `cards/${d.id}.jpg`, standalone: false }));
    console.log(`✓ ${path.join(dir, 'index.html')}`);
    return;
  }
  fs.writeFileSync(path.join(ROOT, 'gallery.html'), page(designs, { imgSrc: (d) => `output/${d.id}.png`, standalone: true }));
  console.log('✓ gallery.html');

  const readme = path.join(ROOT, 'README.md');
  if (fs.existsSync(readme)) {
    const src = fs.readFileSync(readme, 'utf8');
    const start = '<!-- catalog:start -->';
    const end = '<!-- catalog:end -->';
    if (src.includes(start) && src.includes(end)) {
      const out = src.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n${catalogMarkdown(designs)}\n${end}`);
      fs.writeFileSync(readme, out);
      console.log('✓ README.md catalog');
    }
  }
}

main();
