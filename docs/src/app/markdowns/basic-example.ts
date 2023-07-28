export const basicExample = `
\`\`\`ts
import returnFetch from "return-fetch";

const fetchExtended = returnFetch({
   baseUrl: "https://jsonplaceholder.typicode.com",
   headers: { Accept: "application/json" },
   interceptors: {
      request: async (args) => {
         console.log("********* before sending request *********");
         console.log("url:", args[0].toString());
         console.log("requestInit:", args[1], "\\n\\n");
         return args;
      },

      response: async (requestArgs, response) => {
         console.log("********* after receiving response *********");
         console.log("url:", requestArgs[0].toString());
         console.log("requestInit:", requestArgs[1], "\\n\\n");
         return response;
      },
   },
});

fetchExtended("/todos/1", { method: "GET" })
        .then((it) => it.text())
        .then(console.log);
\`\`\`

**Output**

\`\`\`json
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
\`\`\`
`;
