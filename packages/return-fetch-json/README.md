# return-fetch-json

An extended function of [return-fetch](https://github.com/deer-develop/return-fetch) to serialize request body and
deserialize response body as json.

[See documentation](https://return-fetch.myeongjae.kim/#3-serialize-request-body-and-deserialize-response-body) or
[see demo](https://stackblitz.com/edit/return-fetch-json).

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
    - https://cdnjs.com/libraries/return-fetch-json
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
