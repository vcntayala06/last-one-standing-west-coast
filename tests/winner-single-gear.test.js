"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { launch, createPage, show, verifyVisualAssets } = require("./helpers/responsive-harness");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "test-artifacts", "desktop-surgical-pass", "winner-single-gear");

test("Winner shows one clickable gear on desktop and preserves mobile geometry", { timeout: 120000 }, async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await launch();
  try {
    const cases = [
      { width: 1918, height: 1010, name: "1918x1010-winner-normal", desktop: true },
      { width: 1920, height: 1080, name: "1918x1010-winner-fullscreen", desktop: true },
      { width: 430, height: 932, name: "430x932-winner", desktop: false },
      { width: 932, height: 430, name: "932x430-winner", desktop: false },
    ];

    for (const item of cases) {
      const page = await createPage(browser, item);
      try {
        await show(page, "champion");
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(120);
        const proof = await verifyVisualAssets(page, { required: ["Winner_"], avatar: true });
        assert.deepEqual(proof.missing, []);
        assert.deepEqual(proof.decodeFailures, []);
        assert.deepEqual(proof.network.requestFailed, []);
        assert.deepEqual(proof.network.httpErrors, []);

        const gear = await page.evaluate(() => {
          const nodes = [...document.querySelectorAll(".wc-master-winner .wc-settings-gear")];
          const element = nodes[0];
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            count: nodes.length,
            visible: style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0,
            inside: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
          };
        });
        assert.equal(gear.count, 1);
        assert.equal(gear.visible, true);
        assert.equal(gear.inside, true);

        await page.screenshot({ path: path.join(OUT, `${item.name}.png`), animations: "disabled" });

        await page.click(".wc-master-winner .wc-settings-gear");
        assert.equal(await page.locator(".wc-settings-overlay").count(), 1);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});
