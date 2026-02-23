import fetch from "node-fetch";

const requests = 60;

const url = "http://localhost:8000/matches";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Connection": "keep-alive",
  "Origin": "http://localhost:3000",
  "Referer": "http://localhost:3000/",
};

await Promise.all(
  Array.from({ length: requests }).map(async () => {
    try {
      const res = await fetch(url, { headers });
      console.log(res.status);
    } catch (err) {
      console.error(err);
    }
  })
);