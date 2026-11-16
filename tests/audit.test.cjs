const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../js/audit.js");

const clean = {
  id: "1", mrn: "DEMO-001", name: "Pasien Fiktif A",
  admit: "2026-10-10", discharge: "2026-10-11",
  mainDx: "Demam", code: "R50.9", kelas: "Kelas 2",
  resumeComplete: true, dpjpSigned: true
};

test("valid calendar date and invalid rollover date", () => {
  assert.equal(engine.isValidDate("2026-02-28"), true);
  assert.equal(engine.isValidDate("2026-02-30"), false);
  assert.equal(engine.isValidDate("28/02/2026"), false);
});

test("clean synthetic visit has no findings", () => {
  assert.deepEqual(engine.audit(clean, [clean]), []);
});

test("DQ-09 does not flag the same MRN on a different visit date", () => {
  const otherVisit = { ...clean, id: "2", mrn: "demo-001", admit: "2026-10-20", discharge: "2026-10-21" };
  const findings = engine.audit(clean, [clean, otherVisit]);
  assert.equal(findings.some(x => x.code === "DQ-09"), false);
});

test("DQ-09 flags a likely duplicate encounter with the same MRN and encounter details", () => {
  const duplicate = { ...clean, id: "2", mrn: "demo-001" };
  const findings = engine.audit(clean, [clean, duplicate]);
  assert.equal(findings.filter(x => x.code === "DQ-09").length, 1);
  assert.match(findings.find(x => x.code === "DQ-09").text, /Kemungkinan duplikasi kunjungan/);
});

test("DQ-09 normalizes MRN case and diagnosis whitespace before matching", () => {
  const duplicate = { ...clean, id: "2", mrn: " demo-001 ", mainDx: " demam   " };
  assert.equal(engine.isPotentialDuplicateEncounter(clean, duplicate), true);
});

test("DQ-09 does not flag records with incomplete encounter identity", () => {
  const incomplete = { ...clean, id: "2", admit: "" };
  assert.equal(engine.isPotentialDuplicateEncounter(clean, incomplete), false);
});

test("DQ-10 flags a mismatch for a supported example diagnosis", () => {
  const findings = engine.audit({ ...clean, code: "A09" }, [{ ...clean, code: "A09" }]);
  assert.equal(findings.some(x => x.code === "DQ-10"), true);
});

test("DQ-10 does not guess for an unlisted diagnosis", () => {
  const findings = engine.audit({ ...clean, mainDx: "Diagnosis tidak ada di daftar", code: "A09" }, []);
  assert.equal(findings.some(x => x.code === "DQ-10"), false);
});

test("auditAll returns findings for all visits and includes the synthetic MRN", () => {
  const records = [clean, { ...clean, id: "2", mrn: "DEMO-002", mainDx: "", code: "" }];
  const findings = engine.auditAll(records);
  assert.ok(findings.some(x => x.code === "DQ-04" && x.mrn === "DEMO-002"));
  assert.ok(findings.some(x => x.code === "DQ-05" && x.mrn === "DEMO-002"));
});

test("DQ-10 accepts the configured example pair without mismatch finding", () => {
  const findings = engine.audit(clean, [clean]);
  assert.equal(findings.some(x => x.code === "DQ-10"), false);
});

test("DQ-09 ignores blank medical-record numbers", () => {
  const blank = { ...clean, mrn: "" };
  const findings = engine.audit(blank, [blank, { ...blank, id: "2" }]);
  assert.equal(findings.some(x => x.code === "DQ-09"), false);
});
