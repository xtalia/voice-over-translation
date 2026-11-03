import { availableLangs } from "@vot.js/shared/consts";
import { createUniqueId, type JSX, mergeProps, Show } from "solid-js";

import {
  DETECT_SERVICES,
  TRANSLATE_TEXT_SERVICES,
} from "#modules/translateText/consts.ts";
import type {
  DetectService,
  TranslateTextService,
} from "#modules/translateText/types.ts";
import { forkT } from "../../localization/fork";
import { t } from "../../localization/localizationProvider";
import { setSettings, settings } from "../../stores/settings";
import type { LanguageSelectKey } from "../../types/components/select";
import type { StorageData } from "../../types/storage";
import { isSupportGMXhr } from "../../utils/gm";
import {
  genSelectOptionsByLangs,
  Select,
  type SelectOption,
} from "../Control/Select";
import { Slider } from "../Control/Slider";
import { SliderLabel } from "../Control/SliderLabel";
import { SliderWrapper } from "../Control/SliderWrapper";
import { Switch } from "../Control/Switch";
import { SettingsSection } from "./SettingsSection";
import { VolumeOffsetControl } from "./VolumeOffsetControl";

export type SettingsTranslationSectionProps = {
  isAudioContextSupported?: boolean;
  isCanDetectMusic?: boolean;
  onAutoTranslateChange?: (checked: boolean) => void;
  onAutoPauseOnTranslateChange?: (checked: boolean) => void;
  onAutoSubtitlesChange?: (checked: boolean) => void;
  onDontTranslateLanguagesChange?: (
    selectedLanguages: LanguageSelectKey[],
    changedLanguage: LanguageSelectKey,
  ) => void;
  onDontTranslateByYTMusicChange?: (checked: boolean) => void;
  onEnabledAutoVolumeChange?: (checked: boolean) => void;
  onAutoVolumeInput?: (volume: number) => void;
  onAutoVolumeModeSelect?: (mode: StorageData["autoVolumeMode"]) => void;
  onSmartDuckingStrengthInput?: (volume: number) => void;
  onEnabledSmartDuckingChange?: (checked: boolean) => void;
  onShowVideoSliderChange?: (checked: boolean) => void;
  onAudioBoosterChange?: (checked: boolean) => void;
  onSyncVolumeChange?: (checked: boolean) => void;
  onTranslationVolumeOffsetInput?: (volume: number) => void;
  onMuteTranslationWithOriginalChange?: (checked: boolean) => void;
  onDownloadWithNameChange?: (checked: boolean) => void;
  onSendNotifyOnCompleteChange?: (checked: boolean) => void;
  onUseAudioDownloadChange?: (checked: boolean) => void;
  onTranslationServiceSelect?: (service: TranslateTextService) => void;
  onDetectServiceSelect?: (service: DetectService) => void;
};

export function SettingsTranslationSection(
  props: SettingsTranslationSectionProps,
): JSX.Element {
  const finalProps = mergeProps(
    {
      isAudioContextSupported: false,
      isCanDetectMusic: false,
    },
    props,
  );

  const dontTranslateLanguagesOptions = genSelectOptionsByLangs(availableLangs);
  const translationTextServiceOptions =
    TRANSLATE_TEXT_SERVICES.map<SelectOption>((service) => ({
      label: t(`services.${service}`),
      value: service,
    }));

  const detectServiceOptions = DETECT_SERVICES.map<SelectOption>((service) => ({
    label: t(`services.${service}`),
    value: service,
  }));

  const muteLabelId = createUniqueId();
  const muteDescriptionId = createUniqueId();
  const autoVolumeText = () =>
    `${settings.enabledSmartDucking ? settings.smartDuckingStrength : settings.autoVolume}%`;
  const useAudioDownloadDescription = () =>
    isSupportGMXhr
      ? t("VOTUseAudioDownloadWarning")
      : `${t("VOTUseAudioDownloadWarning")}. ${t("VOTNotSupportedByLoader")}`;

  return (
    <SettingsSection isOpen={true} title={t("translationSettings")}>
      <Switch
        heading={t("VOTAutoTranslate")}
        checked={settings.autoTranslate}
        onChange={(checked) => {
          setSettings("autoTranslate", checked);
          finalProps.onAutoTranslateChange?.(checked);
        }}
      />
      <Switch
        heading={t("VOTAutoPauseOnTranslate")}
        checked={settings.autoPauseOnTranslate}
        onChange={(checked) => {
          setSettings("autoPauseOnTranslate", checked);
          finalProps.onAutoPauseOnTranslateChange?.(checked);
        }}
      />
      <Switch
        heading={t("VOTAutoSubtitles")}
        checked={settings.autoSubtitles}
        onChange={(checked) => {
          setSettings("autoSubtitles", checked);
          finalProps.onAutoSubtitlesChange?.(checked);
        }}
      />
      <Select
        multiple={true}
        search={true}
        title={t("None")}
        options={dontTranslateLanguagesOptions}
        selectedValues={settings.dontTranslateLanguages}
        minSelected={0}
        onSelectionChange={(values, changedOption) => {
          setSettings("dontTranslateLanguages", values as LanguageSelectKey[]);
          finalProps.onDontTranslateLanguagesChange?.(
            values as LanguageSelectKey[],
            changedOption.value as LanguageSelectKey,
          );
        }}
      >
        {t("DontTranslateSelectedLanguages")}
      </Select>
      <Switch
        heading={t("DontTranslateByYTMusic")}
        description={t("VOTMusicDetectDesc")}
        checked={settings.dontTranslateByYTMusic}
        hidden={!finalProps.isCanDetectMusic}
        onChange={(checked) => {
          setSettings("dontTranslateByYTMusic", checked);
          finalProps.onDontTranslateByYTMusicChange?.(checked);
        }}
      />
      <Switch
        heading={`✨ ${t("VOTAutoReduceVolume")}`}
        checked={settings.enabledAutoVolume}
        onChange={(checked) => {
          setSettings("enabledAutoVolume", checked);
          finalProps.onEnabledAutoVolumeChange?.(checked);
        }}
      />
      <Show when={settings.enabledAutoVolume}>
        <vot-block class="vot-volume-mode">
          <Select
            title={forkT("autoVolumeMode")}
            search={false}
            options={[
              { value: "once", label: forkT("autoVolumeOnce") },
              { value: "hold", label: forkT("autoVolumeHold") },
              {
                value: "adaptive",
                label: forkT("autoVolumeAdaptive"),
                disabled: settings.syncVolume,
              },
            ]}
            selectedValue={settings.autoVolumeMode}
            onSelect={(option) => {
              const mode = option.value as StorageData["autoVolumeMode"];
              setSettings("autoVolumeMode", mode);
              setSettings("enabledSmartDucking", mode === "adaptive");
              finalProps.onAutoVolumeModeSelect?.(mode);
            }}
          >
            {forkT("autoVolumeMode")}
            <vot-block class="vot-select-label__description">
              {forkT("autoVolumeModeDescription")}
            </vot-block>
          </Select>
        </vot-block>
      </Show>
      <SliderWrapper>
        <SliderLabel
          value={autoVolumeText()}
          disabled={!settings.enabledAutoVolume}
        >
          {settings.enabledSmartDucking
            ? t("VOTSmartDuckingStrength")
            : t("VOTReducedVolumeLevel")}
        </SliderLabel>
        <Slider
          value={
            settings.enabledSmartDucking
              ? settings.smartDuckingStrength
              : settings.autoVolume
          }
          disabled={!settings.enabledAutoVolume}
          onInput={(val) => {
            if (settings.enabledSmartDucking) {
              setSettings("smartDuckingStrength", val);
              finalProps.onSmartDuckingStrengthInput?.(val);
              return;
            }

            setSettings("autoVolume", val);
            finalProps.onAutoVolumeInput?.(val);
          }}
        />
      </SliderWrapper>

      <Switch
        heading={t("showVideoVolumeSlider")}
        checked={settings.showVideoSlider}
        onChange={(checked) => {
          setSettings("showVideoSlider", checked);
          finalProps.onShowVideoSliderChange?.(checked);
        }}
      />
      <Switch
        heading={t("VOTAudioBooster")}
        description={
          finalProps.isAudioContextSupported
            ? undefined
            : t("VOTNeedWebAudioAPI")
        }
        checked={settings.audioBooster}
        disabled={settings.syncVolume || !finalProps.isAudioContextSupported}
        onChange={(checked) => {
          setSettings("audioBooster", checked);
          finalProps.onAudioBoosterChange?.(checked);
        }}
      />
      <Switch
        heading={`✨ ${t("VOTSyncVolume")}`}
        description={t("VOTIncompatibleWith").replace("{0}", t("smartDucking"))}
        checked={settings.syncVolume}
        onChange={(checked) => {
          setSettings("syncVolume", checked);
          if (checked && settings.autoVolumeMode === "adaptive") {
            setSettings("autoVolumeMode", "hold");
            setSettings("enabledSmartDucking", false);
          }

          finalProps.onSyncVolumeChange?.(checked);
        }}
      />
      <VolumeOffsetControl
        value={settings.translationVolumeOffset}
        disabled={!settings.syncVolume}
        onInput={(value) => {
          setSettings("translationVolumeOffset", value);
          finalProps.onTranslationVolumeOffsetInput?.(value);
        }}
      />
      <label class="vot-switch">
        <input
          type="checkbox"
          checked={settings.muteTranslationWithOriginal}
          aria-labelledby={muteLabelId}
          aria-describedby={muteDescriptionId}
          onChange={(event) => {
            const checked = event.currentTarget.checked;
            setSettings("muteTranslationWithOriginal", checked);
            finalProps.onMuteTranslationWithOriginalChange?.(checked);
          }}
        />
        <vot-block class="vot-switch-text">
          <vot-block class="vot-switch-heading" id={muteLabelId}>
            {forkT("muteTranslationWithOriginal")}
          </vot-block>
          <vot-block class="vot-switch-description" id={muteDescriptionId}>
            {forkT("muteTranslationWithOriginalDescription")}
          </vot-block>
        </vot-block>
      </label>
      <Switch
        heading={t("VOTDownloadWithName")}
        description={isSupportGMXhr ? undefined : t("VOTNotSupportedByLoader")}
        disabled={!isSupportGMXhr}
        checked={settings.downloadWithName}
        onChange={(checked) => {
          setSettings("downloadWithName", checked);
          finalProps.onDownloadWithNameChange?.(checked);
        }}
      />
      <Switch
        heading={t("VOTSendNotifyOnComplete")}
        checked={settings.sendNotifyOnComplete}
        onChange={(checked) => {
          setSettings("sendNotifyOnComplete", checked);
          finalProps.onSendNotifyOnCompleteChange?.(checked);
        }}
      />
      <Switch
        heading={t("VOTUseAudioDownload")}
        description={useAudioDownloadDescription()}
        disabled={!isSupportGMXhr}
        checked={settings.useAudioDownload}
        onChange={(checked) => {
          setSettings("useAudioDownload", checked);
          finalProps.onUseAudioDownloadChange?.(checked);
        }}
      />
      <Select
        title={t("VOTTranslationTextService")}
        options={translationTextServiceOptions}
        selectedValue={settings.translationService}
        onSelect={(option) => {
          const value = option.value as TranslateTextService;
          setSettings("translationService", value);
          finalProps.onTranslationServiceSelect?.(value);
        }}
      >
        {t("VOTTranslationTextService")}
        <br />
        <vot-block class="vot-select-label__description">
          {t("VOTNotAffectToVoice")}
        </vot-block>
      </Select>
      <Select
        title={t("VOTDetectService")}
        options={detectServiceOptions}
        selectedValue={settings.detectService}
        onSelect={(option) => {
          const value = option.value as DetectService;
          setSettings("detectService", value);
          finalProps.onDetectServiceSelect?.(value);
        }}
      >
        {t("VOTDetectService")}
      </Select>
    </SettingsSection>
  );
}
