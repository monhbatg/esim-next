/**
 * Format a number as currency with thousand separators
 * @param amount - The amount to format
 * @param currencyCode - The currency code (e.g., "USD", "EUR")
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "12,345.67 USD" or "$12,345.67")
 */
export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: string = "MNT",
  decimals: number = 2
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0";
  }

  // Check if amount is a whole number
  const isWholeNumber = amount % 1 === 0;
  
  // Format number with thousand separators
  // If it's a whole number, don't show decimals; otherwise use specified decimals
  const formattedAmount = isWholeNumber
    ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Return formatted string with currency symbol/code
  if (currencyCode === "MNT") {
    return `${formattedAmount} ₮`;
  } else if (currencyCode === "USD") {
    return `$${formattedAmount}`;
  } else if (currencyCode === "EUR") {
    return `€${formattedAmount}`;
  } else if (currencyCode === "GBP") {
    return `£${formattedAmount}`;
  } else if (currencyCode === "JPY") {
    return `¥${formattedAmount}`;
  } else {
    return `${formattedAmount} ${currencyCode}`;
  }
}

/**
 * Format a number with thousand separators (no currency symbol)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string (e.g., "12,345.67")
 */
export function formatNumber(
  amount: number | null | undefined,
  decimals: number = 2
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0";
  }

  // Check if amount is a whole number
  const isWholeNumber = amount % 1 === 0;
  
  // If it's a whole number, don't show decimals; otherwise use specified decimals
  return isWholeNumber
    ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

