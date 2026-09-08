import { describe, expect, expectTypeOf, it, vi } from "vitest";
import returnFetch, { FetchArgs } from "../src";

describe("Request compatibility", () => {
  it("keeps legacy URL and initialized options in both interceptors", async () => {
    const calls: string[] = [];
    const transport = vi.fn(async () => new Response("ok"));
    const extended = returnFetch({
      fetch: transport,
      headers: { "X-Default": "default" },
      interceptors: {
        request: async (args) => {
          expectTypeOf(args[0]).toEqualTypeOf<string | URL>();
          expect(new URL(args[0]).href).toBe("https://example.com/");
          expect(args[0].toString()).toBe("https://example.com/");
          expect(args[1]?.method).toBe("POST");
          expect(new Headers(args[1]?.headers).get("X-Default")).toBe(
            "default",
          );
          expect(args[1]?.body).toBeInstanceOf(ArrayBuffer);
          calls.push("request");
          return args;
        },
        response: async (response, args) => {
          expect(args[0]).toBe("https://example.com/");
          expect(args[1]?.method).toBe("POST");
          calls.push("response");
          return response;
        },
      },
    });
    await extended(
      new Request("https://example.com", { method: "POST", body: "hello" }),
    );
    expect(calls).toEqual(["request", "response"]);
  });

  it("retries a POST using the same normalized arguments after consuming the body", async () => {
    const bodies: string[] = [];
    const transport = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        bodies.push(await new Request(input, init).text());
        return new Response("", { status: bodies.length === 1 ? 503 : 200 });
      },
    );
    const response = await returnFetch({
      fetch: transport,
      interceptors: {
        response: async (response, args, fetch) =>
          response.status === 503 ? fetch(...args) : response,
      },
    })(
      new Request("https://example.com", {
        method: "POST",
        body: "retry payload",
      }),
    );
    expect(response.status).toBe(200);
    expect(bodies).toEqual(["retry payload", "retry payload"]);
  });

  it.each<{ init?: RequestInit; accept: string; requestHeader: string | null }>(
    [
      { init: undefined, accept: "application/xml", requestHeader: "request" },
      { init: {}, accept: "application/xml", requestHeader: "request" },
      {
        init: { headers: {} },
        accept: "application/json",
        requestHeader: null,
      },
      {
        init: { headers: { Accept: "text/plain" } },
        accept: "text/plain",
        requestHeader: null,
      },
    ],
  )(
    "keeps Request header precedence for %j",
    async ({ init, accept, requestHeader }) => {
      const transport = vi.fn(
        async (_input: RequestInfo | URL, _init?: RequestInit) =>
          new Response(),
      );
      await returnFetch({
        fetch: transport,
        baseUrl: "https://other.example",
        headers: { Accept: "application/json", "X-Default": "default" },
      })(
        new Request("https://example.com", {
          headers: { Accept: "application/xml", "X-Request": "request" },
        }),
        init,
      );
      const [input, options] = transport.mock.calls[0];
      expect(input.toString()).toBe("https://example.com/");
      const headers = new Headers(options?.headers);
      expect(headers.get("Accept")).toBe(accept);
      expect(headers.get("X-Default")).toBe("default");
      expect(headers.get("X-Request")).toBe(requestHeader);
    },
  );

  it("allows interceptors to override a normalized Request before composition", async () => {
    const calls: string[] = [];
    const transport = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const effective = new Request(input, init);
        expect(effective.method).toBe("PUT");
        expect(await effective.text()).toBe("replacement");
        return new Response();
      },
    );
    const layer = (name: string, inner: typeof fetch) =>
      returnFetch({
        fetch: inner,
        interceptors: {
          request: async (args: FetchArgs) => {
            expect(typeof args[0]).toBe("string");
            calls.push(name + ":request");
            return [
              args[0],
              { ...args[1], method: "PUT", body: "replacement" },
            ];
          },
          response: async (response) => {
            calls.push(name + ":response");
            return response;
          },
        },
      });
    await layer(
      "outer",
      layer("inner", transport),
    )(new Request("https://example.com", { method: "POST", body: "original" }));
    expect(calls).toEqual([
      "outer:request",
      "inner:request",
      "inner:response",
      "outer:response",
    ]);
  });

  it("rejects an already-aborted Request using native fetch", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      returnFetch()(
        new Request("data:text/plain,hello", {
          signal: controller.signal,
        }),
      ),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
