// PLACEHOLDER: drawn receipts for seeded orders.
/** A drawn receipt so seeded orders have something to preview. */
export function mockReceiptUrl(method: string, amount: number, ref: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="520" viewBox="0 0 360 520"><rect width="360" height="520" rx="24" fill="#F3F6F9"/><rect x="24" y="24" width="312" height="72" rx="16" fill="#1B6A85"/><text x="48" y="68" font-family="Arial" font-size="22" fill="#fff" font-weight="bold">${method}</text><text x="48" y="150" font-family="Arial" font-size="14" fill="#4A5668">Transaction successful</text><text x="48" y="200" font-family="Arial" font-size="34" fill="#0E1726" font-weight="bold">Rs ${amount.toLocaleString("en-PK")}</text><text x="48" y="260" font-family="Arial" font-size="13" fill="#4A5668">To: Reallogixs Academy</text><text x="48" y="290" font-family="Arial" font-size="13" fill="#4A5668">Ref: ${ref}</text><text x="48" y="320" font-family="Arial" font-size="13" fill="#4A5668">Mock receipt for the demo</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
