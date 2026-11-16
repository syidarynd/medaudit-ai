const test = require("node:test");
const assert = require("node:assert/strict");
const index = require("../js/icd10-index.js");

test("extracts ordinary, paired, and wildcard ICD-10 codes", () => {
  assert.deepEqual(index.extractCodes("Proctitis A60.1 † K93.8* and V92.-"), ["A60.1", "K93.8", "V92.-"]);
});

test("preserves hierarchy, cross references, and section changes", () => {
  const state = { section: "diseases", stack: {} };
  const entries = index.parseIndexLines(["A","Abscess, by site - see also condition","-brain G06.0","- - congenital Q04.8","-skin - see Infection, skin","SECTION II - External causes of injury","Burn X09.-"],12,state);
  assert.equal(entries[0].term,"Abscess, by site - see also condition");
  assert.equal(entries[1].parent,"Abscess, by site - see also condition");
  assert.equal(entries[2].parent,"brain G06.0");
  assert.equal(entries[3].crossReference,"see");
  assert.equal(entries[4].section,"external_causes");
});

test("reads terminal and non-terminal tabular codes", () => {
  const text=["3;N;X;10;J90;J94.-;J94;J94;Other pleural conditions;Other pleural conditions","4;T;X;10;J90;J94.0;J94.0;J940;Chylous effusion;Chylous effusion","4;T;X;10;J90;J94.1;J94.1;J941;Fibrothorax;Fibrothorax"].join("\n");
  const parsed=index.parseTabularText(text);
  assert.equal(parsed.rows,3);
  assert.equal(index.getCodeStatus("J94",parsed.codeMap),"non_terminal");
  assert.equal(index.getCodeStatus("J94.0",parsed.codeMap),"matched");
  assert.equal(index.getCodeStatus("J94.8",parsed.codeMap),"not_found");
  assert.equal(index.getCodeStatus("J94.-",parsed.codeMap),"non_terminal");
});

test("searches hierarchy context and codes", () => {
  const entries=index.parseIndexLines(["Infection","-kidney N15.9","- - with calculus N20.0"],40,{section:"diseases",stack:{}});
  assert.equal(index.searchEntries(entries,"calculus",5)[0].term,"with calculus N20.0");
  assert.equal(index.searchEntries(entries,"kidney with calculus",5).length,1);
  assert.equal(index.searchEntries(entries,"N20.0",5).length,1);
});

test("stops at Section III so drug table rows are not mislabeled as index entries", () => {
  const state = { section: "external_causes", stack: {} };
  const entries = index.parseIndexLines([
    "Wrong fluid in infusion Y65.1",
    "SECTION III - Table of drugs and chemicals",
    "Abrine T62.2 X49.- X69.-"
  ], 1718, state);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].section, "external_causes");
  assert.equal(state.finished, true);
});

test("direct index term results rank ahead of see-also references", () => {
  const entries = index.parseIndexLines([
    "Abscess",
    "-brain G06.0",
    "Empyema",
    "-ventricular (see also Abscess, brain) G06.0"
  ], 30, { section: "diseases", stack: {} });
  const results = index.searchEntries(entries, "abscess brain", 10);
  assert.equal(results[0].term, "brain G06.0");
  assert.equal(results[0].parent, "Abscess");
});

test("groups PDF text by baseline coordinates instead of hasEOL", () => {
  const items = [
    { str: "Abscess", transform: [1,0,0,1,40,700], width: 42, hasEOL: false },
    { str: "-brain", transform: [1,0,0,1,40,685], width: 32, hasEOL: false },
    { str: "G06.0", transform: [1,0,0,1,78,685], width: 25, hasEOL: true },
    { str: "Diabetes", transform: [1,0,0,1,40,670], width: 45, hasEOL: true }
  ];
  assert.deepEqual(index.groupPdfTextItems(items, 500), [
    "Abscess", "-brain G06.0", "Diabetes"
  ]);
});

test("coordinate-grouped index rows retain their own codes", () => {
  const lines = index.groupPdfTextItems([
    { str: "Abscess", transform: [1,0,0,1,40,700], width: 42 },
    { str: "-brain", transform: [1,0,0,1,40,685], width: 32 },
    { str: "G06.0", transform: [1,0,0,1,78,685], width: 25 },
    { str: "-spinal cord NEC", transform: [1,0,0,1,40,670], width: 88 },
    { str: "G04.9", transform: [1,0,0,1,132,670], width: 25 }
  ], 500);
  const entries = index.parseIndexLines(lines, 858, { section: "diseases", stack: {} });
  assert.equal(entries[1].term, "brain G06.0");
  assert.deepEqual(entries[1].codes, ["G06.0"]);
  assert.deepEqual(entries[2].codes, ["G04.9"]);
});


test("keeps a long left-column entry intact when it crosses the page midpoint", () => {
  const lines = index.groupPdfTextItems([
    { str: "Long index term with qualifiers", transform: [1,0,0,1,40,700], width: 270 },
    { str: "Right column term", transform: [1,0,0,1,360,700], width: 110 },
    { str: "G06.1", transform: [1,0,0,1,40,685], width: 28 }
  ], 500);
  assert.deepEqual(lines, [
    "Long index term with qualifiers",
    "G06.1",
    "Right column term"
  ]);
});

test("fallback uses real line breaks when PDF.js coordinates are unavailable", () => {
  const lines = index.groupPdfTextItems([
    { str: "Abscess", hasEOL: true },
    { str: "Diabetes", hasEOL: false },
    { str: "Hypertension", hasEOL: true }
  ], 0);
  assert.deepEqual(lines, ["Abscess", "Diabetes Hypertension"]);
});

test("recognizes the WHO Volume 3 running heading for external causes", () => {
  const state = { section: "diseases", stack: {} };
  const entries = index.parseIndexLines([
    "Final disease index term Z99.9",
    "EXTERNAL CAUSES OF INJURY",
    "Struck by object W20"
  ], 717, state);
  assert.equal(entries.length, 2);
  assert.equal(entries[0].section, "diseases");
  assert.equal(entries[1].section, "external_causes");
});

test("stops at the actual WHO Volume 3 drug and chemical table heading", () => {
  const state = { section: "external_causes", stack: {} };
  const entries = index.parseIndexLines([
    "Suicide X84",
    "TABLE OF DRUGS AND CHEMICALS",
    "Aspirin T39.0 X40 X60 Y10 Y45.1"
  ], 723, state);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].section, "external_causes");
  assert.equal(state.finished, true);
});


test("splits WHO two-column rows by recurring text origins even when gutter is narrow", () => {
  const items = [];
  for (let i = 0; i < 12; i++) {
    const y = 700 - i * 12;
    items.push(
      { str: "Left entry " + i + " A" + String(i).padStart(2,"0") + ".0", transform: [1,0,0,1,70,y], width: 170, hasEOL: false },
      { str: "Right entry " + i + " B" + String(i).padStart(2,"0") + ".0", transform: [1,0,0,1,250,y], width: 140, hasEOL: false }
    );
  }
  const lines = index.groupPdfTextItems(items, 595);
  assert.equal(lines.length, 24);
  assert.match(lines[0], /^Left entry 0/);
  assert.match(lines[11], /^Left entry 11/);
  assert.match(lines[12], /^Right entry 0/);
  assert.match(lines[23], /^Right entry 11/);
  assert.ok(!lines.some(line => line.includes("Right entry") && line.includes("Left entry")));
});


test("joins indented visual continuation lines without absorbing new subentries", () => {
  const lines = index.groupPdfTextItems([
    { str: "Abduction contracture, hip or other", transform: [1,0,0,1,70,700], width: 160 },
    { str: "joint - see Contraction, joint", transform: [1,0,0,1,79,690], width: 145 },
    { str: "- knee", transform: [1,0,0,1,70,680], width: 35 },
    { str: "M24.5", transform: [1,0,0,1,110,680], width: 25 }
  ], 0);
  assert.deepEqual(lines, [
    "Abduction contracture, hip or other joint - see Contraction, joint",
    "- knee M24.5"
  ]);
});
