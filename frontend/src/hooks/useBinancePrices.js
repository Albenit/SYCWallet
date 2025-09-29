import { useEffect, useState } from "react";

export default function useBinancePrices(symbols = []) {
  const [prices, setPrices] = useState({});

useEffect(() => {
  if (!symbols.length) return;

  const uniqueSymbols = [...new Set(symbols.map((s) => s.toLowerCase()))];
  const streams = uniqueSymbols.map((s) => `${s}@ticker`).join("/");

  const ws = new WebSocket(
    `wss://stream.binance.com:9443/stream?streams=${streams}`
  );

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message?.data?.s) {
        const symbol = message.data.s;
        const price = parseFloat(message.data.c);
        const change = parseFloat(message.data.P);

        setPrices((prev) => ({
          ...prev,
          [symbol]: { price, change },
        }));
      }
    } catch (err) {
      console.error("Binance WS error:", err);
    }
  };

  return () => ws.close();
}, [JSON.stringify(symbols)]);

  return prices;
}
