import { createServer } from "node:http";
import { once } from "node:events";
import { describe, expect, it, vi } from "vitest";
import returnFetch, { FetchArgs } from "../src";

describe("Request compatibility", () => {
  it("sends streaming bodies before EOF and lets native fetch handle abort", async () => {
    let receiveChunk!: (chunk: string) => void;
    const received = new Promise<string>((resolve) => {
      receiveChunk = resolve;
    });
    const server = createServer((request) => {
      request.once("data", (chunk) => receiveChunk(chunk.toString()));
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string")
      throw Error("Missing server port");
    const controller = new AbortController();
    let streamController!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(stream) {
        streamController = stream;
        stream.enqueue(new TextEncoder().encode("first chunk"));
      },
    });
    const request = new Request(`http://127.0.0.1:${address.port}`, {
      method: "POST",
      body,
      signal: controller.signal,
      duplex: "half",
    } as RequestInit);
    const pending = returnFetch()(request);
    const rejection = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const chunk = await Promise.race([
        received,
        new Promise((_, reject) => {
          timeout = setTimeout(
            () => reject(Error("Upload waited for EOF")),
            2000,
          );
        }),
      ]);
      expect(chunk).toBe("first chunk");
    } finally {
      clearTimeout(timeout);
      controller.abort();
      streamController.close();
      try {
        await rejection;
      } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    }
  });

  it("preserves implementation-specific options through composition", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response());
    const request = new Request("https://example.com");
    const init = { next: { revalidate: 60 }, priority: "high" } as RequestInit;
    await returnFetch({ fetch: returnFetch({ fetch }) })(request, init);
    expect(fetch).toHaveBeenCalledWith(request, init);
  });

  it.each<{ init?: RequestInit; accept: string; requestHeader: string | null }>(
    [
      { accept: "application/xml", requestHeader: "request" },
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
    "merges defaults with native Request header precedence for %j",
    async ({ init, accept, requestHeader }) => {
      const request = new Request("https://example.com", {
        headers: { Accept: "application/xml", "X-Request": "request" },
      });
      const fetch = vi.fn().mockResolvedValue(new Response());
      await returnFetch({
        fetch,
        baseUrl: "https://other.example",
        headers: { Accept: "application/json", "X-Default": "default" },
      })(request, init);
      const [input, options] = fetch.mock.calls[0];
      expect(input).toBe(request);
      expect(options.headers.get("Accept")).toBe(accept);
      expect(options.headers.get("X-Default")).toBe("default");
      expect(options.headers.get("X-Request")).toBe(requestHeader);
      expect(request.headers.has("X-Default")).toBe(false);
    },
  );

  it("preserves an empty body and native keepalive support", async () => {
    const fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const effective = new Request(input, init);
        expect(effective.body).not.toBeNull();
        expect(effective.keepalive).toBe(true);
        expect(await effective.text()).toBe("");
        return new Response();
      },
    );
    await returnFetch({ fetch, headers: { "X-Default": "default" } })(
      new Request("https://example.com", {
        method: "POST",
        body: "",
        keepalive: true,
      }),
    );
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("passes Request inputs to interceptors in composition order", async () => {
    const calls: string[] = [];
    const response = new Response();
    const request = new Request("https://example.com");
    const fetch = vi.fn().mockResolvedValue(response);
    const layer = (
      name: string,
      inner: typeof fetch | ReturnType<typeof returnFetch>,
    ) =>
      returnFetch({
        fetch: inner,
        interceptors: {
          request: async (args: FetchArgs) => {
            expect(args[0]).toBe(request);
            calls.push(`${name}:request`);
            return args;
          },
          response: async (actual, args) => {
            expect(actual).toBe(response);
            expect(args[0]).toBe(request);
            calls.push(`${name}:response`);
            return actual;
          },
        },
      });
    expect(await layer("outer", layer("inner", fetch))(request)).toBe(response);
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
