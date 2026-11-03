import { describe, expect, test } from "bun:test";
import {
  migrateVolumePreferences,
  normalizeTranslationOffset,
} from "../src/videoHandler/volumePreferences";

describe("fork preferences migration", () => {
  test("text input and native step-five range always share a reachable value", () => {
    expect(normalizeTranslationOffset(12.7)).toBe(15);
    expect(normalizeTranslationOffset(13)).toBe(15);
    expect(normalizeTranslationOffset(-9)).toBe(-10);
    expect(normalizeTranslationOffset(999)).toBe(100);
    expect(normalizeTranslationOffset(Number.NaN)).toBe(0);
  });
  test("migrates old delta and offset modes without enabling an unused preset", () => {
    expect(
      migrateVolumePreferences({
        volumeLinkMode: "delta",
        translationVolumeOffset: 10,
      }).translationVolumeOffset,
    ).toBe(0);
    expect(
      migrateVolumePreferences({
        volumeLinkMode: "offset",
        translationVolumeOffset: 20,
      }).translationVolumeOffset,
    ).toBe(20);
    expect(
      migrateVolumePreferences({ enabledSmartDucking: false }).autoVolumeMode,
    ).toBe("once");
    expect(
      migrateVolumePreferences({ enabledSmartDucking: true }).autoVolumeMode,
    ).toBe("adaptive");
    expect(
      migrateVolumePreferences({
        autoVolumeMode: "hold",
        enabledSmartDucking: true,
      }).autoVolumeMode,
    ).toBe("hold");
    expect(migrateVolumePreferences({}).muteTranslationWithOriginal).toBe(true);
  });
});
