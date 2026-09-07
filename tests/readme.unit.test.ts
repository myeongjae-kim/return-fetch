import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { transpileModule, ModuleKind } from "typescript";
import returnFetch from "../src";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const example = (section: string) => {
  const code = readme
    .slice(readme.indexOf(section))
    .match(/```ts\n([\s\S]*?)```/)?.[1];
  if (!code) throw Error(`Missing README example: ${section}`);
  return transpileModule(code, {
    compilerOptions: { module: ModuleKind.CommonJS },
  }).outputText;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

it("runs the opening README example with the response interceptor arguments", async () => {
  const log = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("example body")),
  );
  // Return the example's promise so interceptor errors fail this test.
  const code = example("```ts").replace(
    '\nfetchExtended("/todos/1"',
    '\nreturn fetchExtended("/todos/1"',
  );
  await new Function("require", "exports", "console", code)(
    () => ({ default: returnFetch }),
    {},
    { log },
  );
  expect(log).toHaveBeenCalledWith("example body");
});

it("the README status interceptor rejects HTTP errors", async () => {
  const exports: { fetchExtended?: ReturnType<typeof returnFetch> } = {};
  // This example also invokes fetch with alert; capture the exported factory first.
  const code = example("### #2.").split(
    "//////////////////// Use it somewhere",
  )[0];
  new Function("require", "exports", code)(
    () => ({ default: returnFetch }),
    exports,
  );
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("denied", { status: 401 })),
  );
  await expect(exports.fetchExtended!("https://example.com")).rejects.toThrow(
    "denied",
  );
});
