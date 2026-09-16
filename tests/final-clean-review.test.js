"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { launch, createPage, show, verifyVisualAssets } = require("./helpers/responsive-harness");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "test-artifacts", "final-clean-review");
const cases = [
  { width: 932, height: 430, name: "932x430-youre-up", phoneLandscape: true },
  { width: 844, height: 390, name: "844x390-youre-up", phoneLandscape: true },
  { width: 430, height: 932, name: "430x932-youre-up" },
  { width: 1918, height: 1010, name: "1918x1010-youre-up" },
];

test("clean review captures protect You’re Up spacing and local-proof behavior", { timeout: 120000 }, async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await launch();
  try {
    for (const item of cases) {
      const page = await createPage(browser, item);
      try {
        await show(page, "handoff");
        await page.evaluate(() => { document.querySelector(".handoff-count").textContent = "3"; });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(120);
        const proof = await verifyVisualAssets(page, { required: ["West_Coast_Master_Runtime_"], avatar: true });
        assert.deepEqual(proof.missing, []);
        assert.deepEqual(proof.network.requestFailed, []);

        const metrics = await page.evaluate(() => {
          const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
          return { board: rect(".wc-master-board"), player: rect(".handoff-player-name"), count: rect(".handoff-count"), localBadge: Boolean(document.querySelector("#losLocalBuildProof")) };
        });
        assert.equal(metrics.localBadge, true, "loopback QA badge should still initialize");
        fs.writeFileSync(path.join(OUT, `${item.name}.json`), JSON.stringify(metrics, null, 2));
        if (item.phoneLandscape) {
          assert.ok(metrics.player.bottom + 10 < metrics.count.top, `${item.name} player/count gap`);
          assert.ok(metrics.count.bottom + 10 < metrics.board.bottom, `${item.name} countdown/bottom gap`);
        }
        await page.evaluate(() => { const badge = document.querySelector("#losLocalBuildProof"); if (badge) badge.style.display = "none"; });
        assert.equal(await page.locator("#losLocalBuildProof:visible").count(), 0);
        await page.screenshot({ path: path.join(OUT, `${item.name}.png`), animations: "disabled" });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});
