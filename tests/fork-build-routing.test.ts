import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { formatUserscriptHeader } from "../vite/lib/userscript/headers";

test("quick control styles are included in the production shadow stylesheet", () => {
  expect(
    readFileSync(
      new URL("../src/components/solid.scss", import.meta.url),
      "utf8",
    ),
  ).toContain('@use "SegmentedButton/VolumeQuickControls.scss";');
});

test("locale assets stay on published master when a local feature branch is built", async () => {
  Object.assign(globalThis, { REPO_BRANCH: "feat/volume-settings-v2" });
  const { localizationProvider } = await import(
    "../src/localization/localizationProvider"
  );
  expect(localizationProvider.localesUrl).toBe(
    "https://raw.githubusercontent.com/xtalia/voice-over-translation/master/src/localization/locales",
  );
  expect(localizationProvider.hashesUrl).toBe(
    "https://raw.githubusercontent.com/xtalia/voice-over-translation/master/src/localization/hashes.json",
  );
});

test("built fork headers use the installable master raw artifact, never Releases", () => {
  for (const filename of ["vot", "vot-min"]) {
    const header = formatUserscriptHeader({
      filename,
      repoBranch: "master",
      repoUpdateBranch: "master",
      localeEntries: [],
      grants: [],
    });
    const target = `https://raw.githubusercontent.com/xtalia/voice-over-translation/master/dist/${filename}.user.js`;
    expect(header).toMatch(
      new RegExp(`@downloadURL\\s+${target.replaceAll(".", "\\.")}`),
    );
    expect(header).toMatch(
      new RegExp(`@updateURL\\s+${target.replaceAll(".", "\\.")}`),
    );
  }
});
