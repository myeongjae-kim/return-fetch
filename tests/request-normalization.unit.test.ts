import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import returnFetch from "../src";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("buffered Request normalization", () => {
  it.each(["pending", "rejected"])(
    "aborts a pending read even when source cancellation is %s",
    async (cancellation) => {
      let start!: () => void;
      const reading = new Promise<void>((resolve) => (start = resolve));
      let finishCancel!: () => void;
      const canceled = new Promise<void>((resolve) => (finishCancel = resolve));
      const cancel = vi.fn(() =>
        cancellation === "pending"
          ? canceled
          : Promise.reject(Error("cleanup")),
      );
      const stream = new ReadableStream<Uint8Array>({
        pull() {
          start();
        },
        cancel,
      });
      const controller = new AbortController();
      const reason = Error("user canceled");
      const fetch = vi.fn(async () => new Response());
      const requestInterceptor = vi.fn(async (args) => args);
      const pending = returnFetch({
        fetch,
        interceptors: { request: requestInterceptor },
      })(
        new Request("https://example.com", {
          method: "POST",
          body: stream,
          duplex: "half",
          signal: controller.signal,
        } as RequestInit),
      );
      const rejection = expect(pending).rejects.toBe(reason);
      try {
        await reading;
        controller.abort(reason);
        await rejection;
        expect(cancel).toHaveBeenCalledWith(reason);
        expect(fetch).not.toHaveBeenCalled();
        expect(requestInterceptor).not.toHaveBeenCalled();
      } finally {
        finishCancel();
      }
    },
  );

  it("cancels a body when its signal was already aborted", async () => {
    const cancel = vi.fn();
    const controller = new AbortController();
    controller.abort();
    const fetch = vi.fn(async () => new Response());
    await expect(
      returnFetch({ fetch })(
        new Request("https://example.com", {
          method: "POST",
          body: new ReadableStream<Uint8Array>({ cancel }),
          duplex: "half",
          signal: controller.signal,
        } as RequestInit),
      ),
    ).rejects.toBe(controller.signal.reason);
    expect(cancel).toHaveBeenCalledWith(controller.signal.reason);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses the caller's overriding signal during buffering", async () => {
    const original = new AbortController();
    original.abort();
    const override = new AbortController();
    const fetch = vi.fn(async () => new Response());
    await returnFetch({ fetch })(
      new Request("https://example.com", {
        method: "POST",
        body: "hello",
        signal: original.signal,
      }),
      { signal: override.signal },
    );
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("forwards source errors before invoking interceptors or fetch", async () => {
    const reason = Error("source failed");
    const fetch = vi.fn(async () => new Response());
    await expect(
      returnFetch({ fetch })(
        new Request("https://example.com", {
          method: "POST",
          body: new ReadableStream<Uint8Array>({
            start(controller) {
              controller.error(reason);
            },
          }),
          duplex: "half",
        } as RequestInit),
      ),
    ).rejects.toBe(reason);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("preserves multi-chunk bytes, including views and cross-realm Uint8Arrays", async () => {
    const fetch = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.body).toBeInstanceOf(ArrayBuffer);
        expect(Array.from(new Uint8Array(init!.body as ArrayBuffer))).toEqual([
          1, 2, 3, 4,
        ]);
        return new Response();
      },
    );
    await returnFetch({ fetch })(
      new Request("https://example.com", {
        method: "POST",
        body: new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array([0, 1, 2, 0]).subarray(1, 3));
            controller.enqueue(runInNewContext("new Uint8Array([3, 4])"));
            controller.close();
          },
        }),
        duplex: "half",
      } as RequestInit),
    );
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("rejects non-byte stream chunks", async () => {
    const fetch = vi.fn(async () => new Response());
    await expect(
      returnFetch({ fetch })(
        new Request("https://example.com", {
          method: "POST",
          body: new ReadableStream({
            start(controller) {
              controller.enqueue("not bytes");
              controller.close();
            },
          }),
          duplex: "half",
        } as RequestInit),
      ),
    ).rejects.toBeInstanceOf(TypeError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([undefined, ""])(
    "keeps legacy empty body output for %j",
    async (body) => {
      const fetch = vi.fn(
        async (_input: RequestInfo | URL, init?: RequestInit) => {
          expect(init?.body).toBeUndefined();
          return new Response();
        },
      );
      await returnFetch({ fetch })(
        new Request("https://example.com", { method: "POST", body }),
      );
      expect(fetch).toHaveBeenCalledOnce();
    },
  );

  it("skips reading when the Request has no body", async () => {
    const read = vi.spyOn(Request.prototype, "arrayBuffer");
    const fetch = vi.fn(async () => new Response());
    await returnFetch({ fetch })(new Request("https://example.com"));
    expect(read).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("keeps buffering and retries available without TransformStream", async () => {
    vi.stubGlobal("TransformStream", undefined);
    const bodies: string[] = [];
    const fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        bodies.push(await new Request(input, init).text());
        return new Response("", { status: bodies.length === 1 ? 503 : 200 });
      },
    );
    const response = await returnFetch({
      fetch,
      interceptors: {
        response: async (response, args, retry) =>
          response.status === 503 ? retry(...args) : response,
      },
    })(
      new Request("https://example.com", { method: "POST" }),
      // Node's constructor itself uses TransformStream when transferring a body.
      // Supply a replacement body to exercise only the library's fallback.
      { body: "legacy" },
    );
    expect(response.status).toBe(200);
    expect(bodies).toEqual(["legacy", "legacy"]);
  });

  it("falls back to arrayBuffer when a polyfill does not expose a stream body", async () => {
    const nativeRequest = Request;
    class PolyfilledRequest extends nativeRequest {
      get body(): Request["body"] {
        return undefined as unknown as null;
      }
    }
    vi.stubGlobal("Request", PolyfilledRequest);
    const fetch = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(await new Response(init?.body).text()).toBe("polyfilled");
        return new Response();
      },
    );
    await returnFetch({ fetch })(
      new PolyfilledRequest("https://example.com", {
        method: "POST",
        body: "polyfilled",
      }),
    );
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("evaluates standard and extension getters once while preserving their receiver", async () => {
    const reads = new Map<string, number>();
    const values = {
      method: "POST",
      body: "hello",
      headers: { "X-Test": "yes" },
      priority: "high",
      duplex: "half",
      window: null,
      next: { revalidate: 60 },
    };
    const init: RequestInit = {};
    for (const [key, value] of Object.entries(values)) {
      Object.defineProperty(init, key, {
        enumerable: true,
        get() {
          expect(this).toBe(init);
          reads.set(key, (reads.get(key) ?? 0) + 1);
          if (reads.get(key)! > 1) throw Error(key + " getter consumed twice");
          return value;
        },
      });
    }
    const fetch = vi.fn(
      async (_input: RequestInfo | URL, options?: RequestInit) => {
        expect(options).toMatchObject({
          method: "POST",
          priority: "high",
          duplex: "half",
          window: null,
          next: { revalidate: 60 },
        });
        expect(await new Response(options?.body).text()).toBe("hello");
        expect(new Headers(options?.headers).get("X-Test")).toBe("yes");
        return new Response();
      },
    );
    await returnFetch({ fetch: returnFetch({ fetch }) })(
      new Request("https://example.com"),
      init,
    );
    expect(Object.fromEntries(reads)).toEqual(
      Object.fromEntries(Object.keys(values).map((key) => [key, 1])),
    );
  });

  it("keeps native getter order, including inherited and non-enumerable options", async () => {
    const order: string[] = [];
    const createInit = (): RequestInit => {
      const init = Object.create({
        get method() {
          order.push("method");
          return "POST";
        },
      });
      Object.defineProperty(init, "body", {
        get() {
          order.push("body");
          return "hidden";
        },
      });
      Object.defineProperty(init, "headers", {
        enumerable: true,
        get() {
          order.push("headers");
          return { "X-Test": "yes" };
        },
      });
      return init;
    };
    new Request(new Request("https://example.com"), createInit());
    const nativeOrder = [...order];
    order.length = 0;
    const fetch = vi.fn(
      async (_input: RequestInfo | URL, options?: RequestInit) => {
        expect(options?.method).toBe("POST");
        expect(await new Response(options?.body).text()).toBe("hidden");
        return new Response();
      },
    );
    await returnFetch({ fetch })(
      new Request("https://example.com"),
      createInit(),
    );
    expect(order).toEqual(nativeOrder);
  });

  it("does not reevaluate getters whose first result is undefined", async () => {
    const getter = vi.fn(() => undefined);
    const init = {
      get body() {
        return getter();
      },
    };
    await returnFetch({ fetch: async () => new Response() })(
      new Request("https://example.com"),
      init,
    );
    expect(getter).toHaveBeenCalledOnce();
  });

  it("preserves extension options through composition with normalized fields taking precedence", async () => {
    const fetch = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init).toMatchObject({
          next: { revalidate: 60 },
          priority: "high",
          method: "POST",
        });
        expect(init?.body).toBeInstanceOf(ArrayBuffer);
        expect(await new Response(init?.body).text()).toBe("replacement");
        expect(new Headers(init?.headers).get("X-Call")).toBe("yes");
        return new Response();
      },
    );
    const options = {
      next: { revalidate: 60 },
      priority: "high" as const,
      method: "post",
      body: "replacement",
      headers: { "X-Call": "yes" },
    };
    await returnFetch({ fetch: returnFetch({ fetch }) })(
      new Request("https://example.com", { method: "POST", body: "original" }),
      options,
    );
    expect(options.method).toBe("post");
    expect(options.body).toBe("replacement");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it.each([undefined, {}, { headers: {} }])(
    "keeps referrer behavior for %j",
    async (init) => {
      const fetch = vi.fn(
        async (_input: RequestInfo | URL, options?: RequestInit) => {
          expect(options?.referrer).toBe(
            init && "headers" in init
              ? "about:client"
              : "https://example.com/from",
          );
          expect(options?.referrerPolicy).toBe(
            init && "headers" in init ? "" : "origin",
          );
          return new Response();
        },
      );
      await returnFetch({ fetch })(
        new Request("https://example.com", {
          referrer: "https://example.com/from",
          referrerPolicy: "origin",
        }),
        init,
      );
    },
  );
});
