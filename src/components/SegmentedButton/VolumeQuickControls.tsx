import type { JSX } from "solid-js";
import { forkT } from "../../localization/fork";
import { t } from "../../localization/localizationProvider";
import { settings, type VolumeQuickPreferenceKey } from "../../stores/settings";
import { RawButton } from "../Button/RawButton";

export type VolumeQuickControlsProps = {
  isAudioContextSupported?: boolean;
  onVolumePreferenceChange?: (
    key: VolumeQuickPreferenceKey,
    checked: boolean,
  ) => void;
};

export function VolumeQuickControls(
  props: VolumeQuickControlsProps,
): JSX.Element {
  return (
    <vot-block class="vot-volume-quick">
      <RawButton
        class="vot-volume-quick__button"
        disabled={!props.onVolumePreferenceChange}
        buttonProps={{
          "aria-label": `✨ ${t("VOTAutoReduceVolume")}`,
          "aria-pressed": settings.enabledAutoVolume,
        }}
        onClick={() =>
          props.onVolumePreferenceChange?.(
            "enabledAutoVolume",
            !settings.enabledAutoVolume,
          )
        }
      >
        {forkT("quickAutoVolume")}
      </RawButton>
      <RawButton
        class="vot-volume-quick__button"
        disabled={!props.onVolumePreferenceChange}
        buttonProps={{
          "aria-label": `✨ ${t("VOTSyncVolume")}`,
          "aria-pressed": settings.syncVolume,
        }}
        onClick={() =>
          props.onVolumePreferenceChange?.("syncVolume", !settings.syncVolume)
        }
      >
        {forkT("quickSyncVolume")}
      </RawButton>
      <RawButton
        class="vot-volume-quick__button"
        disabled={
          !props.onVolumePreferenceChange ||
          !props.isAudioContextSupported ||
          settings.syncVolume
        }
        buttonProps={{
          "aria-label": `✨ ${t("VOTAudioBooster")}`,
          "aria-pressed": settings.audioBooster,
        }}
        onClick={() =>
          props.onVolumePreferenceChange?.(
            "audioBooster",
            !settings.audioBooster,
          )
        }
      >
        {forkT("quickAudioBooster")}
      </RawButton>
    </vot-block>
  );
}
