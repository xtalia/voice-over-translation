import { localizationProvider } from "./localizationProvider";

// [VOT-FORK:volume-settings] Keep fork phrases separate from generated upstream locales.
const en = {
  quickAutoVolume: "✨ Reduce",
  quickSyncVolume: "✨ Link",
  quickAudioBooster: "✨ Boost",
  autoVolumeMode: "✨ Reduction mode",
  autoVolumeOnce: "✨ Once",
  autoVolumeHold: "✨ Hold limit",
  autoVolumeAdaptive: "✨ Adaptive",
  autoVolumeModeDescription:
    "Once lowers the original at translation start; Hold keeps the selected level; Adaptive lowers it only during translated speech.",
  translationVolumeOffset: "✨ Translation volume offset (percentage points)",
  translationVolumeOffsetDescription:
    "0 keeps the current relative gap (classic linking). Any other value sets a fixed offset. Numeric entries round to the nearest 5 points.",
  muteTranslationWithOriginal: "✨ Mute translation with the original",
  muteTranslationWithOriginalDescription:
    "Silence translation when the original is muted or its volume is zero.",
} as const;

export type ForkPhrase = keyof typeof en;
const ru: Record<ForkPhrase, string> = {
  quickAutoVolume: "✨ Снижение",
  quickSyncVolume: "✨ Связка",
  quickAudioBooster: "✨ Усиление",
  autoVolumeMode: "✨ Режим снижения громкости",
  autoVolumeOnce: "✨ Однократно",
  autoVolumeHold: "✨ Удерживать лимит",
  autoVolumeAdaptive: "✨ Адаптивно",
  autoVolumeModeDescription:
    "Однократно — снизить оригинал при запуске перевода; удерживать — сохранять выбранный уровень; адаптивно — снижать только во время речи перевода.",
  translationVolumeOffset: "✨ Смещение громкости перевода (процентные пункты)",
  translationVolumeOffsetDescription:
    "0 сохраняет текущую разницу громкостей (обычная связка). Другое значение задаёт постоянное смещение. Число округляется до ближайших 5 п.п.",
  muteTranslationWithOriginal: "✨ Выключать перевод вместе с оригиналом",
  muteTranslationWithOriginalDescription:
    "Отключать звук перевода, когда оригинал заглушён или его громкость равна нулю.",
};

export function forkT(key: ForkPhrase): string {
  return localizationProvider.lang.split("-")[0] === "ru" ? ru[key] : en[key];
}
