import fetch from "node-fetch";

export async function handler() {
  const response = await fetch("https://api.busha.co/v1/pairs");
  const data = await response.json();
  return { statusCode: 200, body: JSON.stringify(data) };
}
