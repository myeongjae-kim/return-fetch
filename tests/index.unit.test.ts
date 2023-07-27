/* eslint @typescript-eslint/ban-ts-comment: "off", no-global-assign: "off" */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import returnFetch from "../src";

describe("returnFetch", () => {
  const globalFetch = fetch;
  let fetchMocked: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMocked = vi.fn();
    // @ts-ignore
    fetch = fetchMocked;
  });

  afterEach(() => {
    // @ts-ignore
    fetch = globalFetch;
  });

  it("should call global fetch when no default options.", async () => {
    // given
    const fetchExtended = returnFetch();

    // when
    await fetchExtended("https://base-url.com/todos/1");

    // then
    expect(fetchMocked).toHaveBeenCalledWith("https://base-url.com/todos/1", {
      headers: new Headers(),
    });
  });

  it("should call given fetch.", async () => {
    // given
    const givenFetch = vi.fn();
    const fetchExtended = returnFetch({ fetch: givenFetch });

    // when
    await fetchExtended("https://base-url.com/todos/1");

    // then
    expect(givenFetch).toHaveBeenCalledWith("https://base-url.com/todos/1", {
      headers: new Headers(),
    });
    expect(fetchMocked).not.toHaveBeenCalled();
  });

  it("should apply baseUrl.", async () => {
    // given
    const fetchExtended = returnFetch({
      baseUrl: "https://base-url.com",
    });

    // when
    await fetchExtended("/todos/1");

    // then
    expect(fetchMocked).toHaveBeenCalledWith(
      new URL("https://base-url.com/todos/1"),
      {
        headers: new Headers(),
      },
    );
  });

  it("should apply default headers.", async () => {
    // given
    const fetchExtended = returnFetch({
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // when
    await fetchExtended("https://base-url.com/todos/1");

    // then
    expect(fetchMocked).toHaveBeenCalledWith("https://base-url.com/todos/1", {
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    });
  });

  it("should override default headers", async () => {
    // given
    const fetchExtended = returnFetch({
      headers: {
        "Content-Type": "application/xml",
        Accept: "application/json",
      },
    });

    // when
    await fetchExtended("https://base-url.com/todos/1", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // then
    expect(fetchMocked).toHaveBeenCalledWith("https://base-url.com/todos/1", {
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    });
  });

  it("should call request, response interceptors", async () => {
    // given
    const mockShouldBeCalledInInterceptors = vi.fn();

    const fetchExtended = returnFetch({
      interceptors: {
        request: async () => {
          mockShouldBeCalledInInterceptors("request interceptor called");
          return [
            "https://force-set-url.com",
            { headers: { "X-Force-Set-Header": "force-set-header" } },
          ];
        },
        response: async (requestArgs, response) => {
          mockShouldBeCalledInInterceptors("response interceptor called");

          const body: ReadableStream<Uint8Array> = new Blob([
            "force-set-body",
          ]).stream();

          return { ...response, body };
        },
      },
    });

    // when
    const response = await fetchExtended("https://base-url.com/todos/1");

    // then
    expect(mockShouldBeCalledInInterceptors).toHaveBeenNthCalledWith(
      1,
      "request interceptor called",
    );
    expect(mockShouldBeCalledInInterceptors).toHaveBeenNthCalledWith(
      2,
      "response interceptor called",
    );

    expect(fetchMocked).toHaveBeenCalledWith("https://force-set-url.com", {
      headers: { "X-Force-Set-Header": "force-set-header" },
    });

    const responseBody = await response.body
      .getReader()
      .read()
      .then((stream) => stream.value)
      .then(Buffer.from)
      .then((it) => it.toString("utf-8"));
    expect(responseBody).toBe("force-set-body");
  });
});
