<h1 align="center">️return-fetch-json</h1>

<p align="center">
An extended function of [return-fetch](https://github.com/deer-develop/return-fetch) to serialize request body and
deserialize response body as json.
<br/>
<a href="https://return-fetch.myeongjae.kim/#3-serialize-request-body-and-deserialize-response-body">
<strong>See Documentation</strong>
</a>
or
<a href="https://stackblitz.com/edit/return-fetch-json"><strong>See Demo</strong></a>
</p>

<p align="center">
  <a href="https://github.com/deer-develop/return-fetch/actions?query=workflow%3ACI">
    <img src="https://github.com/deer-develop/return-fetch/workflows/CI/badge.svg" alt="CI" height="18">
  </a>
  <a href="https://codecov.io/gh/deer-develop/return-fetch">
    <img src="https://img.shields.io/codecov/c/github/deer-develop/return-fetch.svg" alt="Test Coverage" height="18">
  </a>
  <a href="https://www.npmjs.com/package/return-fetch-json">
    <img src="https://img.shields.io/npm/v/return-fetch-json.svg" alt="npm version" height="18">
  </a>
  <a href="https://bundlephobia.com/package/return-fetch-json">
    <img src="https://img.shields.io/bundlephobia/minzip/return-fetch-json" alt="Bundle Size" height="18">
  </a>
  <a href="https://raw.githubusercontent.com/deer-develop/return-fetch/main/LICENSE">
    <img src="https://img.shields.io/npm/l/return-fetch.svg" alt="MIT license" height="18">
  </a>
</p>

```ts
import returnFetchJson from "return-fetch-json";

// Create an extended fetch function and use it instead of the global fetch.
export const fetchExtended = returnFetchJson({
  jsonParser: JSON.parse, // `jsonParser` property is omittable. You can use your custom parser.
  baseUrl: "https://jsonplaceholder.typicode.com"
});

//////////////////// Use it somewhere ////////////////////
fetchExtended<{ id: number }>("/posts", {
  method: "POST",
  body: { message: "Hello, world!" },
}).then(it => it.body)
  .then(console.log);
```

## Installation

### Package Manager

Via npm

```bash
npm install return-fetch-json
```

Via yarn

```bash
yarn add return-fetch-json
```

Via pnpm

```bash
pnpm add return-fetch-json
```

### \<script\> tag

```html
<!--
  Pick your favourite CDN:
    - https://unpkg.com/return-fetch-json
    - https://cdn.jsdelivr.net/npm/return-fetch-json
    - https://www.skypack.dev/view/return-fetch-json
    - …
-->

<!-- UMD import as window.returnFetchJson -->
<script src="https://unpkg.com/return-fetch-json"></script>

<!-- Modern import -->
<script type="module">
  import returnFetchJson from 'https://cdn.skypack.dev/return-fetch-json/dist/index.js'

  // ... //
</script>
```

## Demo

Run on <a href="https://stackblitz.com/edit/return-fetch-json" target="_blank">Stickblitz</a>.
