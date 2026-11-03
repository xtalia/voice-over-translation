// [VOT-FORK:volume-preferences] Read both previous fork settings and upstream defaults.
export type AutoVolumeMode = "once" | "hold" | "adaptive";
export type VolumePreferences = {
  autoVolumeMode: AutoVolumeMode;
  translationVolumeOffset: number;
  muteTranslationWithOriginal: boolean;
};
type SavedPreferences = Partial<VolumePreferences> & {
  enabledSmartDucking?: boolean;
  volumeLinkMode?: "delta" | "offset";
};
export function normalizeTranslationOffset(value: number): number {
  return Number.isFinite(value)
    ? Math.round(Math.max(-10, Math.min(100, value)) / 5) * 5
    : 0;
}
export function isFixedVolumeLink(data?: {
  syncVolume?: boolean;
  translationVolumeOffset?: number;
}): boolean {
  return Boolean(
    data?.syncVolume &&
      normalizeTranslationOffset(data.translationVolumeOffset ?? 0) !== 0,
  );
}
export function migrateVolumePreferences(
  data: SavedPreferences,
): VolumePreferences {
  const mode = data.autoVolumeMode;
  return {
    autoVolumeMode:
      mode === "once" || mode === "hold" || mode === "adaptive"
        ? mode
        : data.enabledSmartDucking === false
          ? "once"
          : "adaptive",
    translationVolumeOffset:
      data.volumeLinkMode === "delta"
        ? 0
        : normalizeTranslationOffset(data.translationVolumeOffset ?? 0),
    muteTranslationWithOriginal: data.muteTranslationWithOriginal ?? true,
  };
}
