import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";
import solid from "vite-plugin-solid";

const server = await createServer({
  configFile: false,
  root: fileURLToPath(new URL("../", import.meta.url)),
  logLevel: "error",
  plugins: [
    solid({
      solid: { generate: "universal", moduleName: "vot-solid-renderer" },
    }),
  ],
  resolve: {
    alias: {
      "vot-solid-renderer": fileURLToPath(
        new URL("../src/ui/solid/renderer.ts", import.meta.url),
      ),
    },
  },
  define: {
    DEBUG_MODE: "false",
    IS_EXTENSION: "false",
    REPO_BRANCH: '"master"',
    VOT_VERSION: '"test"',
    VOT_AUTHORS: '"test"',
    AVAILABLE_LOCALES: '["en","ru"]',
  },
  server: { host: "127.0.0.1", port: 0 },
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    `http://127.0.0.1:${server.httpServer.address().port}/tests/browser-volume-runtime.html`,
  );
  await page.waitForFunction(() => window.runtimeFixture);
  const result = await page.evaluate(async () => {
    const check = (condition, label) => {
      if (!condition) throw new Error(label);
    };
    const near = (a, b) => Math.abs(a - b) < 0.0001;
    const tick = () => new Promise((r) => setTimeout(r, 40));
    const once = window.runtimeFixture("once", 10);
    check(
      near(once.video.volume, 0.15) && near(once.audio.volume, 0.25),
      "initial reduction/link actual media",
    );
    once.video.volume = 0.6;
    await tick();
    check(
      near(once.video.volume, 0.6) && near(once.audio.volume, 0.7),
      "once permits manual volume",
    );
    once.h.setupAudioSettings();
    check(near(once.video.volume, 0.6), "unrelated setup preserves once");
    once.video.muted = true;
    await tick();
    check(near(once.audio.volume, 0), "native YouTube mute");
    once.video.muted = false;
    await tick();
    check(near(once.audio.volume, 0.7), "native unmute");
    once.h.data.enabledAutoVolume = false;
    once.h.setupAudioSettings();
    check(
      near(once.video.volume, 0.8) && near(once.audio.volume, 0.9),
      "disable restores original synchronously",
    );
    once.video.volume = 0.5;
    await tick();
    await once.h.stopTranslate();
    check(
      near(once.video.volume, 0.5),
      "stop after disable does not restore stale baseline",
    );
    const hold = window.runtimeFixture("hold", -10);
    hold.video.volume = 0.8;
    await tick();
    check(
      near(hold.video.volume, 0.15) && near(hold.audio.volume, 0.05),
      "native hold uses actual ceiling",
    );
    hold.h.setVideoVolume(0.9);
    hold.h.refreshVolumeLink();
    check(
      near(hold.video.volume, 0.15) && near(hold.audio.volume, 0.05),
      "programmatic ceiling",
    );
    const old = hold.video;
    const replacement = document.createElement("video");
    replacement.volume = 0.6;
    await hold.h.replaceVideo(replacement);
    check(
      near(old.volume, 0.8) && near(replacement.volume, 0.15),
      "replace restores old video and captures new",
    );
    replacement.volume = 0.9;
    await tick();
    check(
      near(replacement.volume, 0.15),
      "replacement keeps native hold enforcement",
    );
    await hold.h.stopTranslate();
    check(near(replacement.volume, 0.6), "stop restores replacement baseline");
    const delta = window.runtimeFixture("once", 0);
    delta.h.data.enabledAutoVolume = false;
    delta.h.setupAudioSettings();
    delta.h.resetVolumeLinkState(80, 60);
    delta.video.volume = 0.7;
    await tick();
    check(near(delta.audio.volume, 0.5), "zero keeps delta gap");
    delta.video.muted = true;
    await tick();
    check(near(delta.audio.volume, 0), "delta mute");
    delta.h.clearVolumeLinkState();
    delta.h.setupAudioSettings();
    delta.h.afterUpdateTranslation("fixture");
    check(near(delta.audio.volume, 0), "source refresh remains muted");
    delta.video.muted = false;
    await tick();
    check(
      near(delta.audio.volume, 0.5),
      "delta gap after muted source refresh",
    );
    delta.video.muted = true;
    await tick();
    await delta.h.stopTranslate();
    delta.h.uiManager.votOverlayView.overlayViewControls.setTranslationVolume(
      60,
    );
    delta.h.audioPlayer.player.src = "next-session";
    delta.video.muted = true;
    await tick();
    delta.h.clearVolumeLinkState();
    delta.h.setupAudioSettings();
    delta.h.afterUpdateTranslation("next-session");
    delta.video.muted = false;
    await tick();
    check(
      near(delta.audio.volume, 0.6),
      "new session does not reuse prior gap",
    );
    await delta.h.stopTranslate();
    for (const host of ["rutube", "ok"]) {
      const native = window.runtimeFixture("hold", -10, host);
      native.video.volume = 0.8;
      await tick();
      check(near(native.video.volume, 0.15), `${host} native hold ceiling`);
      check(near(native.audio.volume, 0.05), `${host} links post-clamp volume`);
      native.video.muted = true;
      await tick();
      check(
        near(native.audio.volume, 0.05),
        `${host} keeps mute-sync exclusion`,
      );
      await native.h.stopTranslate();
      native.h.abortController.abort();
    }
    return {
      once: true,
      hold: true,
      negativeOffset: true,
      nativeMute: true,
      zeroDelta: true,
      restoration: true,
      replacement: true,
      mutedSourceRefresh: true,
      newSessionGap: true,
      nativeHoldHosts: ["rutube", "ok"],
    };
  });
  assert.deepEqual(errors, []);
  console.log("PASS real browser media runtime", JSON.stringify(result));
} finally {
  await browser?.close();
  await server.close();
}
