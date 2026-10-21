import { timeoutFetch } from "../dist/index.js";
const response = await timeoutFetch("https://example.com", 2000);
console.log(response.status);
