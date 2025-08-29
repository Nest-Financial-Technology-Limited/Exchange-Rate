import React, { useState } from "react";

const MARKUP_FEE = parseFloat(import.meta.env.VITE_MARKUP_FEE || 0);

export default function App() {
  const [amountNGN, setAmountNGN] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!amountNGN) return;
    setLoading(true);

    try {
      // 1️⃣ Get USD to NGN
      const bushaRes = await fetch("/.netlify/functions/busha");
      const bushaData = await bushaRes.json();
      const pair = bushaData.data.find((p) => p.id === "USDCNGN");
      if (!pair) throw new Error("USDCNGN pair not found");
      const usdToNgn = parseFloat(pair.buy_price.amount) + MARKUP_FEE;

      // 2️⃣ Naira → USD
      const usdAmount = parseFloat(amountNGN) / usdToNgn;

      // 3️⃣ USD → Target
      let targetAmount = usdAmount;
      if (currency !== "USD") {
        const keyrailsRes = await fetch(`/.netlify/functions/keyrails?targetCurrency=${currency}`);
        const keyrailsData = await keyrailsRes.json();
        targetAmount = usdAmount * parseFloat(keyrailsData.data[0].exchangeRate);
      }

      setResult(targetAmount.toFixed(2));
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">NGN Currency Converter</h1>

      <input
        type="number"
        value={amountNGN}
        onChange={(e) => setAmountNGN(e.target.value)}
        placeholder="Amount in NGN"
        className="border p-2 mb-2 w-64 rounded"
      />

      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="border p-2 mb-2 w-64 rounded"
      >
        {["USD","EUR","GBP","AUD","CNY","SGD","JPY","NZD","CHF","HKD"].map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <button
        onClick={handleConvert}
        className="bg-blue-500 text-white p-2 rounded w-64"
        disabled={loading}
      >
        {loading ? "Converting..." : "Convert"}
      </button>

      {result && (
        <div className="mt-4 text-xl font-semibold">
          {amountNGN} NGN ≈ {result} {currency}
        </div>
      )}
    </div>
  );
}
