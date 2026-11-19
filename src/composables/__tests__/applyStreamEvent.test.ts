import { describe, expect, it } from "vitest";
import { applyStreamEvent } from "../useStreamEvents";
import type { ChatMessage } from "../../types";

function message(partial: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "m1",
    role: "assistant",
    status: "pending",
    blocks: [],
    createdAt: 0,
    ...partial,
  };
}

describe("applyStreamEvent", () => {
  it("ignores events for an unknown message id", () => {
    const messages = [message()];
    applyStreamEvent(messages, { type: "delta", messageId: "missing", text: "hi" });
    expect(messages[0].blocks).toEqual([]);
    expect(messages[0].status).toBe("pending");
  });

  it("appends a markdown delta and marks the message as streaming", () => {
    const messages = [message()];
    applyStreamEvent(messages, { type: "delta", messageId: "m1", text: "Hello" });
    applyStreamEvent(messages, { type: "delta", messageId: "m1", text: " world" });
    expect(messages[0].status).toBe("streaming");
    expect(messages[0].blocks).toEqual([{ type: "markdown", content: "Hello world" }]);
  });

  it("records an error and lets a later done event keep the failed status", () => {
    const messages = [message({ status: "streaming" })];
    applyStreamEvent(messages, { type: "error", messageId: "m1", message: "boom" });
    applyStreamEvent(messages, { type: "done", messageId: "m1" });
    expect(messages[0].status).toBe("failed");
    expect(messages[0].error).toBe("boom");
  });

  it("upserts execution steps in place", () => {
    const messages = [message()];
    applyStreamEvent(messages, {
      type: "step",
      messageId: "m1",
      step: { id: "s1", name: "one", status: "running" },
    });
    applyStreamEvent(messages, {
      type: "step",
      messageId: "m1",
      step: { id: "s1", name: "one", status: "completed" },
    });
    const steps = messages[0].blocks.find((b) => b.type === "steps");
    expect(steps).toMatchObject({ type: "steps", steps: [{ id: "s1", name: "one", status: "completed" }] });
  });
});
