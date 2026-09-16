"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { launch, createPage, show, verifyVisualAssets } = require("./helpers/responsive-harness");

test("desktop surgical geometry remains protected", { timeout: 120000 }, async () => {
  const browser = await launch();
  try {
    for (const viewport of [{ width: 1918, height: 1010 }, { width: 1920, height: 1080 }]) {
      const page = await createPage(browser, viewport);
      try {
        await show(page, "question-ordinary");
        await page.evaluate(() => {
          const a = window.__RESPONSIVE__, s = a.state;
          s.game.current = { q: "Which internationally recognized scientific achievement permanently transformed how generations understand humanity’s relationship with the natural world?", a: "The theory of evolution by natural selection" };
          a.question(true);
        });
        let proof = await verifyVisualAssets(page, { required: ["West_Coast_Master_Runtime_"], avatar: true });
        assert.deepEqual(proof.missing, []);
        let geometry = await page.evaluate(() => {
          const q = document.querySelector(".question-text").getBoundingClientRect();
          const inputs = document.querySelector(".question-inputs").getBoundingClientRect();
          const area = document.querySelector(".wc-question-presentation").getBoundingClientRect();
          return { contained: q.top >= area.top - 1 && q.bottom <= area.bottom + 1, gap: inputs.top - q.bottom };
        });
        assert.equal(geometry.contained, true);
        assert.ok(geometry.gap >= 20);

        await show(page, "handoff");
        geometry = await page.evaluate(() => {
          const board = document.querySelector(".wc-master-board").getBoundingClientRect();
          const name = document.querySelector(".handoff-player-name").getBoundingClientRect();
          return { delta: name.left + name.width / 2 - (board.left + board.width / 2) };
        });
        assert.ok(geometry.delta >= 12 && geometry.delta <= 16);

        await show(page, "champion");
        proof = await verifyVisualAssets(page, { required: ["Winner_"], avatar: true });
        assert.deepEqual(proof.missing, []);
        geometry = await page.evaluate(() => {
          const gear = document.querySelector(".wc-settings-gear").getBoundingClientRect();
          return { inside: gear.left >= 0 && gear.top >= 0 && gear.right <= innerWidth && gear.bottom <= innerHeight, artOpacity: getComputedStyle(document.querySelector(".wc-settings-gear-art")).opacity };
        });
        assert.equal(geometry.inside, true);
        assert.equal(geometry.artOpacity, "0");
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});
