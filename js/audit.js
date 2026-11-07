
(() => {
  const isValidDate = value => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;
  };

  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  function audit(record) {
    const findings = [];
    const add = (code, title, detail) =>
      findings.push({
        code,
        title,
        detail,
        visitId: record.visitId || "(tanpa ID)",
        patient: record.patient || "(tanpa nama)"
      });

    if (!String(record.visitId ?? "").trim() ||
        !String(record.patient ?? "").trim()) {
      add("DQ-01", "Identitas kunjungan belum lengkap",
        "ID kunjungan dan/atau nama inisial pasien belum diisi.");
    }

    if (!isValidDate(record.admissionDate)) {
      add("DQ-02", "Tanggal masuk tidak valid",
        "Tanggal masuk kosong atau tidak menggunakan tanggal kalender yang valid.");
    } else if (record.admissionDate > today()) {
      add("DQ-02", "Tanggal masuk di masa depan",
        "Periksa kembali tanggal masuk kunjungan.");
    }

    if (record.dischargeDate) {
      if (!isValidDate(record.dischargeDate)) {
        add("DQ-03", "Tanggal keluar tidak valid",
          "Tanggal keluar diisi tetapi bukan tanggal kalender yang valid.");
      } else if (isValidDate(record.admissionDate) &&
                 record.dischargeDate < record.admissionDate) {
        add("DQ-03", "Tanggal keluar lebih awal",
          "Tanggal keluar tercatat sebelum tanggal masuk.");
      }
    }

    if (!String(record.diagnosis ?? "").trim()) {
      add("DQ-04", "Diagnosis utama belum diisi",
        "Lengkapi diagnosis utama berdasarkan dokumentasi klinis.");
    }

    if (String(record.icdCode ?? "").trim() &&
        !/^[A-Z][0-9][0-9](\.[0-9A-Z]{1,4})?$/.test(
          String(record.icdCode).trim().toUpperCase()
        )) {
      add("DQ-05", "Format kode perlu diperiksa",
        "Format kode tidak sesuai pola umum. Verifikasi ke indeks dan tabular ICD-10.");
    }

    if (!String(record.classRoom ?? "").trim()) {
      add("DQ-06", "Kelas rawat belum dipilih",
        "Pilih kelas rawat atau status tidak berlaku sesuai konteks pelayanan.");
    }

    if (record.resumeComplete !== true) {
      add("DQ-07", "Resume medis belum lengkap",
        "Status kelengkapan resume medis belum dikonfirmasi.");
    }

    if (record.dpjpSigned !== true) {
      add("DQ-08", "Autentikasi DPJP belum lengkap",
        "Status autentikasi DPJP belum dikonfirmasi.");
    }

    return findings;
  }

  window.MedAuditEngine = {
    audit,
    auditAll(records) {
      return records.flatMap(audit);
    },
    isValidDate
  };
})();
