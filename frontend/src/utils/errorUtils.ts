export function sendTransactionError(err: any): string {
  const msg = err?.message || "";
  const code = err?.code || err?.error?.code || null;

  if (code === "INSUFFICIENT_NATIVE_BALANCE") {
    const context = err?.context || {};
    const shortfall = err?.shortfall || err?.details?.shortfall || context.shortfallEstimated || context.shortfall;
    const required = err?.required || err?.details?.required || context.totalEstimatedCost;
    const available = err?.available || err?.details?.available || context.nativeBalance;
    const symbol = err?.symbol || err?.details?.symbol || context.symbol;
    if (shortfall) {
      return symbol
        ? `Not enough native balance for gas. You are missing approximately ${shortfall} ${symbol}.`
        : `Not enough native balance for gas. You are missing approximately ${shortfall}.`;
    }
    if (required && available) {
      return symbol
        ? `Not enough native balance for gas. Required ~${required} ${symbol}, available ${available} ${symbol}.`
        : `Not enough native balance for gas. Required ~${required}, available ${available}.`;
    }
    return "Not enough native balance to cover gas fees.";
  }

  if (code === "GAS_ESTIMATION_FAILED" || code === "GAS_SIMULATION_FAILED") {
    return "Gas estimation failed. Double-check the amount, recipient, and ensure you have enough balance.";
  }

  if (code === "PENDING_TRANSACTION") {
    return "You have a pending transaction. Wait for it to confirm or speed it up before sending a new one.";
  }

  if (code === "UNSUPPORTED_CHAIN") {
    return "Unsupported network. Please switch chain.";
  }

  if (msg.includes("insufficient funds")) {
    return "You don’t have enough native balance to cover gas fees.";
  }
  if (msg.includes("Not enough balance")) {
    return "Not enough token balance.";
  }
  if (msg.includes("execution reverted")) {
    return "Transaction reverted. Please check the amount or recipient address.";
  }
  if (msg.includes("intrinsic gas too low")) {
    return "Gas limit too low. Try again or increase gas.";
  }
  if (msg.includes("unsupported chain")) {
    return "Unsupported network. Please switch chain.";
  }
  if (msg.includes("UNPREDICTABLE_GAS_LIMIT")) {
    return "Could not estimate gas. Please check balance or input values.";
  }

  if (code === "RPC_ERROR") {
    return "RPC error while broadcasting the transaction. Please retry in a moment.";
  }

  return "Transaction failed. Please try again.";
}
