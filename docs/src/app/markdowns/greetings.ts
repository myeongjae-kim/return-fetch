export const greetings = `
## Background

The most disappointing aspect I found when trying to replace [Axios](https://github.com/axios/axios) with \`fetch\`
was that \`fetch\` does not have any interceptors. I thought surely someone must have implemented it, so I searched for
libraries. However, there was no library capable of handling various situations, only one that could add a single
request and response interceptors to the global \`fetch\`. This is the reason why I decided to implement it myself.

### Philosophy

In implementing the \`fetch\` interceptors, I considered the following points:

1. Setting library boundaries. I decided to only implement the following additional functions and not others:
   1. Implementing request and response interceptors
   2. Specifying a baseUrl
   3. Setting a default header
2. **No peer dependencies**. I decided not to use any other libraries. This is because I wanted to keep the library as
   light as possible, and running any execution environments which have \`fetch\` (e.g. Node.js, Web Browsers, React
   Native).
3. It should be easy to add interceptors.
4. The code to add interceptors should be reusable and able to maintain the **Single Responsibility Principle (SRP)**,
   and it should be possible to combine interceptors that adhere to the SRP.

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
`;
