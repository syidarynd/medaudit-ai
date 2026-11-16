const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

test("imports the official WHO 2016 Volume 3 PDF and passes five Android baseline searches", {
  timeout: 600000
}, async t => {
  const pdfPath = process.env.WHO_ICD10_INDEX_PDF;
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    t.skip("WHO_ICD10_INDEX_PDF is not available in this environment");
    return;
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  assert.ok(pdfBuffer.length > 1000000, "WHO PDF download is unexpectedly small");

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

    const tabular = [
      "4;T;X;06;G06;G06.0;G06.0;G060;Intracranial abscess and granuloma;Intracranial abscess and granuloma;;;001;4-001;3-001;2-001;1-001",
      "4;T;X;04;E11;E11.9;E11.9;E119;Type 2 diabetes mellitus;Type 2 diabetes mellitus;;;001;4-001;3-001;2-001;1-001",
      "4;T;X;09;I10;I10;I10;I10;Essential (primary) hypertension;Essential (primary) hypertension;;;001;4-001;3-001;2-001;1-001"
    ].join("\n");

    await page.locator("#indexPdfFile").setInputFiles({
      name: "9789241549165-V3-eng.pdf", mimeType: "application/pdf", buffer: pdfBuffer
    });
    await page.locator("#tabularFile").setInputFiles({
      name: "tabular-regression-fixture.txt", mimeType: "text/plain", buffer: Buffer.from(tabular)
    });
    await page.locator("#loadIcdReferences").click();
    await page.waitForFunction(() => {
      const status = document.querySelector("#icdIndexStatus").textContent;
      return status.includes("Selesai.") || status.includes("Gagal memproses");
    }, { timeout: 480000 });

    const importStatus = await page.locator("#icdIndexStatus").innerText();
    assert.match(importStatus, /Selesai\./, "WHO PDF import failed: " + importStatus + " | page errors: " + pageErrors.join("; "));
    assert.match(importStatus, /entri indeks/i, "Import status did not report parsed index entries");

    const cases = [
      { query: "abscess", expected: /Abscess/i },
      { query: "diabetes", expected: /Diabetes/i },
      { query: "hypertension", expected: /Hypertension/i },
      { query: "brain", expected: /brain/i },
      { query: "G06.0", expected: /G06\.0/ }
    ];
    for (const item of cases) {
      await page.locator("#indexSearchInput").fill(item.query);
      await page.locator("#searchIcdIndex").click();
      const results = await page.locator("#indexResults").innerText();
      assert.match(results, item.expected, "No expected WHO index result for query: " + item.query);
    }

    assert.deepEqual(pageErrors, []);
    await context.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
