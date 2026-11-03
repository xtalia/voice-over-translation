import type { VideoHandler } from "../VideoHandler";
import { applyTranslationPlaybackVolume } from "./translationVolume";
import {
  type ApplyVolumeLinkDeltaResult,
  applyVolumeLinkDelta,
} from "./volumeLink";
import { normalizeTranslationOffset } from "./volumePreferences";

// [VOT-FORK:volume-offset] Keep audio playback and the reactive overlay in sync.
export function syncLinkedVolume(
  handler: VideoHandler,
  fromType: "translation" | "video",
  newVolume: number,
): ApplyVolumeLinkDeltaResult | undefined {
  const controls = handler.uiManager.votOverlayView?.overlayViewControls;
  if (!controls || !handler.data?.syncVolume) return;
  const result = applyVolumeLinkDelta({
    state: handler.volumeLinkState,
    fromType,
    newVolume:
      fromType === "video" && handler.isMuted()
        ? Math.round(handler.getVideoVolume() * 100)
        : newVolume,
    currentVideo: Math.round(handler.getVideoVolume() * 100),
    currentTranslation: controls.getTranslationVolume(),
    translationMin: 0,
    translationMax: controls.getMaxTranslationVolume(),
    offsetPercent: normalizeTranslationOffset(
      handler.data.translationVolumeOffset ?? 0,
    ),
    muteTranslationWithOriginal:
      handler.data.muteTranslationWithOriginal ?? true,
    originalMuted: handler.isMuted(),
  });
  if (typeof result.nextTranslation === "number") {
    controls.setTranslationVolume(result.nextTranslation);
    applyTranslationPlaybackVolume(
      handler.audioPlayer?.player,
      result.nextTranslation,
      undefined,
    );
  }
  if (typeof result.nextVideo === "number") {
    handler.setVideoVolume(result.nextVideo / 100);
    handler.syncVideoVolumeSlider();
  }
  return result;
}

export function refreshVolumeLink(handler: VideoHandler): void {
  if (!handler.uiManager.votOverlayView?.overlayViewControls) return;
  handler.syncVideoVolumeSlider();
  if (handler.data?.syncVolume) {
    syncLinkedVolume(
      handler,
      "video",
      Math.round(handler.getVideoVolume() * 100),
    );
  }
}
