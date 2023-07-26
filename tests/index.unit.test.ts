import { describe, it } from "vitest";
import { returnFetch } from "../src";

describe("returnFetch", () => {
  it.skip("should print and render outputs", async () => {
    const fetchExtended = returnFetch({
      baseUrl: "https://jsonplaceholder.typicode.com",
      headers: { Accept: "application/json" },
      interceptors: {
        request: async (args) => {
          console.log("********* before sending request *********");
          console.log("url:", args[0].toString());
          console.log("requestInit:", args[1], "\n\n");
          return args;
        },

        response: async (requestArgs, response) => {
          console.log("********* after receiving response *********");
          console.log("url:", requestArgs[0].toString());
          console.log("requestInit:", requestArgs[1], "\n\n");
          return response;
        },
      },
    });

    await fetchExtended("/todos/1", { method: "GET" })
      .then((it) => it.text())
      .then(console.log);
  });

  // TODO: write tests
  //  1. default option 적용 잘 되는지. 특히 헤더, 동일한 key의 header를 입력한 경우 덮어쓰기 잘 되는지
  //  2. 인터셉터 여러 개를 compose했을 때 인터셉터 순서에 맞게 잘 호출 되는지
});
