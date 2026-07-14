import fetch from "node-fetch";
const key = process.env.GEMINI_API_KEY;

async function testHeader() {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", {
    headers: { "x-goog-api-key": key }
  });
  console.log("Header auth:", res.status, await res.text());
}

async function testQuery() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=${key}`);
  console.log("Query auth:", res.status, await res.text());
}

await testHeader();
await testQuery();
