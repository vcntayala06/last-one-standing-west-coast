"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { launch, createPage, show, verifyVisualAssets } = require("./helpers/responsive-harness");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "test-artifacts", "desktop-final-alignment");
const PHASE = process.env.ALIGNMENT_PHASE || "after";
const screens = [
  { name: "youre-up", show: "handoff", asset: "West_Coast_Master_Runtime_" },
  { name: "winner", show: "champion", asset: "Winner_" },
  { name: "showtime", show: "ready", asset: "West_Coast_Master_Runtime_" },
];
const viewports = [
  { width: 1918, height: 1010, name: "1918x1010", desktop: true },
  { width: 1920, height: 1080, name: "1920x1080", desktop: true },
  { width: 430, height: 932, name: "430x932", desktop: false },
  { width: 932, height: 430, name: "932x430", desktop: false },
];

test(`desktop final alignment ${PHASE}`, { timeout: 180000 }, async () => {
  fs.mkdirSync(path.join(OUT, PHASE), { recursive: true });
  const browser = await launch();
  try {
    for (const viewport of viewports) {
      const page = await createPage(browser, viewport);
      try {
        for (const screen of screens) {
          await show(page, screen.show);
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(120);
          if (screen.name === "youre-up") await page.evaluate(() => { document.querySelector(".handoff-count").textContent = "3"; });
          const proof = await verifyVisualAssets(page, { required: [screen.asset], avatar: true });
          assert.deepEqual(proof.missing, []);
          assert.deepEqual(proof.decodeFailures, []);
          assert.deepEqual(proof.network.requestFailed, []);
          assert.deepEqual(proof.network.httpErrors, []);
          const metrics = await page.evaluate(name => {
            const rect = selector => document.querySelector(selector)?.getBoundingClientRect().toJSON();
            const centerX = value => value.left + value.width / 2;
            const board = rect(".wc-master-board");
            const result = { horizontal: document.documentElement.scrollWidth - innerWidth, vertical: document.documentElement.scrollHeight - innerHeight, board };
            if (name === "youre-up") {
              const title = rect(".handoff-hype"), player = rect(".handoff-player-name"), count = rect(".handoff-count");
              Object.assign(result, { title, player, count, titleDelta: centerX(title) - centerX(board), playerDelta: centerX(player) - centerX(board), countGap: count.top - player.bottom, countBottomGap: board.bottom - count.bottom });
            }
            if (name === "winner") {
              const box = rect(".champion-box"), player = rect(".champion-name"), gears = [...document.querySelectorAll(".wc-master-winner .wc-settings-gear")];
              Object.assign(result, { box, player, nameDelta: centerX(player) - centerX(box), nameVerticalDelta: player.top + player.height / 2 - (box.top + box.height / 2), gearCount: gears.length, gearArtOpacity: getComputedStyle(document.querySelector(".wc-settings-gear-art")).opacity });
            }
            if (name === "showtime") {
              const title = rect("#showtimeTitle strong"), host = rect("#showtimeTitle");
              Object.assign(result, { title, host, completeText: document.querySelector("#showtimeTitle strong")?.textContent.trim(), contained: title.left >= host.left - 1 && title.right <= host.right + 1 });
            }
            return result;
          }, screen.name);
          assert.ok(metrics.horizontal <= 1 && metrics.vertical <= 1);
          if (PHASE === "after" && viewport.desktop) {
            if (screen.name === "youre-up") {
              assert.ok(metrics.board.top < metrics.title.top);
              assert.ok(metrics.title.bottom + 12 < metrics.player.top);
              assert.ok(metrics.player.bottom + 16 < metrics.count.top);
              assert.ok(metrics.count.bottom + 16 < metrics.board.bottom);
              assert.ok(metrics.titleDelta > 0 && metrics.titleDelta <= 24);
              assert.ok(metrics.playerDelta > 0 && metrics.playerDelta <= 24);
              assert.ok(metrics.countGap >= 16 && metrics.countBottomGap >= 16);
            }
            if (screen.name === "winner") {
              assert.ok(Math.abs(metrics.nameDelta) <= 1);
              assert.ok(Math.abs(metrics.nameVerticalDelta) <= 1);
              assert.equal(metrics.gearCount, 1);
              assert.equal(metrics.gearArtOpacity, "0");
            }
            if (screen.name === "showtime") {
              assert.equal(metrics.completeText, "IT’S SHOWTIME");
              assert.equal(metrics.contained, true);
            }
          }
          fs.writeFileSync(path.join(OUT, PHASE, `${viewport.name}-${screen.name}.json`), JSON.stringify(metrics, null, 2));
          await page.screenshot({ path: path.join(OUT, PHASE, `${viewport.name}-${screen.name}.png`), animations: "disabled" });
          if (PHASE === "after" && viewport.desktop && screen.name === "winner") {
            await page.click(".wc-master-winner .wc-settings-gear");
            assert.equal(await page.locator(".wc-settings-overlay").count(), 1);
            await page.click("[data-wc-settings-close]");
          }
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});
