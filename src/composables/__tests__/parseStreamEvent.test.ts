import { describe, expect, it } from "vitest";
import { parseStreamEvent } from "../useStreamEvents";

describe("parseStreamEvent", () => {
  it("parses a valid delta and ignores blank, done, and malformed payloads", () => {
    expect(parseStreamEvent('{"type":"delta","messageId":"m1","text":"Hi"}')).toEqual({
      type: "delta",
      messageId: "m1",
      text: "Hi",
    });
    expect(parseStreamEvent("")).toBeNull();
    expect(parseStreamEvent("[DONE]")).toBeNull();
    expect(parseStreamEvent("{not json")).toBeNull();
    expect(parseStreamEvent('{"type":"delta"}')).toBeNull();
    expect(parseStreamEvent('{"messageId":"m1"}')).toBeNull();
  });
});
