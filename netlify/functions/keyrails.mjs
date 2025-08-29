import fetch from "node-fetch";

const CLIENT_ID = process.env.KEYRAILS_CLIENT_ID;
const API_KEY = process.env.KEYRAILS_API_KEY;
const API_SECRET = process.env.KEYRAILS_API_SECRET;

let cachedToken = null;
let tokenExpiry = null;

async function getToken() {
  const now = new Date();
  if (cachedToken && tokenExpiry && now < tokenExpiry) return cachedToken;

  const authPayload = {
    grant_type: "http://auth0.com/oauth/grant-type/password-realm",
    realm: "Api-Key-Authentication",
    audience: "https://api.keyrails.com/api",
    client_id: CLIENT_ID,
    username: API_KEY,
    password: API_SECRET,
  };

  const res = await fetch("https://auth.keyrails.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(authPayload),
  });
  const data = await res.json();

  cachedToken = data.access_token;
  tokenExpiry = new Date(new Date().getTime() + (data.expires_in || 3600) * 1000);

  return cachedToken;
}

export async function handler(event) {
  const { targetCurrency } = event.queryStringParameters;
  const token = await getToken();
  const res = await fetch(`https://api.keyrails.com/api/v1/exchange-rates?fromCurrency=USDC&toCurrency=${targetCurrency}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return { statusCode: 200, body: JSON.stringify(data) };
}
