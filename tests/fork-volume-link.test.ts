import { describe, expect, test } from "bun:test";
import {
  applyVolumeLinkDelta,
  type VolumeLinkState,
} from "../src/videoHandler/volumeLink";

const state = (): VolumeLinkState => ({
  initialized: true,
  lastVideoPercent: 20,
  lastTranslationPercent: 60,
});
function apply(
  s: VolumeLinkState,
  video: number,
  offset: number,
  mute = true,
  muted = false,
) {
  return applyVolumeLinkDelta({
    state: s,
    fromType: "video",
    newVolume: video,
    currentVideo: s.lastVideoPercent,
    currentTranslation: s.lastTranslationPercent,
    translationMin: 0,
    translationMax: 100,
    offsetPercent: offset,
    muteTranslationWithOriginal: mute,
    originalMuted: muted,
  });
}

describe("fork signed linking", () => {
  test("zero preserves the upstream gap, not equal volumes", () => {
    expect(apply(state(), 30, 0).nextTranslation).toBe(70);
  });
  test("mute temporarily silences delta linking without destroying its gap", () => {
    const s = state();
    expect(apply(s, 0, 0).nextTranslation).toBe(0);
    expect(apply(s, 20, 0).nextTranslation).toBe(60);
  });
  test("optional silence works in fixed mode and can be disabled", () => {
    expect(apply(state(), 0, 10).nextTranslation).toBe(0);
    expect(apply(state(), 0, 10, false).nextTranslation).toBe(10);
    expect(apply(state(), 20, 10, true, true).nextTranslation).toBe(0);
    expect(apply(state(), 20, 10, false, true).nextTranslation).toBe(30);
  });
  test("fixed mode unsaturates from actual video level", () => {
    const s = state();
    expect(apply(s, 90, 50).nextTranslation).toBe(100);
    expect(apply(s, 10, 50).nextTranslation).toBe(60);
  });
  test("negative offset subtracts percentage points and clamps at zero", () => {
    expect(apply(state(), 20, -10).nextTranslation).toBe(10);
    expect(apply(state(), 5, -10).nextTranslation).toBe(0);
  });
});
