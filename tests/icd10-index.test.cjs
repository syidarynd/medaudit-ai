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
