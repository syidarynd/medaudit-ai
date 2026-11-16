/* MedAudit AI — local ICD-10 index search helpers.
 * The source PDF and tabular text are selected by the user and processed in-browser.
 * No source dataset is bundled or transmitted by this module.
 */
(function (root) {
  "use strict";
  const CODE_RE = /(^|[^A-Z0-9])([A-Z][0-9]{2}(?:\.[0-9A-Z]{1,4})?(?:\.-)?)(?![A-Z0-9])/g;

  function normalizeText(value) {
    return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, " ").trim();
  }

  function stripCrossReference(value) {
    return String(value ?? "")
      .replace(/\(\s*see\s+(?:also\s+)?[^)]*\)/gi, " ")
      .replace(/\s+-\s*see\s+(?:also\s+)?[^;]*$/i, "")
      .trim();
  }

  function extractCodes(value) {
    const text = String(value ?? "").toUpperCase(), codes = [];
    CODE_RE.lastIndex = 0;
    let match;
    while ((match = CODE_RE.exec(text)) !== null) {
      if (!codes.includes(match[2])) codes.push(match[2]);
    }
    return codes;
  }


  function groupPdfTextItems(items, pageWidth) {
    const usable = (items || []).filter(item =>
      item && String(item.str || "").trim() &&
      Array.isArray(item.transform) &&
      Number.isFinite(item.transform[4]) &&
      Number.isFinite(item.transform[5])
    );
    // Fallback for simplified/mocked PDF.js items without coordinates.
    if (!(items || []).filter(item => item && String(item.str || "").trim())
      .every(item => Array.isArray(item.transform) &&
        Number.isFinite(item.transform[4]) && Number.isFinite(item.transform[5]))) {
      let text = "";
      for (const item of (items || [])) {
        if (!item || !String(item.str || "").trim()) continue;
        text += item.str + (item.hasEOL ? "\n" : " ");
      }
      return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    }
    if (!usable.length) return [];

    const width = Number(pageWidth) || 0;
    const sorted = usable.slice().sort((a, b) =>
      b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]
    );

    // First reconstruct visual rows across the whole page. Split columns only
    // at a large horizontal gutter; never split a long left-column line merely
    // because it crosses the page midpoint.
    const rows = [];
    for (const item of sorted) {
      const y = item.transform[5];
      let row = rows.find(candidate => Math.abs(candidate.baseline - y) <= 2.5);
      if (!row) {
        row = { baseline: y, items: [] };
        rows.push(row);
      }
      row.items.push(item);
      row.baseline = row.items.reduce((sum, part) => sum + part.transform[5], 0) / row.items.length;
    }

    const fragments = [];
    const gutterThreshold = width > 100 ? Math.max(28, width * 0.045) : 28;
    for (const row of rows) {
      const lineItems = row.items.slice().sort((a, b) => a.transform[4] - b.transform[4]);
      let fragment = [], right = null;
      const flush = () => {
        if (!fragment.length) return;
        const parts = [];
        let previousRight = null;
        for (const item of fragment) {
          const value = String(item.str || "").replace(/\s+/g, " ").trim();
          if (!value) continue;
          const x = item.transform[4];
          const gap = previousRight === null ? 0 : x - previousRight;
          if (parts.length && gap > 1.5 &&
              !/^[,.;:)]/.test(value) && !/[(/-]$/.test(parts[parts.length - 1])) {
            parts.push(" ");
          }
          parts.push(value);
          previousRight = x + (Number(item.width) || 0);
        }
        const line = parts.join("").replace(/\s+/g, " ").trim();
        if (line) fragments.push({
          x: fragment[0].transform[4],
          y: row.baseline,
          text: line
        });
        fragment = [];
        right = null;
      };
      for (const item of lineItems) {
        const x = item.transform[4];
        const gap = right === null ? 0 : x - right;
        if (fragment.length && gap > gutterThreshold) flush();
        fragment.push(item);
        right = x + (Number(item.width) || 0);
      }
      flush();
    }

    // Preserve reading order: top-to-bottom within the left column, then
    // top-to-bottom within the right column. A single-column page stays intact.
    if (width > 100) {
      const left = fragments.filter(fragment => fragment.x < width / 2);
      const right = fragments.filter(fragment => fragment.x >= width / 2);
      const order = (a, b) => b.y - a.y || a.x - b.x;
      left.sort(order);
      right.sort(order);
      return [...left, ...right].map(fragment => fragment.text);
    }
    fragments.sort((a, b) => b.y - a.y || a.x - b.x);
    return fragments.map(fragment => fragment.text);
  }

  function parseIndexLines(lines, pageNumber, state) {
    const output = [], parserState = state || { section: "diseases", stack: {} };
    for (const rawLine of lines || []) {
      if (parserState.finished) break;
      const line = String(rawLine ?? "").replace(/\u00ad/g, "-").replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ").trim();
      if (!line || /^ICD-10\s+2e\s+Volume\s+3/i.test(line)) continue;
      if (/^SECTION\s+I\b/i.test(line)) {
        parserState.section = "diseases"; parserState.stack = {}; continue;
      }
      // WHO Volume 3 uses this running page heading for Section II; it is not
      // printed as "SECTION II -" on each page in the PDF.
      if (/^(?:SECTION\s+II\b|EXTERNAL CAUSES OF INJURY)$/i.test(line)) {
        parserState.section = "external_causes"; parserState.stack = {}; continue;
      }
      // Section III is a separate drug/chemical table, not an index hierarchy.
      if (/^(?:SECTION\s+III\b|TABLE OF DRUGS AND CHEMICALS)$/i.test(line)) {
        parserState.finished = true; break;
      }
      if (/^\d{1,4}$/.test(line)) continue;
      const prefix = line.match(/^((?:-\s*)+)(.*)$/);
      let depth = 0, term = line;
      if (prefix) {
        depth = (prefix[1].match(/-/g) || []).length;
        term = prefix[2].trim();
      } else if (/^[A-Z]$/.test(line)) {
        parserState.letter = line; parserState.stack = {}; continue;
      }
      if (!term) continue;
      const parent = depth > 0 ? (parserState.stack[depth - 1] || null) : null;
      parserState.stack[depth] = term;
      for (const key of Object.keys(parserState.stack)) {
        if (Number(key) > depth) delete parserState.stack[key];
      }
      const seeMatch = term.match(/\bsee\s+(also\s+)?(.+)$/i);
      const hierarchy = Object.keys(parserState.stack).sort((a, b) => Number(a) - Number(b))
        .map(key => stripCrossReference(parserState.stack[key]));
      const searchText = normalizeText(hierarchy.join(" ").replace(
        /(^|[^A-Z0-9])[A-Z][0-9]{2}(?:\.[0-9A-Z]{1,4})?(?:\.-)?(?![A-Z0-9])/gi, " "
      ));
      output.push({
        section: parserState.section || "diseases",
        letter: parserState.letter || "",
        page: Number(pageNumber) || null,
        depth,
        term,
        parent,
        codes: extractCodes(term),
        crossReference: seeMatch ? (seeMatch[1] ? "see also" : "see") : "",
        crossReferenceTarget: seeMatch ? seeMatch[2].trim() : "",
        searchText,
        raw: line
      });
    }
    return output;
  }

  function parseTabularText(text) {
    const codeMap = new Map();
    let rows = 0;
    for (const line of String(text ?? "").split(/\r?\n/)) {
      if (!line.trim()) continue;
      const fields = line.split(";");
      if (fields.length < 10 || !["T", "N"].includes(fields[1])) continue;
      const title = String(fields[8] || fields[9] || "").trim();
      const codes = [...new Set([
        String(fields[5] || "").trim().toUpperCase(),
        String(fields[6] || "").trim().toUpperCase()
      ].filter(Boolean))];
      if (!codes.length) continue;
      for (const code of codes) {
        const old = codeMap.get(code);
        if (!old || fields[1] === "T") codeMap.set(code, { kind: fields[1], title });
      }
      rows += 1;
    }
    return { codeMap, rows };
  }

  function getCodeStatus(code, codeMap) {
    const normalized = String(code ?? "").trim().toUpperCase();
    if (!normalized) return "no_code";
    if (normalized.endsWith(".-")) return "non_terminal";
    const entry = codeMap && codeMap.get(normalized);
    if (!entry) return "not_found";
    return entry.kind === "T" ? "matched" : "non_terminal";
  }

  function searchEntries(entries, query, limit) {
    const needle = normalizeText(query);
    if (!needle) return [];
    const max = Math.max(1, Math.min(Number(limit) || 50, 200));
    const tokens = needle.split(" ").filter(Boolean);
    const ranked = [];

    for (const entry of entries || []) {
      const termText = normalizeText(stripCrossReference(entry.term)
        .replace(/(^|[^A-Z0-9])[A-Z][0-9]{2}(?:\.[0-9A-Z]{1,4})?(?:\.-)?(?![A-Z0-9])/gi, " "));
      const contextText = entry.searchText || normalizeText([entry.term, entry.parent].filter(Boolean).join(" "));
      const refText = normalizeText(entry.crossReferenceTarget || "");
      const termIndex = termText.indexOf(needle);
      const contextIndex = contextText.indexOf(needle);
      const tokenMatch = tokens.every(token => contextText.includes(token));
      const refMatch = refText.includes(needle) || tokens.every(token => refText.includes(token));
      const codeMatch = (entry.codes || []).some(code => normalizeText(code) === needle);
      if (termIndex < 0 && contextIndex < 0 && !tokenMatch && !codeMatch && !refMatch) continue;

      const exactTerm = termText === needle;
      const prefixTerm = termText.startsWith(needle);
      let score;
      if (exactTerm) score = 0;
      else if (prefixTerm) score = 10;
      else if (termIndex >= 0) score = 20 + termIndex;
      else if (contextIndex >= 0 || tokenMatch) score = 40 + Math.max(0, contextIndex);
      else if (codeMatch) score = 60;
      else score = 100; // Cross-reference target matches rank below direct index terms.
      ranked.push({ entry, score });
    }

    ranked.sort((a, b) => a.score - b.score || (a.entry.page || 0) - (b.entry.page || 0));
    return ranked.slice(0, max).map(item => item.entry);
  }

  const api = Object.freeze({
    normalizeText, extractCodes, groupPdfTextItems, parseIndexLines, parseTabularText, getCodeStatus, searchEntries
  });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MedAuditIndex = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
