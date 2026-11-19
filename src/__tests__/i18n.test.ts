import { describe, expect, it } from "vitest";
import { enUS, getLocale, zhCN } from "../i18n";

describe("getLocale", () => {
  it("returns Chinese by default and English when requested", () => {
    expect(getLocale()).toBe(zhCN);
    expect(getLocale("zh-CN")).toBe(zhCN);
    expect(getLocale("en-US")).toBe(enUS);
    expect(getLocale("fr-FR")).toBe(zhCN);
  });

  it("keeps zh-CN and en-US keys in lockstep", () => {
    const zhKeys = Object.keys(zhCN).sort();
    const enKeys = Object.keys(enUS).sort();
    expect(enKeys).toEqual(zhKeys);
    for (const key of zhKeys) {
      expect(String(zhCN[key as keyof typeof zhCN]).length).toBeGreaterThan(0);
      expect(String(enUS[key as keyof typeof enUS]).length).toBeGreaterThan(0);
    }
  });
});
