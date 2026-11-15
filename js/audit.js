/* MedAudit AI v0.4.0 — rule-based data quality engine.
 * DQ-10 is a conservative, curated demonstration cross-check, not an ICD-10 encoder.
 */
(() => {
  "use strict";

  const isValidDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const todayLocal = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
  };

  const isBasicIcd10Format = (code) =>
    /^[A-Z][0-9]{2}(?:\.[0-9A-Z]{1,4})?$/.test(String(code ?? "").trim().toUpperCase());

  // Limited examples for demonstration only. Unknown diagnoses are deliberately not judged.
  const diagnosisCodeExamples = [
    { terms: ["demam tifoid", "typhoid fever", "tifoid"], code: "A01.0" },
    { terms: ["gastroenteritis", "gastroenteritis akut"], code: "A09" },
    { terms: ["demam", "febris"], code: "R50.9" },
    { terms: ["diabetes melitus tipe 2", "diabetes mellitus type 2", "dm tipe 2"], code: "E11.9" }
  ];

  const normalizeDiagnosis = (value) =>
    String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  function audit(record = {}, records = []) {
    const findings = [];
    const add = (code, text) => findings.push({ code, text });
    const mrn = String(record.mrn ?? "").trim();
    if (!mrn) add("DQ-01", "Nomor RM kosong");
    if (!String(record.name ?? "").trim()) add("DQ-01", "Nama/inisial fiktif kosong");

    if (!record.admit) add("DQ-02", "Tanggal masuk kosong");
    else if (!isValidDate(record.admit)) add("DQ-02", "Tanggal masuk tidak valid");
    else if (record.admit > todayLocal()) add("DQ-02", "Tanggal masuk berada di masa depan");

    if (record.discharge) {
      if (!isValidDate(record.discharge)) add("DQ-03", "Tanggal keluar tidak valid");
      else if (isValidDate(record.admit) && record.discharge < record.admit)
        add("DQ-03", "Tanggal keluar lebih awal dari tanggal masuk");
    }

    if (!String(record.mainDx ?? "").trim()) add("DQ-04", "Diagnosis utama belum diisi");
    if (!String(record.code ?? "").trim()) add("DQ-05", "Kode ICD-10 kosong");
    else if (!isBasicIcd10Format(record.code)) add("DQ-05", "Format kode ICD-10 perlu diperiksa");
    if (!String(record.kelas ?? "").trim()) add("DQ-06", "Kelas rawat belum dipilih");
    if (record.resumeComplete !== true) add("DQ-07", "Resume medis belum ditandai lengkap");
    if (record.dpjpSigned !== true) add("DQ-08", "Autentikasi DPJP belum ditandai tersedia");

    // DQ-09: duplicate medical-record number across distinct visits.
    if (mrn && Array.isArray(records)) {
      const duplicates = records.filter(other =>
        other && other.id !== record.id &&
        String(other.mrn ?? "").trim().toLocaleLowerCase() === mrn.toLocaleLowerCase()
      );
      if (duplicates.length) add("DQ-09", "Nomor RM terdeteksi sama pada " + duplicates.length + " data kunjungan lain");
    }

    // DQ-10: compare only diagnoses covered by the small, explicit example list.
    const diagnosis = normalizeDiagnosis(record.mainDx);
    const known = diagnosisCodeExamples.find(entry =>
      entry.terms.some(term => normalizeDiagnosis(term) === diagnosis)
    );
    const code = String(record.code ?? "").trim().toUpperCase();
    if (known && code && isBasicIcd10Format(code) && code !== known.code) {
      add("DQ-10", "Kode ICD-10 berbeda dari pasangan contoh untuk diagnosis ini (rujukan demo: " + known.code + "); verifikasi indeks dan tabular resmi");
    }

    return findings;
  }

  const engine = Object.freeze({
    audit,
    auditAll(records) {
      const list = Array.isArray(records) ? records : [];
      return list.flatMap(record => audit(record, list).map(issue => ({ ...issue, mrn: record.mrn ?? "" })));
    },
    isValidDate,
    isBasicIcd10Format
  });

  if (typeof module !== "undefined" && module.exports) module.exports = engine;
  if (typeof window !== "undefined") window.MedAuditEngine = engine;
})();
