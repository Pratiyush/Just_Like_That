# AI News Card Kit

Twenty Instagram card templates for AI news. Each design is built around named findings from attention and sharing research (what makes people stop scrolling, read, save, send and comment) and renders to a ready-to-post **1080 × 1350 PNG** (Instagram's 4:5 portrait, the largest feed format).

![All 20 designs](output/contact-sheet.png)

Open [`gallery.html`](gallery.html) in a browser to browse the designs with the reasoning, a headline formula and a caption tip for each.

> The headlines, names and numbers on the sample cards are fictional placeholders. Swap in your own verified news before posting.

## Quick start

```bash
cd ai-news-cards
npm install                      # installs Playwright
npx playwright install chromium  # one-time browser download

node render.js                   # every design with its sample content  -> output/
node render.js --sheet           # ...plus output/contact-sheet.png
```

### Render your own story

Write the story once as JSON using the [shared fields](#fields) and render it in every style:

```bash
node render.js --data examples/example-story.json --sheet
# -> output/example-story/01-breaking-alert.png ... 20-blueprint.png + contact-sheet.png
```

Then pick the strongest card. Useful options:

| Option | What it does |
|---|---|
| `--only 02,09` | Render only these designs (number prefix or part of the name) |
| `--data file.json` | Your content. One object, or an array of stories (each can set `"slug"` for its folder and `"designs": ["02"]`) |
| `--out dir` | Output folder (default `output/`) |
| `--scale 2` | 2× pixel density (2160 × 2700) |
| `--jpg` | JPEG instead of PNG |
| `--sheet` | Contact sheet of everything rendered |

Missing fields fall back to the design's sample content and empty fields are hidden, so you only need to fill in the fields a design uses (listed in the catalog below and in each `designs/*/meta.json`).

**Quick preview without rendering:** open any `designs/NN-name/card.html` in a browser. Override text with URL parameters, e.g. `card.html?headline=Hello%20world&kicker=NEW`.

**Recolour a design:** add `"theme": { "--accent": "#00E5FF" }` to your JSON. Each design exposes its colours as CSS variables at the top of its `<style>`.

### Fields

| Field | Meaning |
|---|---|
| `kicker` | Short category label: "BREAKING", "NEW MODEL" |
| `headline` | The hook. Aim for 12 words or fewer |
| `highlight` | Word(s) in the headline to emphasise (or wrap them in `**double asterisks**`) |
| `subhead` | One or two sentences of context |
| `body` | Longer paragraph (Front Page) |
| `stat`, `statLabel` | A big number and what it measures |
| `points` | List of short takeaways or tips |
| `source`, `date`, `handle`, `brand`, `cta` | Credits and call to action |
| `quote`, `author`, `authorRole` | Quote Card |
| `question`, `options` | Hot Question |
| `myth`, `fact` | Myth vs Fact |
| `items` | Bento Digest: `[{ "tag": "", "title": "" }]` |
| `chart`, `chartUnit`, `chartHighlight`, `annotation` | Data Story: `chart` is `[{ "label": "", "value": 0 }]` |
| `left`, `right`, `verdict` | Versus: `{ "name": "", "tag": "", "stats": [{ "label": "", "value": "" }] }` |
| `paper`, `tldr` | Blueprint |
| `ticker`, `slideCount`, `exclaim`, `sticker`, `issue` | Style extras |

Use `\n` in any text to force a line break. Long text shrinks automatically to fit.

## The 20 designs

<!-- catalog:start -->
| # | Design | Goal | Best for | Attention principles | Files |
|---|---|---|---|---|---|
| 01 | **Breaking Alert** | Stop the scroll | Breaking announcements, model launches, surprise releases, major industry events: anything that is new right now and worth sending to someone. | Pre-attentive processing (Treisman & Gelade, 1980); Isolation (Von Restorff) effect (von Restorff, 1933); Urgency and timeliness (scarcity of time, one of Cialdini's levers, 1984); High-arousal emotion drives sharing (Berger & Milkman, 2012) | [card](designs/01-breaking-alert/card.html) · [png](output/01-breaking-alert.png) |
| 02 | **Stat Bomb** | Stop the scroll | Benchmarks, funding rounds, user counts, cost drops: any story where one number is the news. Shorter stats set bigger, so write "$4.2B" rather than "$4,200,000,000". Currency signs, %, ×, and unit letters (B, M, K, hrs) are automatically set smaller so the digits get the scale. | Isolation (Von Restorff) effect; Pre-attentive size contrast; Hick's law (one focal point) | [card](designs/02-stat-bomb/card.html) · [png](output/02-stat-bomb.png) |
| 03 | **Terminal** | Get sent | Model releases, dev tools, open-source drops and API launches: news a developer would forward to their team chat. | STEPPS: social currency and in-group identity; Novelty seeking; Information-gap curiosity; Isolation (Von Restorff) effect | [card](designs/03-terminal/card.html) · [png](output/03-terminal.png) |
| 04 | **Swiss Editorial** | Build trust | Serious analysis: research findings and their implications, policy and regulation, benchmark audits, 'what this actually means' explainers. | Processing fluency (Reber & Schwarz, 1999); Authority (Cialdini, 1984); Aesthetic-usability effect (Kurosu & Kashimura, 1995); F-shaped scanning (Nielsen, 2006 eye-tracking) | [card](designs/04-swiss-editorial/card.html) · [png](output/04-swiss-editorial.png) |
| 05 | **Aurora Glass** | Stop the scroll | Product and model launches, new features and capability upgrades: news that should feel like the future just arrived. | Aesthetic-usability effect (Kurosu & Kashimura, 1995); Awe drives sharing (Berger & Milkman, 2012); Figure-ground (Gestalt; Wertheimer, 1923); First-impression speed (Lindgaard et al., 2006) | [card](designs/05-aurora-glass/card.html) · [png](output/05-aurora-glass.png) |
| 06 | **Neo-Brutal** | Drive comments | Hot takes, opinions, contrarian calls and quirky AI news that people will want to argue about or send to a friend. | Novelty seeking / pattern interrupt (Bunzeck & Düzel, 2006); Isolation (Von Restorff) effect (von Restorff, 1933); Social currency (STEPPS; Berger, Contagious, 2013); Gestalt continuation and common region (Wertheimer, 1923; Palmer, 1992) | [card](designs/06-neo-brutal/card.html) · [png](output/06-neo-brutal.png) |
| 07 | **Myth vs Fact** | Get sent | Debunking hype and common misconceptions about AI: what detectors, chatbots, bigger models or 'AI will take every job' claims can and can't actually do. | Cognitive dissonance / expectation violation (Festinger, 1957); Contrast and isolation (Von Restorff effect, von Restorff, 1933); Information-gap curiosity (Loewenstein, 1994); Practical value drives sends and saves (STEPPS, Berger, 2013) | [card](designs/07-myth-vs-fact/card.html) · [png](output/07-myth-vs-fact.png) |
| 08 | **Quote Card** | Build trust | Attributable quotes from researchers, founders and policymakers: keynote lines, interview pull-quotes, hearing testimony, a paper author explaining what a result means. | Authority (Cialdini, 1984); Stories / human voice (STEPPS: Berger, Contagious, 2013); Picture superiority / dual coding (Paivio, 1971); Processing fluency (Reber & Schwarz, 1999) | [card](designs/08-quote-card/card.html) · [png](output/08-quote-card.png) |
| 09 | **Cheat Sheet** | Earn saves | Tool lists, prompt tips and how-tos ('5 AI tools that...', 'Stop typing X, do this instead'). Works with 3 to 6 points. | STEPPS: practical value (Berger, 2013); Chunking (Miller, 1956; Cowan, 2001); Serial position effect (Murdock, 1962); Picture superiority / dual coding (Paivio, 1971) | [card](designs/09-cheat-sheet/card.html) · [png](output/09-cheat-sheet.png) |
| 10 | **Carousel Hook** | Hold attention | The first slide of a multi-slide explainer: a model doing something unexpected, a research result unpacked step by step, a 'how it works' breakdown or a ranked list whose answers live on the following slides. | Zeigarnik effect / open loops (Zeigarnik, 1927); Information-gap curiosity (Loewenstein, 1994); Gestalt continuation (Wertheimer, 1923); High-arousal emotion drives sharing (Berger & Milkman, 2012) | [card](designs/10-carousel-hook/card.html) · [png](output/10-carousel-hook.png) |
| 11 | **Front Page** | Stop the scroll | Historic milestones and 'this changes everything' stories: a model doing something for the first time, a record broken, a launch people will remember the date of. | Novelty seeking / expectation violation (Bunzeck & Düzel, 2006); Authority (Cialdini, 1984); Nostalgia as a positive emotion (Wildschut, Sedikides, Arndt & Routledge, 2006); Picture superiority / dual coding (Paivio, 1971) | [card](designs/11-front-page/card.html) · [png](output/11-front-page.png) |
| 12 | **Neon Grid** | Stop the scroll | Robotics, AGI talk, futuristic breakthroughs and AI hardware (chips, humanoids, compute): news that should feel like the future arriving. The stat is printed on the sun, so keep it to about 5 characters ("4:12", "40×", "1M"); longer values still fit but shrink. Long headlines automatically switch to sentence case and lower the horizon to give the copy more sky. | Novelty seeking; High-arousal emotion drives sharing; Pre-attentive processing; Pattern interrupt | [card](designs/12-neon-grid/card.html) · [png](output/12-neon-grid.png) |
| 13 | **Minimal Luxe** | Build trust | Major announcements, premium brand moments and a single profound line: a flagship model launch, a landmark result, a milestone, a year-in-review statement. | Isolation (Von Restorff) effect; Hick's law; Aesthetic-usability effect; Processing fluency | [card](designs/13-minimal-luxe/card.html) · [png](output/13-minimal-luxe.png) |
| 14 | **Data Story** | Build trust | Benchmark results, adoption trends, cost and price curves, latency or efficiency comparisons: any story where one number in a short series (4 to 8 values) is the news. | Picture superiority / dual coding (Paivio, 1971); Pre-attentive processing (Treisman & Gelade, 1980); Isolation (Von Restorff) effect (von Restorff, 1933); Authority: credibility of data (Cialdini, 1984) | [card](designs/14-data-story/card.html) · [png](output/14-data-story.png) |
| 15 | **Versus** | Drive comments | Model vs model, company vs company, open vs closed, human vs AI: any story that is really a head-to-head with two or three comparable numbers per side. | Social identity / in-group bias (Tajfel & Turner, 1979); Pre-attentive processing via complementary colour contrast (Treisman & Gelade, 1980); Contrast principle (Cialdini, 1984); Commitment & consistency (Cialdini, 1984) | [card](designs/15-versus/card.html) · [png](output/15-versus.png) |
| 16 | **Pop Comic** | Get sent | Surprising, funny or weird AI news: agents doing absurd things, robots with unexpected habits, delightful failures and 'wait, really?' research results. | Gaze cueing (Friesen & Kingstone, 1998); Amusement drives sharing (Berger & Milkman, 2012); Novelty / pattern interrupt (Bunzeck & Düzel, 2006); Picture superiority / dual coding (Paivio, 1971) | [card](designs/16-pop-comic/card.html) · [png](output/16-pop-comic.png) |
| 17 | **Hot Question** | Drive comments | Ethical debates, predictions and "would you...?" prompts sparked by an AI news story: anything where people will happily pick a side in the comments. | Self-reference effect (Rogers, Kuiper & Kirker, 1977); Commitment & consistency (Cialdini, 1984); Information-gap curiosity (Loewenstein, 1994); Comments as an engagement signal; Isolation (Von Restorff) effect | [card](designs/17-hot-question/card.html) · [png](output/17-hot-question.png) |
| 18 | **Bento Digest** | Earn saves | Weekly roundups and "5 things that happened in AI this week" digests: 4–6 short stories, each boiled down to a tag and a one-line takeaway. | Chunking (Miller, 1956; Cowan, 2001); Gestalt common region & proximity (Palmer, 1992; Wertheimer, 1923); Practical value drives saves (STEPPS; Berger, 2013); First-impression speed (Lindgaard et al., 2006) | [card](designs/18-bento-digest/card.html) · [png](output/18-bento-digest.png) |
| 19 | **Hazard** | Get sent | AI scams, deepfakes, voice cloning, privacy and security risks: any story where the reader can do something concrete to protect themselves or the people they care about. | Negativity bias (Baumeister et al., 2001); Loss aversion (Kahneman & Tversky, 1979); Yellow/black as a pre-attentive warning signal (aposematism; Treisman & Gelade, 1980); Practical value drives sends (STEPPS: Berger, Contagious, 2013) | [card](designs/19-hazard-warning/card.html) · [png](output/19-hazard-warning.png) |
| 20 | **Blueprint** | Stop the scroll | Research paper breakdowns and technical explainers: a new architecture, training trick or benchmark result where 'how it works' is the hook. | Picture superiority / dual coding (Paivio, 1971); Authority of a scientific aesthetic (Cialdini, 1984); Information-gap curiosity (Loewenstein, 1994); Chunking (Miller, 1956; Cowan, 2001) | [card](designs/20-blueprint/card.html) · [png](output/20-blueprint.png) |
<!-- catalog:end -->

## Why these designs work

A feed is a stream of near-identical rectangles, and a card has roughly a second to earn attention. The designs lean on well-established findings rather than folklore:

- **Stop the scroll.** Colour, size and orientation are processed *pre-attentively*, before reading starts (Treisman & Gelade, 1980), and visual appeal is judged in about 50 ms (Lindgaard et al., 2006). Every card has one dominant element in strong contrast, and the one thing that differs is what gets remembered (the Von Restorff isolation effect).
- **Make it easy to read.** Text that is easy to process feels more true and more likeable (*processing fluency*, Reber & Schwarz, 1999). All designs keep headlines big, short and high-contrast, and test that they still read at feed-thumbnail size.
- **Open a loop.** A specific gap in knowledge creates an urge to close it (Loewenstein, 1994), and unfinished things nag (Zeigarnik, 1927). That's the engine of the Carousel Hook, Myth vs Fact and Hot Question cards.
- **Pick the right emotion.** High-arousal emotions such as awe, excitement, amusement and anxiety drive sharing far more than calm ones (Berger & Milkman, 2012). Negative information and potential losses grab attention fastest (Baumeister et al., 2001; Kahneman & Tversky, 1979).
- **Be worth saving or sending.** People share what makes them look informed (*social currency*) and what is useful to others (*practical value*) (Berger, 2013). Instagram's head, Adam Mosseri, has said publicly that sends and saves are strong ranking signals, especially for reaching people who don't follow you yet. The Cheat Sheet, Bento Digest, Blueprint and Hazard cards are built for that.
- **Show, don't only tell.** Pictures plus words beat words alone in memory (Paivio, 1971), and three to five chunks is what working memory comfortably holds (Miller, 1956; Cowan, 2001).

The gallery has the full research index, mapping each principle to the designs that use it.

### Posting playbook

1. **Pick the card by goal.** Breaking news: Breaking Alert, Stat Bomb, Neon Grid. Explainers: Carousel Hook, Blueprint. Saves: Cheat Sheet, Bento Digest. Comments: Hot Question, Versus, Neo-Brutal. Credibility: Swiss Editorial, Data Story, Quote Card.
2. **Write the headline first** using the design's hook formula. Specific beats vague: a number, a named consequence, or a direct "you".
3. **Keep one focal point.** If you need more than about 12 words, use a carousel instead of a denser card.
4. **Caption:** repeat the hook in the first line (it's what shows before "more"), add one line of context and the source, and close with a single ask: save, send, or answer.
5. **Stay consistent.** Use the same `handle`, `brand` and two or three designs as your series look; repeated exposure builds recognition (Zajonc, 1968).
6. **Verify before posting.** Credibility is the asset an AI news account compounds; always cite the source on the card.

## Project layout

```
ai-news-cards/
  designs/NN-name/card.html   a template (HTML + CSS, sample content in a JSON block)
  designs/NN-name/meta.json   style, palette, fonts, principles, hook formula, caption tip, fields
  designs/_starter/           copy this to make a new design
  shared/card.js              binds JSON to the template, highlights words, auto-fits text
  shared/base.css             1080 × 1350 canvas and preview scaling
  render.js                   Playwright renderer
  build-gallery.js            rebuilds gallery.html and the catalog above from meta.json
  examples/                   example story and stress-test content
  output/                     rendered PNGs
  docs/DESIGN_SPEC.md         the contract every design follows
```

### Add your own design

Copy `designs/_starter` to `designs/21-your-name`, follow [`docs/DESIGN_SPEC.md`](docs/DESIGN_SPEC.md), then run:

```bash
node render.js --only 21 --data examples/stress-long.json --out /tmp/check   # make sure long text fits
node build-gallery.js                                                         # refresh gallery + catalog
```
