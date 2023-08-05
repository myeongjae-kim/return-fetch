/* eslint @typescript-eslint/ban-ts-comment: "off", no-global-assign: "off" */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import returnFetchJson from "../src";

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

  it("should serialize request body and deserialize response body", async () => {
    // given
    const responseBody = { id: 1 };
    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
    fetchMocked.mockResolvedValue(response);
    const fetchExtended = returnFetchJson({
      baseUrl: "https://base-url.com",
      // no request headers
    });

    // when
    const requestBody = { title: "delectus aut autem", completed: false };
    const actual = await fetchExtended<{ id: number }>("/post", {
      method: "POST",
      body: requestBody,
    });

    // then
    expect(actual.body).toEqual(responseBody);
    expect(actual.headers.get("Content-Type")).toBe("application/json");
    expect(actual.ok).toBe(true);
    expect(actual.redirected).toBe(false);
    expect(actual.status).toBe(200);
    expect(actual.statusText).toBe("OK");
    expect(actual.type).toBe("default");
    expect(actual.url).toBe("");

    expect(fetchMocked.mock.calls[0][0]).toEqual(
      new URL("https://base-url.com/post"),
    );
    expect(fetchMocked.mock.calls[0][1].body).toBe(JSON.stringify(requestBody));
    expect(fetchMocked.mock.calls[0][1].headers).toBeInstanceOf(Headers);
    // Content-Type and Accept are set by default when not provided
    expect(fetchMocked.mock.calls[0][1].headers.get("Content-Type")).toBe(
      "application/json",
    );
    expect(fetchMocked.mock.calls[0][1].headers.get("Accept")).toBe(
      "application/json",
    );
  });

  it("should override Content-Type and Accept header when provided", async () => {
    // given
    const responseBody = { id: 1 };
    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "Content-Type": "application/json; charset=utf-8",
      }),
    });
    fetchMocked.mockResolvedValue(response);
    const fetchExtended = returnFetchJson({
      baseUrl: "https://base-url.com",
    });

    // when
    const requestBody = { title: "delectus aut autem", completed: false };
    const actual = await fetchExtended<{ id: number }>("/post", {
      method: "POST",
      body: requestBody,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json; charset=utf-8",
      },
    });

    // then
    expect(fetchMocked.mock.calls[0][1].headers).toBeInstanceOf(Headers);
    // Content-Type and Accept are set by default when not provided
    expect(fetchMocked.mock.calls[0][1].headers.get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(fetchMocked.mock.calls[0][1].headers.get("Accept")).toBe(
      "application/json; charset=utf-8",
    );
  });

  it("should return trimmed string body when respones body is not valid json", async () => {
    // given
    const responseBody = "\t\n an invalid json string\t\n ";
    const response = new Response(responseBody, {
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "Content-Type": "application/text",
      }),
    });
    fetchMocked.mockResolvedValue(response);
    const fetchExtended = returnFetchJson({
      baseUrl: "https://base-url.com",
      // no request headers
    });

    // when
    const requestBody = { title: "delectus aut autem", completed: false };
    const actual = await fetchExtended<"a type not a json object">("/post", {
      method: "POST",
      body: requestBody,
    });

    // then
    expect(actual.body).toEqual("an invalid json string");

    // type test
    const typeTestValidType: string = actual.body;
    // @ts-expect-error
    const typeTestInvalidType: object = actual.body;
  });

  it("should throw error when JSON.parse throws an error which is not a SyntaxError", async () => {
    // given
    const response = new Response(JSON.stringify({ id: 1 }), {
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "Content-Type": "application/text",
      }),
    });
    fetchMocked.mockResolvedValue(response);
    const fetchExtended = returnFetchJson({
      jsonParser: vi.fn().mockImplementation(() => {
        throw Error("not a syntax error");
      }),
      baseUrl: "https://base-url.com",
    });

    // when, then
    await expect(
      fetchExtended<"a type not a json object">("/post", {
        method: "POST",
        body: { title: "delectus aut autem", completed: false },
      }),
    ).rejects.toThrow("not a syntax error");
  });
});
