# Road to live · matcheque.de

The plan from prototype to the live author website for Josie H Matchèque.
Design proposal and reasoning: [Matchèque Redesign](https://claude.ai/artifact/7Q65H15eijs6cLMXKDkcUk) (private, share via its Share menu).

**Legend:** `[x]` done · `[ ]` open
**Who:** Igor · Josie · Claude

---

## Where we are

- 9 Oct 2026: Direction **C · Erster Satz** chosen. All other recommendations from the proposal adopted.
- 9 Oct 2026: New site built on `development` (not committed yet). It runs locally with `npm start`. Every text Josie still has to write shows up as a yellow placeholder.
- The live site (`main`) keeps showing the “im Aufbau” page until go-live.
- The old Bootstrap prototype stays in git history (last commit `371b59a`).

## Decisions

| Decision | Status | Value |
|---|---|---|
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
- [x] Design tokens, light and dark (follows the device), per-book colors
- [x] Self-hosted, subsetted fonts (Literata with small caps and old-style figures, Schibsted Grotesk)
- [x] Image pipeline (AVIF/WebP/JPEG, responsive sizes)
- [x] GitHub Actions workflow that builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`)
- [x] Cleanup: Bootstrap, old HTML pages, `.phone-preview/` removed; `output/` untracked; `.gitignore`
- [x] Full manuscripts moved out of the repo into `manuskripte/` (local only, git-ignored)

## Phase 2 · Pages and samples (Claude) ✓

- [x] Homepage: one first sentence per screen, book title and link underneath
- [x] Book pages with typographic title page, motto, facts, opening paragraph, sample and downloads
- [x] Leseprobe reader in the browser (progress bar, book typography, dark mode)
- [x] Sample files: A5 PDF (Typst) and EPUB (pandoc) with correct metadata and title-page cover
- [x] Werkverzeichnis (`/buecher/`)
- [x] Über mich, Für Agenturen und Verlage (stacked fact sheet on phones), Kontakt (Formspree without the unpkg script)
- [x] Impressum, Datenschutz, Nutzungsbedingungen ported; Kolophon; 404
- [x] Open Graph images per book, favicon from Literata’s “è”, sitemap, robots.txt, structured data (Person, Book)
- [x] Placeholder system: missing texts are marked `TODO`, shown in yellow, listed by `npm run todo` (currently 17)

## Phase 3 · Content (Josie)

- [ ] Fill in [`_texte/website-texte.md`](_texte/website-texte.md); Claude moves the texts into the YAML files
- [ ] Decide name spelling (with or without the dot after “H”)
- [ ] Confirm or replace the first sentences on the homepage (Der Pfau could also open with its motto)
- [ ] Der Pfau: is “Ich hasse Schach.” a subtitle? It is shown as one right now
- [ ] Diamanten: first sentence, genre, status, and the manuscript if a sample should go online
- [ ] Normseiten from Papyrus for each book (the site currently estimates them from the character count)
- [ ] Photo session: portrait upright and landscape, desk, notebooks, something handwritten; photographer’s name for the credit
- [ ] Read both reading samples once in the browser and as PDF (length, where they end)
- [ ] Review the legal pages. Datenschutz was updated for self-hosted fonts, the new form and no local storage

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

- [ ] **Review and commit** the rebuild on `development` (or tell Claude to commit it). Nothing has been committed or pushed yet.
- [ ] **Install the tools** for regenerating PDFs and images, if you want to run `npm run assets` yourself: `brew install typst pandoc` (both are on this Mac already).
- [ ] **Keep `manuskripte/` safe.** It holds the full manuscripts and is git-ignored, so it exists only on this Mac. Back it up somewhere private.
- [ ] **Delete or keep `output/`** locally (the 29 MB PDF export of the old site). It is no longer tracked by git.

### Manuscript metadata (with Josie, in Papyrus)

- [ ] Der Pfau: the EPUB says author “M. J. H.”, rights “Max Mustermann”, publisher “Papyrus Testverlag, Berlin” and a placeholder ISBN. Fix in Papyrus and re-export. (The website’s sample files already carry correct metadata.)
- [ ] Der Pfau: chapter numbering jumps from “# 11” to “# 13”. Intended?
- [ ] Ich fahr dich.: the rights line reads “Josie H.  Matchèque” with a double space.
- [ ] After a new export: put the EPUB into `manuskripte/`, then run `npm run manuskripte && npm run assets`.

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

1. [ ] GitHub → repository Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. [ ] Merge `development` into `main` and push. The workflow “Website veröffentlichen” builds and deploys.
3. [ ] Check https://matcheque.de and https://www.matcheque.de, HTTPS enforced.
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
