import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import markdownIt from "markdown-it";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

const md = markdownIt({ html: true, typographer: false });
const zahl = new Intl.NumberFormat("de-DE");
const istTodo = (wert) => typeof wert === "string" && wert.trim().startsWith("TODO");

export default function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml", (inhalt) => yaml.load(inhalt));

  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/og": "assets/og" });
  eleventyConfig.addPassthroughCopy({ "src/assets/icons": "/" });
  eleventyConfig.addPassthroughCopy("src/downloads");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addWatchTarget("src/assets/css/");

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp", "jpeg"],
    widths: [480, 800, 1200],
    htmlOptions: { imgAttributes: { loading: "lazy", decoding: "async" } },
  });

  // Kurzer Hash als Versionsnummer, damit Browser nach Änderungen das neue CSS laden.
  eleventyConfig.addGlobalData("cssVersion", () =>
    crypto.createHash("sha1").update(fs.readFileSync("src/assets/css/site.css")).digest("hex").slice(0, 8)
  );
  eleventyConfig.addGlobalData("jahr", () => new Date().getFullYear());
  eleventyConfig.addGlobalData("produktion", () => process.env.ELEVENTY_ENV === "production");

  // Bücher als sortierte Liste, angereichert mit den Kennzahlen aus dem Manuskript.
  eleventyConfig.addFilter("buchliste", (buecher, manuskripte = {}) =>
    Object.values(buecher)
      .sort((a, b) => a.reihenfolge - b.reihenfolge)
      .map((b) => {
        const m = manuskripte[b.slug] || {};
        return {
          ...b,
          manuskriptDaten: m,
          satz: b.ersterSatz || m.ersterSatz || "",
          woerterZahl: b.woerter ?? m.woerter ?? null,
          normseitenZahl: b.normseiten ?? m.normseitenGeschaetzt ?? null,
          normseitenGeschaetzt: !b.normseiten && !!m.normseitenGeschaetzt,
          hatLeseprobe: !!m.leseprobe,
          motto: m.motto || [],
        };
      })
  );

  eleventyConfig.addFilter("findeBuch", (liste, slug) => liste.find((b) => b.slug === slug));
  eleventyConfig.addFilter("zahl", (n) => (n == null ? "" : zahl.format(n)));
  eleventyConfig.addFilter("md", (text) => (text ? md.render(String(text)) : ""));
  eleventyConfig.addFilter("mdInline", (text) => (text ? md.renderInline(String(text)) : ""));
  eleventyConfig.addFilter("istTodo", istTodo);
  eleventyConfig.addFilter("ohneTodo", (wert, ersatz) => (!wert || istTodo(wert) ? ersatz : wert));

  // Schriftgröße eines ersten Satzes nach seiner Länge.
  eleventyConfig.addFilter("satzlaenge", (satz = "") => (satz.length < 130 ? "kurz" : satz.length < 260 ? "mittel" : "lang"));

  // Beginnt ein Satz mit einem Anführungszeichen, hängt es optisch in den Rand.
  eleventyConfig.addFilter("haengt", (satz = "") => /^[„“"»‚‘]/.test(satz.trim()));

  eleventyConfig.addFilter("dateigroesse", (url) => {
    const datei = path.join("src", url);
    if (!fs.existsSync(datei)) return null;
    const bytes = fs.statSync(datei).size;
    return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  });
  eleventyConfig.addFilter("existiert", (url) => fs.existsSync(path.join("src", url)));

  eleventyConfig.addFilter("absolut", (url, basis) => new URL(url, basis).href);
  eleventyConfig.addFilter("json", (wert) => JSON.stringify(wert));
  eleventyConfig.addFilter("isoDatum", (d) => new Date(d).toISOString().slice(0, 10));

  // Platzhalter sichtbar markieren: Elemente, deren Text mit "TODO" beginnt.
  eleventyConfig.addTransform("platzhalter", function (inhalt) {
    if (!(this.page.outputPath || "").endsWith(".html")) return inhalt;
    return inhalt.replace(
      /(<(p|li|td|dd|span|h[1-6]|blockquote|figcaption|a|em|strong)\b[^>]*>)\s*TODO:?\s*([\s\S]*?)(<\/\2>)/g,
      '$1<span class="platzhalter" title="Platzhalter: Text fehlt noch">$3</span>$4'
    );
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
