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
      for (const item of nonEmpty) text += item.str + (item.hasEOL ? "\n" : " ");
      return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
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

    // Infer column starts from recurring, baseline-level text runs. PDF.js can
    // split a logical line into inline fragments, so an arbitrary fragment
    // origin must not be mistaken for a new column. A genuine second-column
    // run recurs across many baselines and is separated from the prior run
    // by a visible horizontal gap.
    const originClusters = [];
    rows.forEach((row, rowIndex) => {
      const lineItems = row.items.slice().sort((a, b) => a.transform[4] - b.transform[4]);
      let previousRight = null;
      for (const item of lineItems) {
        const x = item.transform[4];
        const gap = previousRight === null ? Infinity : x - previousRight;
        if (previousRight === null || gap >= 8) {
          let cluster = originClusters.find(candidate => Math.abs(candidate.origin - x) <= 4);
          if (!cluster) {
            cluster = { origin: x, total: 0, count: 0, rows: new Set() };
            originClusters.push(cluster);
          }
          cluster.total += x;
          cluster.count += 1;
          cluster.rows.add(rowIndex);
          cluster.origin = cluster.total / cluster.count;
        }
        previousRight = x + (Number(item.width) || 0);
      }
    });
    const recurringThreshold = Math.max(4, Math.ceil(rows.length * 0.25));
    const recurringOrigins = originClusters
      .filter(cluster => cluster.rows.size >= recurringThreshold)
      .map(cluster => cluster.origin)
      .sort((a, b) => a - b);
    let boundary = null;
    let rightOrigin = null;
    if (recurringOrigins.length >= 2) {
      let splitAt = -1, largestGap = 0;
      for (let i = 1; i < recurringOrigins.length; i++) {
        const gap = recurringOrigins[i] - recurringOrigins[i - 1];
        if (gap > largestGap) {
          largestGap = gap;
          splitAt = i;
        }
      }
      if (splitAt > 0 && largestGap >= 70) {
        const leftOrigin = recurringOrigins[splitAt - 1];
        rightOrigin = recurringOrigins[splitAt];
        boundary = (leftOrigin + rightOrigin) / 2;
      }
    }

    function buildLine(lineItems) {
      const parts = [];
      let previousRight = null;
      for (const item of lineItems) {
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
      return parts.join("").replace(/\s+/g, " ").trim();
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
      let leftStarted = false;
      let leftRight = -Infinity;
      for (const item of lineItems) {
        const x = item.transform[4];
        // A fragmented long line can continue past the geometric midpoint.
        // Keep a nearby fragment with the left line when it follows an item
        // already assigned to that column; otherwise it starts the right one.
        const continuesLeft = leftStarted && x >= boundary && x < rightOrigin - 6 && x - leftRight <= 18;
        const column = x < boundary || continuesLeft ? 0 : 1;
        columns[column].push(item);
        if (column === 0) {
          leftStarted = true;
          leftRight = Math.max(leftRight, x + (Number(item.width) || 0));
        }
      }
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
    // Join visual continuation lines before semantic parsing. In this WHO PDF,
    // wrapped text/code lines are indented by about 9 pt and do not begin with
    // the index dash used for a new subentry. Keeping them together prevents
    // orphaned codes and truncated terms such as "hip or other / joint".
    const merged = [];
    const columnBases = new Map();
    for (const fragment of fragments) {
      const column = fragment.column || 0;
      const base = columnBases.has(column)
        ? columnBases.get(column)
        : Math.min(...fragments.filter(part => (part.column || 0) === column).map(part => part.x));
      columnBases.set(column, base);
      const text = fragment.text;
      const previous = merged[merged.length - 1];
      const sameColumn = previous && (previous.column || 0) === column;
      const indentedContinuation = fragment.x > base + 4 &&
        !/^(?:-|–|—)/.test(text) &&
        !/^(?:SECTION\s|EXTERNAL CAUSES OF INJURY$|TABLE OF DRUGS)/i.test(text) &&
        !/^[A-Z]$/.test(text);
      const closeBaseline = sameColumn && Math.abs(previous.y - fragment.y) <= 18;
      if (sameColumn && closeBaseline && indentedContinuation) {
        previous.text = (previous.text + " " + text).replace(/\s+/g, " ").trim();
        previous.y = fragment.y;
      } else {
        merged.push({ ...fragment });
      }
    }
    return merged.map(fragment => fragment.text);
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
      if (/^(?:SECTION\s+II\b(?:\s*[-–—:].*)?|EXTERNAL CAUSES OF INJURY)$/i.test(line)) {
        parserState.section = "external_causes"; parserState.stack = {}; continue;
      }
      // Section III is a separate drug/chemical table, not an index hierarchy.
      if (/^(?:SECTION\s+III\b(?:\s*[-–—:].*)?|TABLE OF DRUGS AND CHEMICALS)$/i.test(line)) {
        parserState.finished = true; break;
      }
      if (/^\d{1,4}$/.test(line)) continue;

      // Column/page continuation headings (for example "Abscess—continued")
      // are running headers, not diagnosis entries. Restore their parent path
      // so following indented rows remain children of the original index term.
      const continuedHeading = line.match(/^((?:-\s*)*)(.+?)\s*[–—-]{1,2}\s*continued$/i);
      if (continuedHeading) {
        const headingDepth = (continuedHeading[1].match(/-/g) || []).length;
        parserState.stack[headingDepth] = continuedHeading[2].trim();
        for (const key of Object.keys(parserState.stack)) {
          if (Number(key) > headingDepth) delete parserState.stack[key];
        }
        continue;
      }

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
