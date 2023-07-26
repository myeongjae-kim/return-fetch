<h1 align="center">fetch-extendable</h1>

<p align="center">
A very light and simple library to extend fetch by implementing request, response interceptors.
</p>

```ts
import { returnFetch } from "fetch-extendable";

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

fetchExtended("/todos/1", { method: "GET" })
  .then((it) => it.text())
  .then(console.log);
```

**Output**

```
********* before sending request *********
url: https://jsonplaceholder.typicode.com/todos/1
requestInit: { method: 'GET', headers: { Accept: 'application/json' } } 


********* after receiving response *********
url: https://jsonplaceholder.typicode.com/todos/1
requestInit: { method: 'GET', headers: { Accept: 'application/json' } } 


{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

## Background

The most disappointing aspect I found when trying to replace Axios with `fetch` was that `fetch` does not have an
interceptor. I thought surely someone must have implemented it, so I searched for libraries. However, there was no
library capable of handling various situations, only one that could add a single request and response interceptor to
the global `fetch`. These are reasons why I decided to implement it myself.

### Philosophy

In implementing the `fetch` interceptor, I considered the following points:

1. Setting library boundaries. I decided to only implement the following additional functions and not others:
    1. Implementing request and response interceptors
    2. Specifying a baseURL
    3. Setting a default header
2. It should be easy to add an interceptor.
3. The code to add an interceptor should be reusable.
4. Interceptors should be able to maintain the Single Responsibility Principle (SRP),
and it should be possible to combine interceptors that adhere to the SRP.

### Usage

TBD
