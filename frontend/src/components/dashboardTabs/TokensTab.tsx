import Row from "../partials/Row";

interface TokensTabProps {
  portfolio: any;
  portfolioLoading: boolean;
  portfolioError: string | null;
}

export default function TokensTab({ portfolio, portfolioLoading, portfolioError }: TokensTabProps) {
  if (portfolioLoading) return <p className="text-gray-400 text-sm">Loading tokens…</p>;
  if (portfolioError) return <p className="text-red-500 text-sm">{portfolioError}</p>;

  return (
    <div className="space-y-4">
      {portfolio?.portfolio?.map((chain: any) =>
        chain.items?.map((item: any, idx: number) => (
          <div className="px-6" key={`${chain.chain}-${idx}`}>
            <div className="overflow-hidden">
              <Row
                icon={
                  <div className="h-9 w-9 rounded-full bg-white/10 ring-1 ring-white/10 flex items-center justify-center">
                    <svg viewBox="0 0 256 417" className="h-5 w-5" aria-hidden>
                      <polygon fill="#a3bffa" points="127.9,0 0,213.7 127.9,282.6 255.8,213.7" />
                      <polygon fill="#94a3b8" points="127.9,416.3 255.8,246.3 127.9,315.3 0,246.3" />
                    </svg>
                  </div>
                }
                chain={chain.chain}
                symbol={item?.symbol || "UNKNOWN"}
                priceUsd={item?.usdPrice ? item.usdPrice : "0.00"}
                change={-2.32}
                balance={item?.balance ? parseFloat(item.balance).toFixed(4) : "0.0000"}
                usdValue={(item?.usdValue || 0).toFixed(3)}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
