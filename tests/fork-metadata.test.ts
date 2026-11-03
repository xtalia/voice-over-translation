import { expect, test } from "bun:test";
import pkg from "../package.json";
import { contentUrl, repositoryUrl } from "../src/config/config";
import headers from "../src/headers.json";

const rawBase =
  "https://raw.githubusercontent.com/xtalia/voice-over-translation";

test("fork metadata points at xtalia's repository and master userscript", () => {
  expect(contentUrl).toBe(rawBase);
  expect(repositoryUrl).toBe(
    "https://github.com/xtalia/voice-over-translation",
  );
  expect(pkg.repository.url).toBe(
    "git+https://github.com/xtalia/voice-over-translation.git",
  );
  expect(headers.updateURL).toBe(`${rawBase}/master/dist/vot.user.js`);
  expect(headers.downloadURL).toBe(`${rawBase}/master/dist/vot.user.js`);
  expect(headers.icon).toBe(`${rawBase}/master/src/public/icons/icon-128.png`);
});

test("fork version preserves upstream author credits and discloses AI assistance", () => {
  expect(headers.version).toBe("1.12.6.1");
  for (const author of [
    "Toil",
    "SashaXser",
    "MrSoczekXD",
    "mynovelhost",
    "sodapng",
  ]) {
    expect(headers.author).toContain(author);
  }
  expect(headers.author).toContain("xtalia");
  expect(headers.author).toContain("Hermes Agent (Nous Research)");
  expect(headers.author).toContain("OpenAI");
});
