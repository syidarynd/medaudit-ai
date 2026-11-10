
/* MedAudit AI v0.4.0
 * Mesin audit terpusat.
 * Format data mengikuti formulir dan LocalStorage index.html.
 * Pemeriksaan berbasis aturan (rule-based), bukan validasi klinis
 * atau validasi kode ICD-10 resmi.
 */

(() => {
  "use strict";

  // Memeriksa validitas tanggal YYYY-MM-DD
  const isValidDate = (value) => {
    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  // Mendapatkan tanggal lokal hari ini
  const todayLocal = () => {
    const date = new Date();
    date.setMinutes(
      date.getMinutes() - date.getTimezoneOffset()
    );

    return date.toISOString().slice(0, 10);
  };

  // Memeriksa pola dasar format kode ICD-10
  const isBasicIcd10Format = (code) => {
    return /^[A-Z][0-9]{2}(?:\.[0-9A-Z]{1,4})?$/.test(
      String(code ?? "").trim().toUpperCase()
    );
  };

  // Fungsi audit satu rekam medis
  function audit(record = {}) {
    const findings = [];

    const add = (code, text) => {
      findings.push({ code, text });
    };

    // DQ-01: Identitas pasien
    if (!String(record.mrn ?? "").trim()) {
      add("DQ-01", "Nomor RM kosong");
    }

    if (!String(record.name ?? "").trim()) {
      add("DQ-01", "Nama/inisial fiktif kosong");
    }

    // DQ-02: Tanggal masuk
    if (!record.admit) {
      add("DQ-02", "Tanggal masuk kosong");
    } else if (!isValidDate(record.admit)) {
      add("DQ-02", "Tanggal masuk tidak valid");
    } else if (record.admit > todayLocal()) {
      add("DQ-02", "Tanggal masuk berada di masa depan");
    }

    // DQ-03: Tanggal keluar
    if (record.discharge) {
      if (!isValidDate(record.discharge)) {
        add("DQ-03", "Tanggal keluar tidak valid");
      } else if (
        isValidDate(record.admit) &&
        record.discharge < record.admit
      ) {
        add(
          "DQ-03",
          "Tanggal keluar lebih awal dari tanggal masuk"
        );
      }
    }

    // DQ-04: Diagnosis utama
    if (!String(record.mainDx ?? "").trim()) {
      add("DQ-04", "Diagnosis utama belum diisi");
    }

    // DQ-05: Kode ICD-10
    if (!String(record.code ?? "").trim()) {
      add("DQ-05", "Kode ICD-10 kosong");
    } else if (!isBasicIcd10Format(record.code)) {
      add("DQ-05", "Format kode ICD-10 perlu diperiksa");
    }

    // DQ-06: Kelas rawat
    if (!String(record.kelas ?? "").trim()) {
      add("DQ-06", "Kelas rawat belum dipilih");
    }

    // DQ-07: Kelengkapan resume medis
    if (record.resumeComplete !== true) {
      add("DQ-07", "Resume medis belum ditandai lengkap");
    }

    // DQ-08: Autentikasi DPJP
    if (record.dpjpSigned !== true) {
      add(
        "DQ-08",
        "Autentikasi DPJP belum ditandai tersedia"
      );
    }

    return findings;
  }

  // Menyediakan mesin audit untuk aplikasi
  window.MedAuditEngine = Object.freeze({
    audit,

    auditAll(records) {
      return (
        Array.isArray(records) ? records : []
      ).flatMap(audit);
    },

    isValidDate,
    isBasicIcd10Format
  });
})();
