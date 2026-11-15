/* MedAudit AI — local ICD-10 index search helpers.
 * The source PDF and tabular text are selected by the user and processed in-browser.
 * No source dataset is bundled or transmitted by this module.
 */
(function (root) {
  "use strict";
  const CODE_RE = /(^|[^A-Z0-9])([A-Z][0-9]{2}(?:\\.[0-9A-Z]{1,4})?(?:\\.-)?)(?![A-Z0-9])/g;
  function normalizeText(value) {
    return String(value ?? "").normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "")
      .toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, " ").trim();
  }
  function extractCodes(value) {
    const text = String(value ?? "").toUpperCase(), codes = [];
    CODE_RE.lastIndex = 0;
    let match;
    while ((match = CODE_RE.exec(text)) !== null) if (!codes.includes(match[2])) codes.push(match[2]);
    return codes;
  }
  function parseIndexLines(lines, pageNumber, state) {
    const output = [], parserState = state || { section: "diseases", stack: {} };
    for (const rawLine of lines || []) {
      const line = String(rawLine ?? "").replace(/\\u00ad/g, "-").replace(/\\u00a0/g, " ").replace(/\\s+/g, " ").trim();
      if (!line || /^ICD-10\\s+2e\\s+Volume\\s+3/i.test(line)) continue;
      if (/^SECTION\\s+I\\s*-/i.test(line)) { parserState.section = "diseases"; parserState.stack = {}; continue; }
      if (/^SECTION\\s+II\\s*-/i.test(line)) { parserState.section = "external_causes"; parserState.stack = {}; continue; }
      if (/^\\d{1,4}$/.test(line)) continue;
      const prefix = line.match(/^((?:-\\s*)+)(.*)$/);
      let depth = 0, term = line;
      if (prefix) { depth = (prefix[1].match(/-/g) || []).length; term = prefix[2].trim(); }
      else if (/^[A-Z]$/.test(line)) { parserState.letter = line; parserState.stack = {}; continue; }
      if (!term) continue;
      const parent = depth > 0 ? (parserState.stack[depth - 1] || null) : null;
      parserState.stack[depth] = term;
      for (const key of Object.keys(parserState.stack)) if (Number(key) > depth) delete parserState.stack[key];
      const seeMatch = term.match(/\\bsee\\s+(also\\s+)?(.+)$/i);
      const hierarchy = Object.keys(parserState.stack).sort((a,b)=>Number(a)-Number(b)).map(key=>parserState.stack[key]);
      const searchText = normalizeText(hierarchy.join(" ").replace(/(^|[^A-Z0-9])[A-Z][0-9]{2}(?:\\.[0-9A-Z]{1,4})?(?:\\.-)?(?![A-Z0-9])/gi, " "));
      output.push({
        section: parserState.section || "diseases", letter: parserState.letter || "",
        page: Number(pageNumber) || null, depth, term, parent, codes: extractCodes(term),
        crossReference: seeMatch ? (seeMatch[1] ? "see also" : "see") : "",
        crossReferenceTarget: seeMatch ? seeMatch[2].trim() : "", searchText, raw: line
      });
    }
    return output;
  }
  function parseTabularText(text) {
    const codeMap = new Map(); let rows = 0;
    for (const line of String(text ?? "").split(/\\r?\\n/)) {
      if (!line.trim()) continue;
      const fields = line.split(";");
      if (fields.length < 10 || !["T","N"].includes(fields[1])) continue;
      const title = String(fields[9] || fields[8] || "").trim();
      const codes = [...new Set([String(fields[5] || "").trim().toUpperCase(), String(fields[6] || "").trim().toUpperCase()].filter(Boolean))];
      if (!codes.length) continue;
      for (const code of codes) { const old=codeMap.get(code); if (!old || fields[1] === "T") codeMap.set(code,{kind:fields[1],title}); }
      rows += 1;
    }
    return { codeMap, rows };
  }
  function getCodeStatus(code, codeMap) {
    const normalized=String(code ?? "").trim().toUpperCase();
    if (!normalized) return "no_code";
    if (normalized.endsWith(".-")) return "non_terminal";
    const entry=codeMap && codeMap.get(normalized);
    if (!entry) return "not_found";
    return entry.kind === "T" ? "matched" : "non_terminal";
  }
  function searchEntries(entries, query, limit) {
    const needle=normalizeText(query); if (!needle) return [];
    const max=Math.max(1,Math.min(Number(limit)||50,200)), ranked=[];
    for (const entry of entries || []) {
      const haystack=entry.searchText || normalizeText([entry.term,entry.parent].filter(Boolean).join(" "));
      const index=haystack.indexOf(needle), tokens=needle.split(" ").filter(Boolean);
      const tokenMatch=tokens.every(token=>haystack.includes(token));
      const codeMatch=(entry.codes||[]).some(code=>normalizeText(code)===needle);
      if (index<0 && !tokenMatch && !codeMatch) continue;
      const exact=normalizeText(entry.term)===needle?0:1, prefix=normalizeText(entry.term).startsWith(needle)?0:1;
      ranked.push({entry,score:exact*100+prefix*10+(index>=0?index:(codeMatch?0:200))});
    }
    ranked.sort((a,b)=>a.score-b.score||(a.entry.page||0)-(b.entry.page||0));
    return ranked.slice(0,max).map(item=>item.entry);
  }
  const api=Object.freeze({normalizeText,extractCodes,parseIndexLines,parseTabularText,getCodeStatus,searchEntries});
  if (typeof module!=="undefined" && module.exports) module.exports=api;
  if (root) root.MedAuditIndex=api;
})(typeof globalThis!=="undefined"?globalThis:this);
