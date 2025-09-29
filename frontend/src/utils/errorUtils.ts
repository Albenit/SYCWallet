export function sendTransactionError(err: any): string {
  const msg = err?.message || "";

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
  return "Transaction failed. Please try again.";
}
