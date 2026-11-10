
/**
 * MedAudit AI v0.4.0
 * Automated Audit Engine Tests
 *
 * Menjalankan pengujian mesin audit menggunakan Node.js.
 * Data yang digunakan sepenuhnya sintetis.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

// Memuat mesin audit dari folder js
const auditPath = path.join(
  __dirname,
  "../js/audit.js"
);

const source = fs.readFileSync(auditPath, "utf8");
const windowMock = {};

vm.runInNewContext(source, {
  window: windowMock
});

const engine = windowMock.MedAuditEngine;

// Data rekam medis sintetis yang valid
const validRecord = {
  id: "TEST-001",
  mrn: "RM-TEST-001",
  name: "Pasien Demo",
  admit: "2026-01-10",
  discharge: "2026-01-12",
  mainDx: "Demonstrasi diagnosis",
  code: "A09",
  kelas: "Kelas 3",
  resumeComplete: true,
  dpjpSigned: true
};

// Memastikan mesin audit tersedia
test("Mesin audit berhasil dimuat", () => {
  assert.ok(engine);
  assert.equal(typeof engine.audit, "function");
  assert.equal(typeof engine.auditAll, "function");
});

// Pengujian rekam medis lengkap
test("Data lengkap tidak menghasilkan temuan", () => {
  assert.equal(
    engine.audit(validRecord).length,
    0
  );
});

// DQ-01: Identitas pasien
test("DQ-01 mendeteksi nomor RM kosong", () => {
  const record = {
    ...validRecord,
    mrn: ""
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-01"
    )
  );
});

test("DQ-01 mendeteksi nama kosong", () => {
  const record = {
    ...validRecord,
    name: ""
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-01"
    )
  );
});

// DQ-02: Tanggal masuk
test("DQ-02 mendeteksi tanggal masuk kosong", () => {
  const record = {
    ...validRecord,
    admit: ""
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-02"
    )
  );
});

test("DQ-02 mendeteksi tanggal masuk tidak valid", () => {
  const record = {
    ...validRecord,
    admit: "2026-02-30"
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-02"
    )
  );
});

test("DQ-02 mendeteksi tanggal masuk masa depan", () => {
  const record = {
    ...validRecord,
    admit: "2999-01-01"
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-02"
    )
  );
});

// DQ-03: Tanggal keluar
test("DQ-03 mendeteksi tanggal keluar tidak valid", () => {
  const record = {
    ...validRecord,
    discharge: "2026-02-30"
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-03"
    )
  );
});

test("DQ-03 mendeteksi tanggal keluar sebelum masuk", () => {
  const record = {
    ...validRecord,
    admit: "2026-01-15",
    discharge: "2026-01-10"
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-03"
    )
  );
});

// DQ-04: Diagnosis utama
test("DQ-04 mendeteksi diagnosis utama kosong", () => {
  const record = {
    ...validRecord,
    mainDx: ""
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-04"
    )
  );
});

// DQ-05: Kode ICD-10
test("DQ-05 mendeteksi kode ICD-10 kosong", () => {
  const record = {
    ...validRecord,
    code: ""
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-05"
    )
  );
});

test("DQ-05 mendeteksi format kode tidak sesuai pola", () => {
  const record = {
    ...validRecord,
    code: "12345"
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-05"
    )
  );
});

test("Format kode ICD-10 dasar diterima", () => {
  assert.equal(
    engine.isBasicIcd10Format("A09"),
    true
  );

  assert.equal(
    engine.isBasicIcd10Format("J18.9"),
    true
  );
});

// DQ-06: Kelas rawat
test("DQ-06 mendeteksi kelas rawat kosong", () => {
  const record = {
    ...validRecord,
    kelas: ""
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-06"
    )
  );
});

// DQ-07: Resume medis
test("DQ-07 mendeteksi resume belum lengkap", () => {
  const record = {
    ...validRecord,
    resumeComplete: false
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-07"
    )
  );
});

// DQ-08: Autentikasi DPJP
test("DQ-08 mendeteksi autentikasi DPJP belum tersedia", () => {
  const record = {
    ...validRecord,
    dpjpSigned: false
  };

  assert.ok(
    engine.audit(record).some(
      item => item.code === "DQ-08"
    )
  );
});

// Pengujian audit seluruh data
test("auditAll dapat memproses beberapa rekam medis", () => {
  const records = [
    validRecord,
    {
      ...validRecord,
      mrn: ""
    }
  ];

  const findings = engine.auditAll(records);

  assert.ok(Array.isArray(findings));
  assert.ok(
    findings.some(item => item.code === "DQ-01")
  );
});

// Pengujian data kosong
test("auditAll aman menerima data bukan array", () => {
  assert.equal(
    engine.auditAll(null).length,
    0
  );
});
