import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";
import { createBaseViteConfig } from "../vite/lib/vite-base-config.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const server = await createServer({
  ...createBaseViteConfig({ cacheName: "volume-settings-v2-browser" }),
  appType: "spa",
  configFile: false,
  root,
  logLevel: "error",
  define: {
    DEBUG_MODE: "false",
    IS_EXTENSION: "false",
    REPO_BRANCH: '"master"',
    VOT_VERSION: '"test"',
    VOT_AUTHORS: '"test"',
    AVAILABLE_LOCALES: '["en","ru"]',
  },
  server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage();
  page.setDefaultTimeout(10000);
  page.on("pageerror", (error) =>
    console.error("Browser error:", error.message),
  );
  await page.goto(
    `http://127.0.0.1:${server.httpServer.address().port}/tests/browser-volume-settings-v2.html`,
  );
  await page.waitForFunction(() => window.fixture);
  assert.equal(
    await page
      .getByRole("switch", {
        name: "✨ Automatically reduce video volume",
        exact: true,
      })
      .count(),
    1,
  );
  assert.equal(
    await page
      .getByRole("switch", {
        name: "✨ Link translation and video volume",
        exact: true,
      })
      .count(),
    1,
  );
  const mode = page
    .locator(".vot-select")
    .filter({ hasText: "✨ Reduction mode" });
  assert.equal(await mode.count(), 1, "reduction mode selector is present");
  const modePopup = page.locator(
    `[id="${await mode.locator(".vot-select-outer").getAttribute("aria-controls")}"]`,
  );
  await mode.locator(".vot-select-outer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await mode.locator(".vot-select-outer").click();
  assert.equal(await modePopup.locator('[role="option"]').count(), 3);
  assert.equal(
    await modePopup.locator("input").count(),
    0,
    "three modes have no search",
  );
  await modePopup.getByRole("option", { name: "✨ Once", exact: true }).click();
  assert.deepEqual(
    await page.evaluate(() => ({
      mode: window.fixture.data.autoVolumeMode,
      smart: window.fixture.data.enabledSmartDucking,
    })),
    { mode: "once", smart: false },
  );
  const snapshot = await page.evaluate(() => window.fixture.snapshots.at(-1));
  assert.equal(snapshot.autoVolumeMode, "once");
  assert.equal(snapshot.enabledSmartDucking, false);
  assert.equal(
    await page.evaluate(() => window.fixture.votStorage.get("autoVolumeMode")),
    "once",
  );
  const offset = page.getByRole("textbox", {
    name: "✨ Translation volume offset (percentage points)",
    exact: true,
  });
  const slider = page.getByRole("slider", {
    name: "✨ Translation volume offset (percentage points)",
    exact: true,
  });
  assert.equal(await offset.count(), 1, "offset text input exists");
  assert.equal(await offset.isDisabled(), true);
  assert.equal(await slider.isDisabled(), true);
  assert.equal(await offset.inputValue(), "0");
  const sync = page.getByRole("switch", {
    name: /Link translation and video volume/i,
  });
  await sync.check();
  assert.equal(await offset.isDisabled(), false);
  assert.equal(await slider.getAttribute("min"), "-10");
  assert.equal(await slider.getAttribute("max"), "100");
  assert.equal(await slider.getAttribute("step"), "5");
  const fullBoost = page.getByRole("switch", {
    name: "Extended translation volume increase",
    exact: true,
  });
  assert.equal(
    await fullBoost.isDisabled(),
    true,
    "full menu boost is also unavailable during linking",
  );
  await mode.locator(".vot-select-outer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await mode.locator(".vot-select-outer").click();
  assert.equal(
    await modePopup
      .getByRole("option", { name: "✨ Adaptive", exact: true })
      .getAttribute("aria-disabled"),
    "true",
  );
  await mode.locator(".vot-select-outer").click();
  await offset.fill("-10");
  assert.equal(
    await page.evaluate(() => window.fixture.data.translationVolumeOffset),
    -10,
  );
  assert.equal(await slider.inputValue(), "-10");
  assert.equal(
    (await page.evaluate(() => window.fixture.snapshots.at(-1)))
      .translationVolumeOffset,
    -10,
  );
  await slider.fill("25");
  assert.equal(await offset.inputValue(), "+25");
  await offset.fill("12.7");
  await offset.blur();
  assert.equal(await offset.inputValue(), "+15");
  assert.equal(
    await page.evaluate(() => window.fixture.data.translationVolumeOffset),
    15,
  );
  assert.equal(
    await slider.inputValue(),
    "15",
    "numeric entry shares the slider grid",
  );
  await offset.fill("");
  await offset.pressSequentially("75");
  await offset.blur();
  assert.equal(
    await offset.inputValue(),
    "+75",
    "typing must not rewrite intermediate digits",
  );
  assert.equal(await slider.inputValue(), "75");
  await offset.fill("");
  await offset.pressSequentially("-10");
  await offset.blur();
  assert.equal(
    await offset.inputValue(),
    "-10",
    "signed typing must remain editable",
  );
  assert.equal(await slider.inputValue(), "-10");
  await slider.fill("15");
  await offset.fill("junk");
  await offset.blur();
  assert.equal(await offset.inputValue(), "+15");
  await offset.fill("");
  await offset.blur();
  assert.equal(await offset.inputValue(), "+15");
  await offset.fill("999");
  await offset.blur();
  assert.equal(await offset.inputValue(), "+100");
  await offset.fill("-999");
  await offset.blur();
  assert.equal(await offset.inputValue(), "-10");
  await offset.fill("0");
  await offset.blur();
  assert.equal(await offset.inputValue(), "0");
  await offset.focus();
  await offset.press("ControlOrMeta+A");
  await offset.pressSequentially("0");
  await offset.blur();
  await slider.fill("25");
  assert.equal(
    await offset.inputValue(),
    "+25",
    "blur ends editing even when final text was unchanged",
  );
  await slider.fill("0");
  assert.match(
    await page.locator(".vot-volume-offset").textContent(),
    /0 keeps the current relative gap/,
  );
  const mute = page.getByRole("checkbox", {
    name: "✨ Mute translation with the original",
    exact: true,
  });
  assert.equal(await mute.isChecked(), true);
  await mute.uncheck();
  assert.equal(
    await page.evaluate(() => window.fixture.data.muteTranslationWithOriginal),
    false,
  );
  assert.equal(
    (await page.evaluate(() => window.fixture.snapshots.at(-1)))
      .muteTranslationWithOriginal,
    false,
  );
  assert.equal(
    await page.evaluate(() =>
      window.fixture.votStorage.get("muteTranslationWithOriginal"),
    ),
    false,
  );
  await sync.uncheck();
  assert.equal(await offset.isDisabled(), true);
  assert.equal(await slider.isDisabled(), true);
  await page.waitForFunction(
    () => localStorage.getItem("translationVolumeOffset") === "0",
  );
  assert.equal(
    await page.evaluate(() =>
      window.fixture.votStorage.get("translationVolumeOffset"),
    ),
    0,
  );
  await page.evaluate(() => window.fixture.mountMenu());
  const menu = page.locator("#quick-menu");
  const quick = menu.locator(".vot-volume-quick");
  assert.equal(
    await quick.getByRole("button").count(),
    3,
    "three previous-fork quick controls are preserved",
  );
  const quickAuto = quick.getByRole("button", {
    name: "✨ Automatically reduce video volume",
    exact: true,
  });
  await quickAuto.click();
  assert.equal(
    await page.evaluate(() => window.fixture.data.enabledAutoVolume),
    false,
  );
  assert.equal(
    (await page.evaluate(() => window.fixture.snapshots.at(-1)))
      .enabledAutoVolume,
    false,
  );
  assert.equal(await quickAuto.getAttribute("aria-pressed"), "false");
  await quickAuto.click();
  assert.equal(
    await page.evaluate(() =>
      window.fixture.votStorage.get("enabledAutoVolume"),
    ),
    true,
  );
  const quickSync = quick.getByRole("button", {
    name: "✨ Link translation and video volume",
    exact: true,
  });
  await quickSync.click();
  const boost = quick.getByRole("button", {
    name: "✨ Extended translation volume increase",
    exact: true,
  });
  assert.equal(await boost.getAttribute("aria-disabled"), "true");
  await page.evaluate(() =>
    window.fixture.controller.setVolumePreference("syncVolume", false),
  );
  assert.equal(await boost.getAttribute("aria-disabled"), null);
  await boost.click();
  assert.equal(
    await page.evaluate(() => window.fixture.votStorage.get("audioBooster")),
    true,
  );
  await page.evaluate(() => {
    window.fixture.setSettings("translationVolumeOffset", 15);
    window.fixture.controller.setVolumePreference("syncVolume", true);
  });
  const translationSlider = menu
    .locator(".vot-slider-wrapper")
    .filter({ hasText: "Translation volume:" })
    .getByRole("slider");
  assert.equal(await translationSlider.isDisabled(), true);
  await page.evaluate(() =>
    window.fixture.setSettings("translationVolumeOffset", 0),
  );
  assert.equal(
    await translationSlider.isDisabled(),
    false,
    "zero keeps the classic editable delta link",
  );
  const immediateActions = await page.evaluate(() => {
    const { snapshots, controller } = window.fixture;
    snapshots.length = 0;
    controller.setVolumePreference("audioBooster", false);
    controller.setVolumePreference("syncVolume", false);
    return snapshots.map((item) => item.action);
  });
  assert.deepEqual(
    immediateActions,
    ["booster", "sync", "audio", "link"],
    "runtime events apply immediately; sync reseeds before audio setup",
  );
  await page.reload();
  await page.waitForFunction(() => window.fixture);
  assert.equal(
    await page
      .getByRole("checkbox", {
        name: "✨ Mute translation with the original",
        exact: true,
      })
      .isChecked(),
    false,
    "settings rehydrate after reload",
  );
  assert.equal(
    await page.evaluate(() => window.fixture.settings.autoVolumeMode),
    "once",
  );
  if (process.env.VOT_UI_SCREENSHOT) {
    await page.setViewportSize({ width: 1100, height: 1500 });
    await page.goto(
      `http://127.0.0.1:${server.httpServer.address().port}/tests/browser-volume-settings-v2.html?lang=ru`,
    );
    await page.waitForFunction(() => window.fixture);
    await page.evaluate(() => {
      window.fixture.controller.setVolumePreference("syncVolume", true);
      window.fixture.setSettings("translationVolumeOffset", 20);
    });
    await page
      .getByRole("textbox", {
        name: "✨ Смещение громкости перевода (процентные пункты)",
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    const modeTitle = page
      .locator(".vot-select")
      .filter({ hasText: "✨ Режим снижения громкости" })
      .locator(".vot-select-outer__title");
    assert.equal(
      await modeTitle.evaluate((el) => el.scrollWidth <= el.clientWidth),
      true,
      "Russian reduction mode must not truncate",
    );
    await page.screenshot({ path: process.env.VOT_UI_SCREENSHOT });
  }
  console.log(
    "PASS volume v2 browser: full settings, persistence after reload, validation, production quick-control chain, fixed/zero link slider state",
  );
} finally {
  await browser?.close();
  await server.close();
}
