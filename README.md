<h1 align="center">fetch-extendable</h1>

<p align="center">
  A very light and simple library to extend <code>fetch</code> by implementing request, response interceptors.
  <a href="https://stackblitz.com/edit/fetch-extendable" target="_blank"><strong>See Demo</strong></a>.
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

The most disappointing aspect I found when trying to replace Axios with `fetch` was that `fetch` does not have any
interceptors. I thought surely someone must have implemented it, so I searched for libraries. However, there was no
library capable of handling various situations, only one that could add a single request and response interceptors to
the global `fetch`. This is the reason why I decided to implement it myself.

### Philosophy

In implementing the `fetch` interceptors, I considered the following points:

1. Setting library boundaries. I decided to only implement the following additional functions and not others:
    1. Implementing request and response interceptors
    2. Specifying a baseUrl
    3. Setting a default header
2. **No peer dependencies**. I decided not to use any other libraries. This is because I wanted to keep the library as
   light as possible, and running any execution environments which have `fetch` (e.g. Node.js, browser, React Native).
3. It should be easy to add interceptors.
4. The code to add interceptors should be reusable and able to maintain the **Single Responsibility Principle (SRP)**,
and it should be possible to combine interceptors that adhere to the SRP.

## Installation

Via npm

```bash
npm install fetch-extendable
```

Via yarn

```bash
yarn add fetch-extendable
```

Via pnpm

```bash
pnpm add fetch-extendable
```

## Usage

TBD
