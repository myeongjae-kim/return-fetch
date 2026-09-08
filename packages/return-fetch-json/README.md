<h1 align="center">️return-fetch-json</h1>

<p align="center">
An extended function of [return-fetch](https://github.com/myeongjae-kim/return-fetch) to serialize request body and
deserialize response body as json.
<br/>
<a href="https://return-fetch.myeongjae.kim/#3-serialize-request-body-and-deserialize-response-body">
<strong>See Documentation</strong>
</a>
or
<a href="https://stackblitz.com/edit/return-fetch-json"><strong>See Demo</strong></a>
</p>

<p align="center">
  <a href="https://github.com/myeongjae-kim/return-fetch/actions?query=workflow%3ACI">
    <img src="https://github.com/myeongjae-kim/return-fetch/workflows/CI/badge.svg" alt="CI" height="18">
  </a>
  <a href="https://codecov.io/gh/myeongjae-kim/return-fetch">
    <img src="https://img.shields.io/codecov/c/github/myeongjae-kim/return-fetch.svg" alt="Test Coverage" height="18">
  </a>
  <a href="https://www.npmjs.com/package/return-fetch-json">
    <img src="https://nodei.co/npm/return-fetch-json.svg?style=shields&data=v,u,d&color=brightgreen" alt="npm version, updated date, weelky downloads" height="18">
  </a>
  <a href="https://bundlejs.com/?q=return-fetch-json">
    <img src="https://deno.bundlejs.com/?q=return-fetch-json&badge" alt="Bundle Size" height="18">
  </a>
  <a href="https://raw.githubusercontent.com/myeongjae-kim/return-fetch/main/LICENSE">
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

For Accept, non-empty per-call headers override the built-in `application/json`
default, which overrides factory headers. The same applies to Content-Type when
an explicit non-GET method is supplied. Empty per-call values trigger these JSON
defaults. Other headers retain the core per-call-over-factory precedence.

For compatibility, `JsonResponse<T>.body` keeps its original conditional type:
`T` for object types and `string` otherwise, including calls without a type argument.
This is a type assertion, not response validation: at runtime, valid JSON is parsed
as-is (including numbers, booleans and null), and invalid JSON becomes trimmed text.

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
