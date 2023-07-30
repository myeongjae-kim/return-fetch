import { describe, it, expect } from "vitest";

describe("URL class learning tests", () => {
  describe("base URL", () => {
    it("does not overwrite url when origin is specified", () => {
      const url = new URL("https://google.com/hello", "https://www.naver.com");

      expect(url.toString()).toBe("https://google.com/hello");
    });

    it("should overwrite url when origin is not specified", () => {
      const url = new URL("/hello", "https://www.naver.com");

      expect(url.toString()).toBe("https://www.naver.com/hello");
    });

    it("does not applied for path, only for origin", () => {
      const url = new URL("/world", "https://www.naver.com/hello");

      expect(url.toString()).not.toBe("https://www.naver.com/hello/world");
      expect(url.toString()).toBe("https://www.naver.com/world");
    });
  });
});
