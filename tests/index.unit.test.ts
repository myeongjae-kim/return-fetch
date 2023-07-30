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

  it("should throw error if a first argument of fetch is Request object.", async () => {
    // given
    const fetchExtended = returnFetch();

    // when
    await expect(
      (fetchExtended as typeof fetch)(
        new Request("https://base-url.com/todos/1"),
      ),
    ).rejects.toThrowError(
      "Request object as the first argument of fetch is not supported yet.",
    );
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
        response: async (response) => {
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

  it("should use provided fetch in interceptors", async () => {
    // given
    const myFetch = vi.fn();

    const fetchExtended = returnFetch({
      fetch: myFetch,
      interceptors: {
        request: async (requestArgs, fetch) => {
          await fetch("provided fetch called in request interceptor");

          return requestArgs;
        },
        response: async (response, _, fetch) => {
          await fetch("provided fetch called in response interceptor");

          return response;
        },
      },
    });

    // when
    await fetchExtended("https://base-url.com/todos/1");

    // then
    expect(myFetch).toHaveBeenNthCalledWith(
      1,
      "provided fetch called in request interceptor",
    );

    expect(myFetch).toHaveBeenNthCalledWith(2, "https://base-url.com/todos/1", {
      headers: new Headers(),
    });

    expect(myFetch).toHaveBeenNthCalledWith(
      3,
      "provided fetch called in response interceptor",
    );
  });
});
