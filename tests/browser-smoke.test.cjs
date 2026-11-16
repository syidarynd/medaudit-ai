const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

function createPdfFixture() {
  const stream = [
    "BT", "/F1 12 Tf",
    "72 720 Td (SECTION I - Alphabetical index to diseases and nature of injury) Tj",
    "0 -20 Td (A) Tj", "0 -20 Td (Abscess) Tj", "0 -20 Td (-brain G06.0) Tj",
    "0 -20 Td (SECTION II - External causes of injury) Tj",
    "0 -20 Td (Assault W50) Tj",
    "0 -20 Td (SECTION III - Table of drugs and chemicals) Tj",
    "0 -20 Td (Drug sample T42.0) Tj", "ET"
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length " + Buffer.byteLength(stream, "utf8") + " >>\nstream\n" + stream + "\nendstream"
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += (index + 1) + " 0 obj\n" + object + "\nendobj\n";
  });
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF";
  return Buffer.from(pdf, "utf8");
}

test("mobile browser can import a local PDF and search the ICD-10 index", { timeout: 120000 }, async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + path.sep) && file !== path.join(root, "index.html")) {
      res.writeHead(403).end("Forbidden"); return;
    }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404).end("Not found"); return; }
      res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    await page.goto("http://127.0.0.1:" + address.port + "/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.MedAuditIndex && window.pdfjsLib, { timeout: 30000 });
    await page.locator('button[data-tab="icd10"]').click();
    assert.match(await page.locator("#icd10 h2").first().innerText(), /Pencarian Alphabetical Index/);

    const tabular = "4;T;X;06;G06;G06.0;G06.0;G060;Intracranial abscess and granuloma;Intracranial abscess and granuloma;;;001;4-001;3-001;2-001;1-001";
    await page.locator("#indexPdfFile").setInputFiles({
      name: "index-fixture.pdf", mimeType: "application/pdf", buffer: createPdfFixture()
    });
    await page.locator("#tabularFile").setInputFiles({
      name: "tabular-fixture.txt", mimeType: "text/plain", buffer: Buffer.from(tabular)
    });
    await page.locator("#loadIcdReferences").click();
    await page.waitForFunction(() => {
      const status = document.querySelector("#icdIndexStatus").textContent;
      return status.includes("Selesai.") || status.includes("Gagal memproses");
    }, { timeout: 30000 });
    const importStatus = await page.locator("#icdIndexStatus").innerText();
    assert.match(importStatus, /Selesai\./, "PDF import failed: " + importStatus + " | page errors: " + pageErrors.join("; "));
    await page.locator("#indexSearchInput").fill("brain");
    await page.locator("#searchIcdIndex").click();
    const results = await page.locator("#indexResults").innerText();
    assert.match(results, /brain G06\.0/);
    assert.match(results, /Abscess/);
    assert.match(results, /Ditemukan sebagai kode terminal/);
    assert.doesNotMatch(results, /Drug sample/);

    // Cached parsed references must survive a reload and restore without file selection.
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.MedAuditIndex && document.querySelector("#icdIndexStatus").textContent.includes("Referensi dimuat otomatis"), { timeout: 10000 });
    await page.locator('button[data-tab="icd10"]').click();
    assert.equal(await page.locator("#indexPdfFile").inputValue(), "");
    assert.equal(await page.locator("#tabularFile").inputValue(), "");
    await page.locator("#indexSearchInput").fill("brain");
    await page.locator("#searchIcdIndex").click();
    const restoredResults = await page.locator("#indexResults").innerText();
    assert.match(restoredResults, /brain G06\.0/);
    assert.match(restoredResults, /Ditemukan sebagai kode terminal/);

    // A cache quota failure must not discard the freshly parsed in-memory reference.
    await page.evaluate(() => {
      Object.defineProperty(indexedDB, "open", {
        configurable: true,
        value: () => {
          const request = {};
          queueMicrotask(() => {
            request.result = {
              transaction: () => ({
                objectStore: () => ({
                  put: () => { throw new DOMException("Quota exceeded", "QuotaExceededError"); }
                })
              }),
              close: () => {}
            };
            if (request.onsuccess) request.onsuccess();
          });
          return request;
        }
      });
    });
    await page.locator("#indexPdfFile").setInputFiles({
      name: "index-fixture.pdf", mimeType: "application/pdf", buffer: createPdfFixture()
    });
    await page.locator("#tabularFile").setInputFiles({
      name: "tabular-fixture.txt", mimeType: "text/plain", buffer: Buffer.from(tabular)
    });
    await page.locator("#loadIcdReferences").click();
    await page.waitForFunction(() =>
      document.querySelector("#icdIndexStatus").textContent.includes("Pencarian siap digunakan pada sesi ini")
    );
    assert.equal(await page.locator("#icdIndexStatus").getAttribute("class"), "warn");
    await page.locator("#indexSearchInput").fill("brain");
    await page.locator("#searchIcdIndex").click();
    assert.match(await page.locator("#indexResults").innerText(), /brain G06\.0/);

    // Invalid backup input must be rejected without replacing the existing local records.
    await page.locator('button[data-tab="backup"]').click();
    const recordsBeforeImport = await page.evaluate(() => localStorage.getItem("medaudit_ai_cases_v02"));
    await page.locator("#jsonFile").setInputFiles({
      name: "invalid-backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ records: [{ mrn: 123 }] }))
    });
    await page.locator("#importJson").click();
    await page.waitForFunction(() => document.querySelector("#appMessage").textContent.includes("harus berupa teks"));
    assert.equal(
      await page.evaluate(() => localStorage.getItem("medaudit_ai_cases_v02")),
      recordsBeforeImport,
      "invalid JSON backup must not overwrite existing local data"
    );

    // Backup metadata must match the current application version.
    await page.locator('button[data-tab="dashboard"]').click();
    const backupDownloadPromise = page.waitForEvent("download");
    await page.locator("#jsonExport").click();
    const backupDownload = await backupDownloadPromise;
    const backupPath = await backupDownload.path();
    const backup = JSON.parse(await fs.promises.readFile(backupPath, "utf8"));
    assert.equal(backup.version, "0.7.1");

    const gridColumns = await page.locator(".index-toolbar").first().evaluate(
      element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length
    );
    assert.equal(gridColumns, 1, "mobile search toolbar should use a single column");

    // The same application must remain within the desktop viewport after mobile testing.
    await page.setViewportSize({ width: 1440, height: 900 });
    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    assert.ok(desktopOverflow <= 1, "desktop layout must not overflow horizontally; overflow=" + desktopOverflow + "px");

    // Oversized field values must be rejected without replacing existing local records.
    const recordsBeforeLimitChecks = await page.evaluate(() => localStorage.getItem("medaudit_ai_cases_v02"));
    await page.locator("#jsonFile").setInputFiles({
      name: "oversized-field.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ records: [{ id: "oversized-1", mrn: "X".repeat(41) }] }))
    });
    await page.locator("#importJson").click();
    await page.waitForFunction(() => document.querySelector("#appMessage").textContent.includes("melebihi batas 40 karakter"));
    assert.equal(await page.evaluate(() => localStorage.getItem("medaudit_ai_cases_v02")), recordsBeforeLimitChecks);

    // Excessive record counts must be rejected before normalization/storage.
    const excessiveRecords = Array.from({ length: 5001 }, (_, i) => ({ id: "bulk-" + i, mrn: "DEMO-" + i }));
    await page.locator("#jsonFile").setInputFiles({
      name: "too-many-records.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ records: excessiveRecords }))
    });
    await page.locator("#importJson").click();
    await page.waitForFunction(() => document.querySelector("#appMessage").textContent.includes("melebihi batas 5.000 record"));
    assert.equal(await page.evaluate(() => localStorage.getItem("medaudit_ai_cases_v02")), recordsBeforeLimitChecks);

    assert.deepEqual(pageErrors, []);
    await context.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
