import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const upstreamSha = "23335c9a4e489ae2befcdc6dd2052a7d6b405ecb";

test("both concise READMEs identify the base, credits and fork install target", () => {
  for (const path of ["README.md", "README-EN.md"]) {
    const text = read(path);
    expect(text).toContain(
      "https://github.com/ilyhalight/voice-over-translation",
    );
    expect(text).toContain(upstreamSha);
    expect(text).toContain("1.12.6.1");
    expect(text).toContain(
      "https://raw.githubusercontent.com/xtalia/voice-over-translation/master/dist/vot.user.js",
    );
    expect(text).toContain("Tampermonkey");
    for (const credit of [
      "Toil",
      "SashaXser",
      "MrSoczekXD",
      "mynovelhost",
      "sodapng",
      "xtalia",
      "Hermes Agent (Nous Research)",
      "OpenAI",
    ]) {
      expect(text).toContain(credit);
    }
    expect(text).toContain("✨");
    expect(text).not.toContain("Установить / обновить userscript 1.11.17.2");
  }
});

test("published READMEs no longer claim that the production build is local-only", () => {
  expect(read("README.md")).not.toContain("ещё не опубликована в `master`");
  expect(read("README-EN.md")).not.toContain("not yet published to `master`");
  expect(read("README.md")).toContain("Версия форка");
  expect(read("README-EN.md")).toContain("Fork version");
});

test("maintenance docs name the current source patch and exact upstream base", () => {
  const text = read("FORK-MAINTENANCE.md");
  expect(text).toContain(upstreamSha);
  expect(text).toContain("patches/volume-settings-v2.patch");
  expect(text).toContain("git apply --check");
  expect(text).toContain("160dd21");
});
