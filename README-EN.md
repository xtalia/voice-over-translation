# VOT — xtalia’s personal fork

[Русский](README.md) · [Settings](FORK.md) · [Maintenance](FORK-MAINTENANCE.md)

An unofficial modification of [ilyhalight/voice-over-translation](https://github.com/ilyhalight/voice-over-translation) for convenient original/translation volume controls. I am a regular VOT user adapting it to my viewing habits, not the original project's author.

**Base:** upstream **1.12.6**, commit [`23335c9a4e489ae2befcdc6dd2052a7d6b405ecb`](https://github.com/ilyhalight/voice-over-translation/commit/23335c9a4e489ae2befcdc6dd2052a7d6b405ecb). Fork version: **1.12.6.1**; porting and verification progress is tracked in [TASKS.md](TASKS.md).

> The installation link below serves the verified **1.12.6.1** build from this fork’s `master` branch.

## What changes ✨

- **Original volume reduction:** an enable switch, `once` (apply once), `hold` (maintain a ceiling), `adaptive` (speech-aware ducking), and a level/strength slider. Disabling reduction or stopping translation restores the original baseline.
- **Volume linking:** an enable switch reveals an offset slider from **−10 to 100 percentage points, step 5**, synchronized with a numeric input. **0** preserves classic delta linking; a nonzero value sets a fixed difference from the original. For example, 15% + 10 pp → 25%, clamped to 0–100%.
- **Mute with original:** the `muteTranslationWithOriginal` checkbox is enabled by default; translation is silenced when the original is muted or at zero volume. You can turn this option off.
- Quick reduction/link/boost buttons under subtitles share the same settings; boost is unavailable while linking.
- Improved controls are marked **✨**. See [FORK.md](FORK.md) for behavior and persistence details.

## Quick start

1. Install [Tampermonkey](https://www.tampermonkey.net/). In Chromium, enable Developer mode and permission to run userscripts if required ([instructions](https://www.tampermonkey.net/faq.php#Q209)).
2. Open **[this fork’s userscript](https://raw.githubusercontent.com/xtalia/voice-over-translation/master/dist/vot.user.js)** and confirm installation. Do not run the original VOT and this fork together.
3. Open a video on a [supported site](https://github.com/ilyhalight/voice-over-translation/wiki), start translation, and adjust volume in VOT settings.

Fork installation and update links use `xtalia/master`. Original VOT store extensions are not this build. To build both userscript variants locally: `npm run build:gm` (dependencies must be installed; Node.js ≥22.12).

## Authors and rights

- **Original VOT:** ilyhalight (Toil), sodapng, SashaXser, MrSoczekXD, mynovelhost, and [other contributors](https://github.com/ilyhalight/voice-over-translation/graphs/contributors). The project originated from [sodapng/voice-over-translation](https://github.com/sodapng/voice-over-translation).
- **xtalia:** initiator and maintainer of the personal fork; claims no authorship of the original project.
- **Hermes Agent (Nous Research), using OpenAI models:** AI assistance with implementation, tests, and verification. These changes are AI-assisted, not manually written by the fork owner.

Original copyright notices and the [MIT license](LICENSE) are preserved. Third-party code, materials, and services belong to their respective owners.
