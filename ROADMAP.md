# Road to live · matcheque.de

The plan from prototype to the live author website for Josie H Matchèque.
Design proposal and reasoning: [Matchèque Redesign](https://claude.ai/artifact/7Q65H15eijs6cLMXKDkcUk) (private, share via its Share menu).

**Legend:** `[x]` done · `[ ]` open
**Who:** Igor · Josie · Claude

---

## Where we are

- 9 Oct 2026: Direction **C · Erster Satz** chosen. All other recommendations from the proposal adopted.
- 9 Oct 2026: New site built. It runs locally with `npm start`. Every text Josie still has to write shows up as a yellow placeholder.
- 12 Oct 2026: **Live on https://matcheque.de** as a test run. Pages deploys through GitHub Actions on every push to `main`.
- 12 Oct 2026: Josie’s texts, files and new portrait are in. Paper redesign (“schrullig, verkopft, altmodisch”), *Alma Mater* replaces *Diamanten*, rotating quote gallery, “Sie” everywhere. No placeholders left.
- The old Bootstrap prototype stays in git history (last commit `371b59a`).

## Decisions

| Decision | Value |
|---|---|
| Design direction | C · Erster Satz, on warm paper: one typeface (Literata) with small caps, italics, ornaments and double rules |
| Stack | Eleventy 3, texts in YAML/Markdown, GitHub Actions → GitHub Pages, domain and Cloudflare unchanged |
| Books, newest first | *Alma Mater* (sample: prologue and chapters 1–4), *Waten in Zement* (sequel to *Ich fahr dich.*, sample: prologue and chapters 1–3), *Der Pfau* (complete, free), *Ich fahr dich.* (sample: chapters 1–3) |
| Downloads | Josie’s own EPUB/PDF files, with corrected metadata. The *Alma Mater* PDF is generated (Typst, A5) because there was none |
| License | CC BY-NC-ND 4.0: sharing allowed with credit, no sale, no changes |
| Name | Josie H. Matchèque (with the dot) |
| Address | “Sie” everywhere |
| Covers | Typographic title pages in one color per book |
| Download counting | **open (Igor)**: GoatCounter suggested, off until an account exists |

---|---|---|
| Design direction | decided | C · Erster Satz: the homepage is the first sentences of her books |
| Stack | decided | Eleventy 3, texts in YAML/Markdown, GitHub Actions → GitHub Pages, domain and Cloudflare unchanged |
| Downloads | decided | Public reading samples (web, EPUB, PDF). Full manuscripts only on request by email |
| Covers | decided | Typographic title pages in one color per book. The old picture covers are retired |
| Fonts | decided | Literata (text) and Schibsted Grotesk (interface), self-hosted |
| PDFs and preview images | decided | Typst (no browser needed), EPUB via pandoc |
| Sample length | default | Ich fahr dich.: chapters 1–4 (≈ 29 Normseiten). Der Pfau: # 1–# 4 (≈ 24 Normseiten). Change `leseprobe.kapitel` in the book’s YAML |
| First sentences | default | The real first sentences, read from the manuscripts. Josie can set `ersterSatz` per book |
| Name spelling | **open (Josie)** | Site uses “Josie H Matchèque” for now. One setting in `src/_data/site.yaml` |
| du / Sie | default | “du” for readers, the agents page avoids direct address |
| Download counting | **open (Igor)** | GoatCounter suggested. Stays off until an account exists |

---

## Phase 1 · Foundation (Claude) ✓

- [x] Eleventy 3 project: `src/` → `_site/`, Nunjucks layouts, YAML data files
- [x] Design tokens on warm paper (light only), per-book colors
- [x] Self-hosted, subsetted Literata with small caps and old-style figures
- [x] Image pipeline (AVIF/WebP/JPEG, responsive sizes)
- [x] GitHub Actions workflow that builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`)
- [x] Cleanup: Bootstrap, old HTML pages, `.phone-preview/` removed; `output/` untracked; `.gitignore`
- [x] Full manuscripts moved out of the repo into `manuskripte/` (local only, git-ignored)

## Phase 2 · Pages and samples (Claude) ✓

- [x] Homepage: one first sentence per screen, book title and link underneath
- [x] Book pages with typographic title page, motto, facts, opening paragraph, sample and downloads
- [x] Leseprobe reader in the browser (progress bar, book typography, drop caps, parts and chapter subtitles)
- [x] Sample files: A5 PDF (Typst) and EPUB (pandoc) with correct metadata and title-page cover
- [x] Werkverzeichnis (`/buecher/`)
- [x] Über mich, Für Agenturen und Verlage (stacked fact sheet on phones), Kontakt (Formspree without the unpkg script)
- [x] Impressum, Datenschutz, Nutzungsbedingungen ported; Kolophon; 404
- [x] Open Graph images per book, favicon from Literata’s “è”, sitemap, robots.txt, structured data (Person, Book)
- [x] Placeholder system: missing texts are marked `TODO`, shown in yellow, listed by `npm run todo` (currently none)

## Phase 3 · Content (Josie)

- [x] Texts from the template (received 12 Oct 2026 as .odt, original in `manuskripte/alt/`)
- [x] Name spelling, address form, book order, download choices
- [x] New portrait
- [x] Final EPUB/PDF files
- [ ] Photographer’s name for the credit (left out until known)
- [ ] May press and agencies download the portrait? (download button stays off until yes)
- [ ] Optional: two or three sentences to agencies and publishers (section 5 of the template was left empty)
- [ ] Check four small text edits Claude made (see below)

**Small edits Claude made to Josie’s texts:** “Josie H. Matchèque, wuchs” → comma removed · *Der Pfau* blurb “engegen” → “entgegen” · “Ödön von Horvath” → “Horváth” · the sentence after downloads switched to “Sie”.

## Phase 4 · Pre-launch check (Claude, Igor)

- [ ] `npm run todo` reports zero open placeholders
- [ ] All pages checked at 375 px, tablet and desktop, light and dark (done once by Claude with placeholder texts; repeat with real texts)
- [ ] Lighthouse: performance, accessibility, SEO ≥ 95
- [ ] Every download opens: EPUB in Apple Books, an e-reader app, Send to Kindle; PDF on phone and desktop
- [ ] Contact form sends a test message to the right inbox
- [ ] Link previews look right in WhatsApp, Signal, LinkedIn and Mail
- [ ] Spelling read-through of every page (agents notice typos)

## Phase 5 · Go live (Igor)

See the manual steps below.

## Phase 6 · After launch

- [ ] Download counting (GoatCounter or Cloudflare Web Analytics) plus a paragraph in the Datenschutz page
- [ ] English page for international scouts (`/en/`)
- [ ] Real photo per book once she has images of her own
- [ ] Newsletter or dates, only if there is something to say regularly

---

## Manual work for Igor

Things only you can do, because they need your accounts, a decision about public or destructive actions, or Josie’s files.

### Now

- [x] Rebuild committed and pushed (`development` and `main`).
- [ ] **Install the tools** for regenerating PDFs and images, if you want to run `npm run assets` yourself: `brew install typst pandoc` (both are on this Mac already).
- [ ] **Keep `manuskripte/` safe.** It holds the full manuscripts and is git-ignored, so it exists only on this Mac. Back it up somewhere private.
- [ ] **Delete or keep `output/`** locally (the 29 MB PDF export of the old site). It is no longer tracked by git.

### Manuscript metadata (with Josie, in Papyrus)

- [x] Der Pfau: author and chapter numbering fixed in the new export.
- [ ] Der Pfau and Alma Mater: Papyrus still writes “Max Mustermann” into the rights field. `npm run assets` overwrites it in the website files, but it’s worth fixing in Papyrus (project or export settings).
- [ ] **Exporting EPUBs:** the new *Der Pfau* and *Alma Mater* EPUBs were zipped with an extra folder around them (macOS “Compress”), which e-readers reject. The site repackages them automatically. When sending EPUBs elsewhere, send the file Papyrus exports directly.
- [ ] After a new export: put the files into `manuskripte/` (names as in the book’s YAML under `manuskript` and `dateien`), then run `npm run manuskripte && npm run assets`.

### Remove the full manuscripts from the git history

They are still downloadable from older commits on GitHub (the `development` branch). This rewrites history and force-pushes, so everyone with a clone has to re-clone afterwards.

```bash
brew install git-filter-repo
git filter-repo --invert-paths --path downloads/ --path books/ --path output/ --path .phone-preview/ --force
git remote add origin https://github.com/Aparikk/Josy_Website.git
git push --force --all
```

### Formspree

- [ ] In the Formspree dashboard, check that the form `xljrwelg` allows `matcheque.de` and delivers to the right inbox.
- [ ] After go-live, send one test message through the contact page.

### Go live

1. [x] GitHub Pages source switched to **GitHub Actions** (12 Oct 2026).
2. [x] `development` merged into `main` and pushed; the workflow “Website veröffentlichen” deployed successfully.
3. [x] https://matcheque.de and https://www.matcheque.de answer with the new site; Cloudflare redirects http to https. (GitHub’s own “Enforce HTTPS” cannot be switched on because GitHub has no certificate behind the Cloudflare proxy. Not needed while Cloudflare handles HTTPS.)
4. [ ] Cloudflare: Caching → Purge everything.
5. [ ] Google Search Console: verify the domain, submit `https://matcheque.de/sitemap.xml`.
6. [ ] A week later, search for “Josie H Matchèque”.

### Optional

- [ ] GoatCounter: create a free account (code e.g. `matcheque`), put the code into `goatcounter` in `src/_data/site.yaml`, and ask Claude for the Datenschutz paragraph.

---

## Working on the site

```bash
npm install          # once
npm start            # local preview with live reload at http://localhost:8080
npm run build        # production build into _site/
npm run todo         # list every placeholder that still needs real text
npm run manuskripte  # re-read manuskripte/*.epub: stats, first sentences, sample text
npm run assets       # render sample PDFs and EPUBs, preview images, icons (needs typst and pandoc)
```

Texts live in `src/_data/site.yaml`, `src/_data/buecher/*.yaml` and the Markdown pages in `src/`.
Full manuscripts belong in `manuskripte/` (git-ignored). Never commit them.
