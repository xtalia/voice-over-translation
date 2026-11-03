import { clampInt, clampPercentInt } from "../utils/volume";

export type VolumeLinkState = {
  initialized: boolean;
  lastVideoPercent: number;
  lastTranslationPercent: number;
  temporarilySilenced?: boolean;
};

type VolumeLinkDirection = "translation" | "video";

type ApplyVolumeLinkDeltaInput = {
  state: VolumeLinkState;
  fromType: VolumeLinkDirection;
  newVolume: number;
  currentVideo: number;
  currentTranslation: number;
  translationMin: number;
  translationMax: number;
  /** Nonzero values select the fork's original-master percentage-point mode. */
  offsetPercent?: number;
  muteTranslationWithOriginal?: boolean;
  originalMuted?: boolean;
};

export type ApplyVolumeLinkDeltaResult = {
  nextVideo?: number;
  nextTranslation?: number;
};

export function syncVideoLinkSnapshot(
  state: VolumeLinkState,
  volumePercent: number,
): void {
  const normalized = clampPercentInt(volumePercent);
  state.lastVideoPercent = normalized;
}

export function syncTranslationLinkSnapshot(
  state: VolumeLinkState,
  volumePercent: number,
): void {
  const normalized = clampPercentInt(volumePercent);
  state.lastTranslationPercent = normalized;
}

function getSharedTranslationRange(
  translationMin: number,
  translationMax: number,
): { min: number; max: number } {
  const min = clampPercentInt(translationMin);
  const max = clampPercentInt(Math.min(100, translationMax), min, 100);

  return { min, max };
}

/**
 * Applies delta-based volume linking and mutates `state` in place.
 *
 * Rules:
 * - "video" initiator: translation changes by the same delta as video.
 * - "translation" initiator: video changes by the same delta as translation.
 *
 * This preserves relative offset between sliders (until clamped by bounds),
 * instead of forcing a 1:1 mirror.
 */
export function applyVolumeLinkDelta({
  state,
  fromType,
  newVolume,
  currentVideo,
  currentTranslation,
  translationMin,
  translationMax,
  offsetPercent,
  muteTranslationWithOriginal = false,
  originalMuted = false,
}: ApplyVolumeLinkDeltaInput): ApplyVolumeLinkDeltaResult {
  const sharedTranslationRange = getSharedTranslationRange(
    translationMin,
    translationMax,
  );

  // Silence is temporary: retain the delta snapshots for the unmute transition.
  const original = fromType === "video" ? newVolume : currentVideo;
  if (muteTranslationWithOriginal && (originalMuted || original === 0)) {
    state.temporarilySilenced = true;
    if (!state.initialized) {
      state.lastVideoPercent = clampPercentInt(currentVideo);
      state.lastTranslationPercent = clampPercentInt(currentTranslation);
      state.initialized = true;
    }
    return { nextTranslation: 0 };
  }
  state.temporarilySilenced = false;

  // [VOT-FORK:volume-offset] Zero intentionally retains upstream delta behavior.
  if (Number.isFinite(offsetPercent) && offsetPercent !== 0) {
    const video = clampPercentInt(
      fromType === "video" ? newVolume : currentVideo,
    );
    const nextTranslation = clampInt(
      video + clampInt(offsetPercent ?? 0, -10, 100),
      sharedTranslationRange.min,
      sharedTranslationRange.max,
    );
    state.initialized = true;
    state.lastVideoPercent = video;
    state.lastTranslationPercent = nextTranslation;
    return { nextTranslation };
  }

  if (!state.initialized) {
    state.lastVideoPercent = clampPercentInt(currentVideo);
    state.lastTranslationPercent = clampInt(
      Number(currentTranslation),
      sharedTranslationRange.min,
      sharedTranslationRange.max,
    );
    state.initialized = true;
  }

  if (fromType === "video") {
    const normalizedVideo = clampPercentInt(newVolume);
    const delta = normalizedVideo - clampPercentInt(state.lastVideoPercent);
    state.lastVideoPercent = normalizedVideo;
    const nextTranslation = clampInt(
      state.lastTranslationPercent + delta,
      sharedTranslationRange.min,
      sharedTranslationRange.max,
    );
    state.lastTranslationPercent = nextTranslation;
    return { nextTranslation };
  }

  const normalizedTranslation = clampInt(
    Number.isFinite(newVolume) ? newVolume : currentTranslation,
    sharedTranslationRange.min,
    sharedTranslationRange.max,
  );
  const delta = normalizedTranslation - state.lastTranslationPercent;
  state.lastTranslationPercent = normalizedTranslation;
  const nextVideo = clampPercentInt(state.lastVideoPercent + delta);
  state.lastVideoPercent = nextVideo;

  return { nextVideo };
}
