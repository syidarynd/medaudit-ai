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
    const nonEmpty = (items || []).filter(item => item && String(item.str || "").trim());
    const usable = nonEmpty.filter(item =>
      Array.isArray(item.transform) &&
      Number.isFinite(item.transform[4]) &&
      Number.isFinite(item.transform[5])
    );

    // Compatibility fallback for test doubles or PDF.js adapters without geometry.
    if (usable.length !== nonEmpty.length) {
      let text = "";
      for (const item of nonEmpty) text += item.str + (item.hasEOL ? "\\n" : " ");
      return text.split(/\\r?\\n/).map(line => line.trim()).filter(Boolean);
    }
    if (!usable.length) return [];

    // Reconstruct visual baselines first. A PDF page may contain two columns
    // whose text starts at x=70/250 on one page and x=181/361 on another.
    const sorted = usable.slice().sort((a, b) =>
      b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]
    );
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

    // Detect the two column origins from each visual row's first x-coordinate.
    // This avoids relying on a text-gap threshold: in the WHO PDF the gutter can
    // be only ~20 pt, while a long line in one column may itself contain gaps.
    const starts = usable.map(item => item.transform[4]);
    let boundary = null;
    if (starts.length >= 20) {
      let c1 = Math.min(...starts), c2 = Math.max(...starts);
      for (let i = 0; i < 12; i++) {
        const left = starts.filter(x => Math.abs(x - c1) <= Math.abs(x - c2));
        const right = starts.filter(x => Math.abs(x - c1) > Math.abs(x - c2));
        if (!left.length || !right.length) break;
        const next1 = left.reduce((a, b) => a + b, 0) / left.length;
        const next2 = right.reduce((a, b) => a + b, 0) / right.length;
        if (Math.abs(next1 - c1) + Math.abs(next2 - c2) < 0.01) break;
        c1 = next1; c2 = next2;
      }
      const low = Math.min(c1, c2), high = Math.max(c1, c2);
      const leftCount = starts.filter(x => Math.abs(x - low) <= Math.abs(x - high)).length;
      const rightCount = starts.length - leftCount;
      if (high - low >= 70 && leftCount >= 10 && rightCount >= 10) boundary = (low + high) / 2;
    }

    function buildLine(lineItems) {
      const parts = [];
      let previousRight = null;
      for (const item of lineItems) {
        const value = String(item.str || "").replace(/\\s+/g, " ").trim();
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
      return parts.join("").replace(/\\s+/g, " ").trim();
    }

    const fragments = [];
    for (const row of rows) {
      const lineItems = row.items.slice().sort((a, b) => a.transform[4] - b.transform[4]);
      if (boundary === null) {
        const text = buildLine(lineItems);
        if (text) fragments.push({ column: 0, y: row.baseline, x: lineItems[0].transform[4], text });
        continue;
      }
      const columns = [[], []];
      for (const item of lineItems) columns[item.transform[4] < boundary ? 0 : 1].push(item);
      columns.forEach((columnItems, column) => {
        if (!columnItems.length) return;
        const text = buildLine(columnItems);
        if (text) fragments.push({ column, y: row.baseline, x: columnItems[0].transform[4], text });
      });
    }

    // Read the complete left column before the right column, preserving
    // top-to-bottom order inside each. On single-column pages retain page order.
    if (boundary !== null) {
      fragments.sort((a, b) => a.column - b.column || b.y - a.y || a.x - b.x);
    } else {
      fragments.sort((a, b) => b.y - a.y || a.x - b.x);
    }
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
