import { describe, it, expect } from "vitest";

describe("Request class learning tests", () => {
  describe("constructor", () => {
    it("should add trailing slash to url and Headers instance should be valid", async () => {
      const headersInit: HeadersInit = {
        "Content-Type": "application/json",
      };

      const url = "https://google.com";
      const request = new Request(url, { headers: headersInit });

      expect(request.url).toBe(url + "/");
      expect(request.headers).toEqual(new Headers(headersInit));
    });
  });

  describe("Headers", () => {
    it("should be overwritten by init parameter", () => {
      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
        "X-Custom-Header": "custom header",
        "X-Only-In-Default-Header": "only",
      };
      const requestWithDefaultHeader = new Request("https://google.com", {
        cache: "force-cache",
        headers: defaultHeaders,
      });

      const headersToOverwrite: HeadersInit = {
        "Content-Type": "application/xml",
        "X-Custom-Header": "custom header overwritten",
      };

      const headers = new Headers(requestWithDefaultHeader.headers);
      new Headers(headersToOverwrite).forEach((value, key) => {
        headers.set(key, value);
      });

      const request2 = new Request(requestWithDefaultHeader, {
        ...requestWithDefaultHeader,
        headers,
      });

      expect(request2.headers.get("Content-Type")).toBe("application/xml");
      expect(request2.headers.get("X-Custom-Header")).toBe(
        "custom header overwritten",
      );
      expect(request2.cache).toBe("force-cache");
      expect(request2.headers.get("X-Only-In-Default-Header")).toBe("only");
    });
  });
});
