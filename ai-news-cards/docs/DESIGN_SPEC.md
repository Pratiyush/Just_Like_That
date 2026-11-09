# Card design spec

The contract every design in `designs/` follows. Read this before building or changing a design.

## 1. Format

| Thing | Rule |
|---|---|
| Canvas | `#card`, exactly **1080 × 1350 px** (Instagram 4:5 portrait, the largest feed format: it covers the most screen and holds the thumb longest). |
| Safe zone | Keep all text and key graphics **≥ 72 px from the left/right edges** and **≥ 72 px from top/bottom**. The profile grid previews posts cropped to 3:4, which cuts ~34 px off each side. Backgrounds and decoration may bleed to the edges. |
| Phone legibility | In the feed the card shows at about one third of its size. Minimum sizes at 1080 px: **headline ≥ 64 px** even after auto-shrink, **body ≥ 34 px**, **small print (handle, source, date) ≥ 26 px**. Text contrast **≥ 4.5 : 1** against what's behind it. |
| Thumbnail test | The headline and the single focal element must still read at 360 px wide (that's what `--sheet` produces). |
| Images | No external images or photos. Build everything from CSS, inline SVG, and SVG data URIs (noise textures, patterns, icons). Don't use emoji as key graphics (they render differently per OS); use inline SVG icons. |
| Fonts | Google Fonts are allowed: `<link href="https://fonts.googleapis.com/css2?family=...&display=block" rel="stylesheet">`. Always add fallbacks. Installed locally: Inter, Inter Display, JetBrains Mono, DejaVu, Liberation, Noto Color Emoji. Pick fonts that suit the style; don't default to Inter. |

## 2. File layout

```
designs/NN-slug/
  card.html    the template (self-contained except for ../../shared/*)
  meta.json    name, palette, fonts, the attention science it uses, fields it reads
```

`card.html` skeleton (see `designs/_starter/card.html` for a working copy):

```html
<link rel="stylesheet" href="../../shared/base.css">
<style> #card { ... } </style>
<div id="card"> ... elements with data-field / data-list ... </div>
<script type="application/json" id="card-data"> { sample content } </script>
<script src="../../shared/card.js"></script>
<script> /* optional: Card.onRender(function (data, card) { ... }) */ </script>
```

Rules:
- All visible text comes from the JSON (`data-field`, `data-list`, or `Card.onRender`). No hard-coded copy in the markup, except purely decorative labels that never change (e.g. "VS", "MYTH", "FACT", a masthead's "Vol. 1"), and even those are better as fields.
- Missing optional fields must not break the layout (`card.js` hides empty elements; check the design still looks intentional).
- Long and short content must both look good. Put `data-fit` on the headline (and on any other free-text block that could run long) inside a box with a constrained height (`flex: 1; min-height: 0; overflow: hidden;` or a fixed height). Use unitless `line-height` and `em` letter-spacing so they scale with font size.
- Theme colours live in CSS custom properties on `#card` (`--bg`, `--fg`, `--accent`, ...) so users can recolour via `"theme": {"--accent": "#00e5ff"}`.

## 3. Data binding (`shared/card.js`)

| Attribute | Effect |
|---|---|
| `data-field="path"` | Fill text from data (`headline`, `left.name`, `points.0`). Empty value hides the element (`data-keep` to keep it). |
| `data-highlight` | Wrap `data.highlight` (string or array) inside the text in `<mark class="hl">`. Also `**word**` in any text becomes `<mark class="hl">`. Style `.hl` in your design. |
| `data-if="path"` | Hide this wrapper when `path` is empty. |
| `data-list="path"` | Repeat the first child per array item. Inside it: `data-item` (item text) / `data-item="key"` (item[key]) / `data-item-index="2"` (1-based index, zero-padded). Each clone gets `--i` and `data-index`; the list gets `--count`. |
| `data-fit` | Shrink font-size until text fits its own box. `data-fit-max="140"` (start size, lets short text grow), `data-fit-min="64"` (floor). |
| `Card.onRender(fn)` | Custom JS (charts, SVG) after binding, before fitting. `fn(data, cardEl)`. |

Text supports `\n` for a forced line break.

### Shared field names

Use these names when the meaning matches, so one news JSON can feed many designs:

| Field | Meaning |
|---|---|
| `brand` | Account / series name (e.g. "AI Brief") |
| `handle` | `@yourhandle` |
| `kicker` | Short category label: "BREAKING", "NEW MODEL", "RESEARCH" |
| `headline` | The hook. Aim for ≤ 12 words. |
| `highlight` | Word(s) in the headline to emphasise |
| `subhead` | 1–2 sentence context line |
| `body` | Longer paragraph (only if the style needs it) |
| `stat`, `statLabel` | A big number and what it measures |
| `points` | Array of short strings (key takeaways, tips, findings) |
| `source` | "Source: ..." |
| `date` | "Nov 9, 2026" |
| `cta` | Call to action: "Save this for later", "Follow for daily AI news" |
| `quote`, `author`, `authorRole` | Quote cards |
| `question`, `options` | Poll / question cards |
| `myth`, `fact` | Myth-vs-fact cards |
| `items` | Array of objects `{ "tag": "", "title": "" }` for digests |
| `chart`, `chartUnit`, `chartHighlight`, `annotation` | Chart cards: `chart` = `[{ "label": "", "value": 0 }]` |
| `left`, `right`, `verdict` | Versus cards: `{ "name": "", "tag": "", "stats": [{ "label": "", "value": "" }] }` |
| `tldr`, `paper` | Research breakdowns |
| `ticker`, `slideCount`, `exclaim`, `sticker` | Style-specific extras |

Design-specific fields are fine; list them in `meta.json`.

### Sample content rules

The JSON in each design is placeholder copy that shows off the layout. It must be:
- **Fictional or generic.** No real companies, products, models, or people. Use invented names ("Nova Labs", "Helix-3") or generic phrasing ("A new open-source model..."). Nobody should be able to mistake a sample for a real news report.
- Written like a strong hook (curiosity gap, specific number, "you", contrast), because the sample is also a copywriting example.
- `handle` = `"@yourhandle"`, `brand` = `"AI Brief"`, `date` = `"Nov 9, 2026"`.

## 4. The attention science

Every design deliberately applies 2–4 named principles and says how in `meta.json`. Name the effect and its origin (researcher, year) only when it's well established; never invent statistics or citations. Reference list:

| Principle | Origin | Card use |
|---|---|---|
| Pre-attentive processing | Treisman & Gelade, 1980 | Colour, size, orientation are noticed before conscious reading: one strong contrast element stops the scroll. |
| Isolation (Von Restorff) effect | von Restorff, 1933 | The one item that differs is noticed and remembered. Isolate the key word/number. |
| First-impression speed | Lindgaard et al., 2006 | Visual appeal is judged in ~50 ms; the design must read as "worth it" before any words are read. |
| Information-gap curiosity | Loewenstein, 1994 | A specific gap ("...and nobody expected #3") creates an itch to close it. |
| Zeigarnik effect / open loops | Zeigarnik, 1927 | Unfinished things nag: carousel cues, "1/5", cut-off elements. |
| Processing fluency | Reber & Schwarz, 1999 | Easy-to-read text feels truer and more likeable: big, high-contrast, simple. |
| High-arousal emotion drives sharing | Berger & Milkman, 2012 | Awe, excitement, anxiety, amusement get shared more than low-arousal content. |
| STEPPS | Berger, *Contagious*, 2013 | Social currency, triggers, emotion, public, practical value, stories. |
| Negativity bias / loss aversion | Baumeister et al., 2001; Kahneman & Tversky, 1979 | Threats and potential losses grab attention faster than gains. |
| Picture superiority / dual coding | Paivio, 1971 | Visual + verbal encoding is remembered better than text alone. |
| Chunking | Miller, 1956; Cowan, 2001 | Working memory holds ~4 chunks: 3–5 items per card. |
| Serial position effect | Murdock, 1962 | First and last items are remembered best. |
| Gestalt grouping | Wertheimer, 1923; Palmer, 1992 (common region) | Proximity, common region, figure-ground, continuation organise the card at a glance. |
| Gaze cueing | Friesen & Kingstone, 1998 | Eyes (even cartoon ones) pull attention in the direction they look. |
| Self-reference effect | Rogers, Kuiper & Kirker, 1977 | Information about "you" is processed more deeply. |
| Cialdini's levers | Cialdini, 1984 | Authority, social proof, commitment & consistency, scarcity. |
| Aesthetic-usability effect | Kurosu & Kashimura, 1995 | Beautiful designs are perceived as easier and more credible. |
| Hick's law | Hick, 1952 | Fewer elements → faster decision → one clear focal point. |
| Novelty seeking | Bunzeck & Düzel, 2006 | Novel stimuli activate the brain's reward system: unexpected formats get a second look. |
| Mere-exposure effect | Zajonc, 1968 | Consistent brand placement builds familiarity and trust over time. |

Platform behaviour worth designing for: Instagram's head Adam Mosseri has said publicly that **sends (shares in DMs)** and **saves** are strong ranking signals, especially for reaching people who don't follow you. Practical-value and "send this to a friend" designs are built for that.

## 5. `meta.json`

```json
{
  "id": "02-stat-bomb",
  "name": "Stat Bomb",
  "style": "One-sentence description of the visual style",
  "palette": ["#0B0B0F", "#C6FF00", "#FFFFFF"],
  "fonts": ["Archivo Black", "Inter"],
  "bestFor": "What kind of AI news this card suits",
  "principles": [
    { "name": "Isolation (Von Restorff) effect", "how": "How this specific design applies it" }
  ],
  "hookFormula": "A fill-in-the-blank headline pattern that suits this card",
  "captionTip": "One tip for the Instagram caption that pairs with this card",
  "fields": ["kicker", "headline", "highlight", "stat", "statLabel", "source", "handle"]
}
```

## 6. QA before calling a design done

```bash
node render.js --only NN                                          # sample -> output/NN-slug.png
node render.js --only NN --data examples/stress-long.json  --out <scratch>/NN
node render.js --only NN --data examples/stress-short.json --out <scratch>/NN
node render.js --only NN --sheet --out <scratch>/NN/thumb         # 360 px thumbnail check
```

Look at every PNG. Pass criteria: render log shows `✓` (no overflow warnings, failed font requests, or JS errors); nothing overlaps or clips; long text shrinks gracefully and short text doesn't leave the card looking empty; the design still reads at thumbnail size. Also stress your design-specific fields with a long-content JSON of your own.
