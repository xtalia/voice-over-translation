import { expect, test } from "bun:test";
import { contentUrl, repositoryUrl } from "../src/config/config";
import headers from "../src/headers.json";

test("fork update and localization URLs stay on xtalia's fork", () => {
  expect(contentUrl).toBe(
    "https://raw.githubusercontent.com/xtalia/voice-over-translation",
  );
  expect(repositoryUrl).toBe(
    "https://github.com/xtalia/voice-over-translation",
  );
  expect(headers.version).toBe("1.11.17.1");
});
