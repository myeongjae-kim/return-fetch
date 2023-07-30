export const greetings = `
## Background

The [Next.js framework](https://nextjs.org/)(which I love so much) [v13 App Router](https://nextjs.org/docs/app) uses
[its own \`fetch\` which extends \`node-fetch\`](https://nextjs.org/docs/app/api-reference/functions/fetch) to do
server side things like caching. I was accustomed to using [Axios](https://github.com/axios/axios) for API calls, but
I have felt that now is the time to replace Axios with \`fetch\` finally. The most disappointing aspect I found when
trying to replace Axios with \`fetch\` was that \`fetch\` does not have any interceptors. I thought surely someone
must have implemented it, so I searched for libraries. However, there was no library capable of handling various
situations, only one that could add a single request and response interceptors to the global \`fetch\`. This is the
reason why I decided to implement it myself.

### Philosophy

In implementing the \`fetch\` interceptors, I considered the following points:

1. Setting library boundaries. I decided to only implement the following additional functions and not others:
   1. Implementing request and response interceptors
   2. Specifying a \`baseUrl\`
   3. Setting a default header
2. **No peer dependencies**. I decided not to use any other libraries. This is because I would like to keep the library
   as light as possible, and running any execution environments which have \`fetch\` (e.g. Node.js, Web Browsers, React
   Native, Web Workers).
3. It should be easy to add interceptors.
4. The code to add interceptors should be reusable and able to maintain the **Single Responsibility Principle (SRP)**,
   and it should be possible to combine interceptors that adhere to the SRP.

### Good Things

- Superlight bundle size < 1KB.
- No peer dependencies.
- No side effects. Pure functional.
- No classes. Just a function.
- Recursive type definition to chain functions infinitely.
- Any execution environment having fetch, possible for any \`fetch\` polyfills.
- 100% TypeScript.
- 100% test coverage.

## Installation

Via npm

\`\`\`bash
npm install return-fetch
\`\`\`

Via yarn

\`\`\`bash
yarn add return-fetch
\`\`\`

Via pnpm

\`\`\`bash
pnpm add return-fetch
\`\`\`

## Demo

Run on <a href="https://stackblitz.com/edit/return-fetch" target="_blank">Stickblitz</a>.
`;
