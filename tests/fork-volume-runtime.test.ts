import { expect, test } from "bun:test";
import {
  refreshVolumeLink,
  syncLinkedVolume,
} from "../src/videoHandler/volumeLinkRuntime";

function fixture(offset = 10) {
  let video = 20,
    translation = 60;
  const player = { src: "fixture", volume: 0.6 };
  const h: any = {
    data: {
      syncVolume: true,
      translationVolumeOffset: offset,
      muteTranslationWithOriginal: true,
    },
    volumeLinkState: {
      initialized: true,
      lastVideoPercent: 20,
      lastTranslationPercent: 60,
    },
    getVideoVolume: () => video / 100,
    isMuted: () => false,
    setVideoVolume: (v: number) => {
      video = v * 100;
    },
    syncVideoVolumeSlider: () => {},
    audioPlayer: { player },
    uiManager: {
      votOverlayView: {
        overlayViewControls: {
          getVideoVolume: () => video,
          getTranslationVolume: () => translation,
          getMaxTranslationVolume: () => 100,
          setTranslationVolume: (v: number) => {
            translation = v;
          },
          setVideoVolume: (v: number) => {
            video = v;
          },
        },
      },
    },
  };
  return { h, player, translation: () => translation };
}
test("unchecked mute preference follows the retained original level on mute", () => {
  const f = fixture();
  f.h.isMuted = () => true;
  f.h.data.muteTranslationWithOriginal = false;
  syncLinkedVolume(f.h, "video", 0);
  expect(f.translation()).toBe(30);
  expect(f.player.volume).toBeCloseTo(0.3);
});
test("inactive preview works without an audio player", () => {
  const f = fixture();
  delete f.h.audioPlayer;
  refreshVolumeLink(f.h);
  expect(f.translation()).toBe(30);
});
test("link changes actual audio as well as overlay", () => {
  const f = fixture();
  syncLinkedVolume(f.h, "video", 20);
  expect(f.translation()).toBe(30);
  expect(f.player.volume).toBeCloseTo(0.3);
});
