// src/hooks/useTxHistory.js
import {
    useEffect,
    useState
} from "react";
import {
    Alchemy,
    Network
} from "alchemy-sdk";

const ALCHEMY_KEY = "mQNmjelTm-Z6VYLptlHpH";

const chainProviders = {
    ethereum: {
        type: "alchemy",
        network: Network.ETH_MAINNET
    },
    polygon: {
        type: "alchemy",
        network: Network.MATIC_MAINNET
    },
    arbitrum: {
        type: "alchemy",
        network: Network.ARB_MAINNET
    },
    base: {
        type: "alchemy",
        network: Network.BASE_MAINNET
    },
    bsc: {
        type: "etherscan",
        url: "https://api.bscscan.com/api",
        key: "RMARB2SJUQJCSQG3Z4K5NCCK3II7C18AKG"
    },
    avalanche: {
        type: "etherscan",
        url: "https://api.snowtrace.io/api",
        key: "RMARB2SJUQJCSQG3Z4K5NCCK3II7C18AKG"
    },
};

export default function useTxHistory(address) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!address) return;

        const fetchAll = async () => {
            setLoading(true);
            try {
                const allResults = [];

                for (const [chainKey, provider] of Object.entries(chainProviders)) {
                    try {
                        if (provider.type === "alchemy") {
                            const alchemy = new Alchemy({
                                apiKey: ALCHEMY_KEY,
                                network: provider.network
                            });

                            const [incoming, outgoing] = await Promise.all([
                                alchemy.core.getAssetTransfers({
                                    fromBlock: "0x0",
                                    toAddress: address,
                                    category: ["external", "erc20", "erc721", "erc1155"],
                                    maxCount: 10n,
                                    order: "desc"
                                }),
                                alchemy.core.getAssetTransfers({
                                    fromBlock: "0x0",
                                    fromAddress: address,
                                    category: ["external", "erc20", "erc721", "erc1155"],
                                    maxCount: 10n,
                                    order: "desc"
                                }),
                            ]);

                            [...incoming.transfers, ...outgoing.transfers].forEach((tx) => {
                                allResults.push({
                                    ...tx,
                                    chain: chainKey
                                });
                            });
                        }

                        if (provider.type === "etherscan" && provider.key) {
                            const url = `${provider.url}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${provider.key}`;
                            const res = await fetch(url);
                            const data = await res.json();

                            if (data.status === "1" && Array.isArray(data.result)) {
                                data.result.forEach((tx) => {
                                    allResults.push({
                                        ...tx,
                                        chain: chainKey
                                    });
                                });
                            }
                        }

                        if (provider.type === "covalent") {
                            const url = `https://api.covalenthq.com/v1/${provider.chainId}/address/${address}/transactions_v2/?key=${provider.key}`;
                            const res = await fetch(url);
                            const data = await res.json();
                            if (data?.data?.items) {
                                data.data.items.forEach(tx => {
                                allResults.push({ ...tx, chain: chainKey });
                                });
                            }
                            }
                    } catch (err) {
                        console.warn(`Failed to fetch from ${chainKey}:`, err.message);
                    }
                }

                allResults.sort((a, b) => {
                    const aTime = Number(a.timeStamp || a.metadata?.blockTimestamp || 0);
                    const bTime = Number(b.timeStamp || b.metadata?.blockTimestamp || 0);
                    return bTime - aTime;
                });

                setHistory(allResults);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [address]);

    return {
        history,
        loading,
        error
    };
}