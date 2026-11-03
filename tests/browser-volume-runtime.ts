import { VideoHandler } from "../src/VideoHandler";
import { applyAutoVolumeLimit } from "../src/videoHandler/autoVolumeLimit";
import {
  initExtraEvents,
  syncAudioTranslationVolumeFromVideo,
} from "../src/videoHandler/modules/events";

const audio = document.querySelector("audio");
if (!audio) throw new Error("Missing translation audio fixture");
function fixture(
  mode: "once" | "hold" = "once",
  offset = 10,
  host: "youtube" | "rutube" | "ok" = "youtube",
) {
  const video = document.createElement("video");
  video.volume = 0.8;
  document.body.append(video);
  let videoSlider = 80,
    translationSlider = 60;
  const h = Object.create(VideoHandler.prototype) as VideoHandler;
  Object.assign(h, {
    video,
    data: {
      enabledAutoVolume: true,
      autoVolumeMode: mode,
      autoVolume: 15,
      enabledSmartDucking: false,
      syncVolume: true,
      translationVolumeOffset: offset,
      muteTranslationWithOriginal: true,
      defaultVolume: 60,
    },
    volumeLinkState: {
      initialized: false,
      lastVideoPercent: 80,
      lastTranslationPercent: 60,
    },
    internalVideoVolumeSetHistory: [],
    internalVideoVolumeSetHistoryLimit: 20,
    internalVideoVolumeSuppressionMs: 200,
    stopTranslatePromise: null,
    site: { host },
    container: video,
    hotkeyController: {
      keydownHandler() {},
      keyupHandler() {},
      blurHandler() {},
      visibilitychangeHandler() {},
    },
    abortController: new AbortController(),
    getVideoVolume: () => h.video.volume,
    isMuted: () => h.video.muted,
    hasActiveSource: () => Boolean(h.audioPlayer.player.src),
    syncVideoVolumeSlider: () => {
      videoSlider = h.video.muted ? 0 : Math.round(h.video.volume * 100);
      h.onVideoVolumeSliderSynced(videoSlider);
    },
    setVideoMuted: (muted: boolean) => {
      h.video.muted = muted;
    },
    videoManager: {
      setVideoVolume: (v: number) => {
        h.video.volume = v;
      },
    },
    audioPlayer: {
      player: {
        src: "fixture",
        get volume() {
          return audio.volume;
        },
        set volume(v: number) {
          audio.volume = v;
        },
        removeVideoEvents() {},
        async clear() {},
      },
      async replaceVideo() {},
    },
    uiManager: {
      votOverlayView: {
        overlayViewControls: {
          getVideoVolume: () => videoSlider,
          setVideoVolume: (v: number) => {
            videoSlider = v;
          },
          getTranslationVolume: () => translationSlider,
          setTranslationVolume: (v: number) => {
            translationSlider = v;
          },
          getMaxTranslationVolume: () => 100,
          setShowDownloadTranslation() {},
          getStatus: () => "success",
          setShowTranslationVolume() {},
        },
      },
    },
    resetSubtitlesWidget() {},
    initExtraEvents() {
      if (host !== "youtube") {
        initExtraEvents.call(h);
        return;
      }
      h.video.addEventListener(
        "volumechange",
        () => {
          h.syncVideoVolumeSlider();
          syncAudioTranslationVolumeFromVideo(h, videoSlider);
        },
        { signal: h.abortController.signal },
      );
    },
    refreshOverlayMount() {},
    getEventContainer: () => null,
    rebindOverlayVisibilityTargets() {},
    releaseExtraEvents() {},
    transformBtn() {},
    resetActionsAbortController() {},
  });
  h.initExtraEvents();
  h.setupAudioSettings();
  return {
    h,
    video,
    audio,
    getTranslation: () => translationSlider,
    applyAutoVolumeLimit,
  };
}
Object.assign(window, { runtimeFixture: fixture });
