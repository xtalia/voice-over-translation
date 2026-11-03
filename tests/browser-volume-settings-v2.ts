import "../src/components/solid.scss";
import russianLocale from "../src/localization/locales/ru.json";
import { localizationProvider } from "../src/localization/localizationProvider";
import {
  createDefaultSettings,
  setSettings,
  settings,
} from "../src/stores/settings";
import type { StorageData } from "../src/types/storage";
import { OverlayController } from "../src/ui/overlayController";
import { SettingsController } from "../src/ui/settingsController";
import type { IntervalIdleChecker } from "../src/utils/intervalIdleChecker";
import { votStorage } from "../src/utils/storage";
import { toFlatObj } from "../src/utils/utils";
import type { VideoHandler } from "../src/VideoHandler";

const russianPreview = new URL(location.href).searchParams.get("lang") === "ru";
localizationProvider.lang = russianPreview ? "ru" : "en";
localizationProvider.locale = russianPreview
  ? toFlatObj(russianLocale)
  : { ...localizationProvider.defaultLocale };
const initialSettings = await votStorage.getValues(createDefaultSettings(true));
const data: Partial<StorageData> = initialSettings;
setSettings(initialSettings);
const snapshots: Array<Partial<StorageData> & { action: string }> = [];
const handler = {
  hotkeyController: { actions: [] },
  site: { host: "youtube", needBypassCSP: false },
  isAudioContextSupported: true,
  getVideoVolume: () => 0.75,
  uiManager: { votSettingsView: undefined as SettingsController | undefined },
  setupAudioSettings() {
    snapshots.push({ ...data, action: "audio" });
  },
  refreshVolumeLink() {
    snapshots.push({ ...data, action: "link" });
  },
};
const controller = new SettingsController({
  globalPortal: document.querySelector("#fixture-root") as HTMLElement,
  data,
  videoHandler: handler as unknown as VideoHandler,
});
controller.addEventListener("change:syncVolume", () => {
  snapshots.push({ ...data, action: "sync" });
});
controller.addEventListener("change:audioBooster", () => {
  snapshots.push({ ...data, action: "booster" });
});
handler.uiManager.votSettingsView = controller;
controller.initUI().open();
const mountMenu = () => {
  controller.close();
  const mount = document.createElement("vot-block");
  mount.id = "quick-menu";
  document.body.append(mount);
  mount.style.cssText =
    "display:block;position:relative;width:900px;height:700px";
  const overlay = new OverlayController({
    mount: {
      root: mount,
      portalContainer: mount,
      subtitlesMountContainer: mount,
    },
    data,
    videoHandler: handler as unknown as VideoHandler,
    intervalIdleChecker: {
      markActivity() {},
    } as unknown as IntervalIdleChecker,
  });
  overlay.initUI();
  overlay.overlayViewControls?.setStatus("success");
  overlay.overlayViewControls?.setShowTranslationVolume(true);
  overlay.overlayViewControls?.setMenuHidden(false);
  return overlay;
};
Object.assign(window, {
  fixture: {
    data,
    snapshots,
    settings,
    setSettings,
    controller,
    votStorage,
    mountMenu,
  },
});
