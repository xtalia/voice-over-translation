import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { createDefaultSettings, pickSettings } from "../src/stores/settings";
import { storageKeys } from "../src/types/storage";

test("volume v2 browser controls and controller", () => {
  const result = spawnSync("node", ["tests/volume-settings-v2.browser.mjs"], {
    cwd: `${import.meta.dir}/..`,
    encoding: "utf8",
    timeout: 90000,
  });
  if (result.status !== 0) console.error(result.stdout, result.stderr);
  expect(result.error).toBeUndefined();
  expect(result.status).toBe(0);
}, 100000);

describe("volume v2 settings storage", () => {
  test("new installations keep upstream linking and adaptive reduction defaults", () => {
    const defaults = createDefaultSettings();
    expect(defaults.autoVolumeMode).toBe("adaptive");
    expect(defaults.translationVolumeOffset).toBe(0);
    expect(defaults.muteTranslationWithOriginal).toBe(true);
    for (const key of [
      "autoVolumeMode",
      "translationVolumeOffset",
      "muteTranslationWithOriginal",
    ] as const) {
      expect(storageKeys).toContain(key);
      expect(pickSettings(defaults)[key]).toBe(defaults[key]);
    }
  });
});
