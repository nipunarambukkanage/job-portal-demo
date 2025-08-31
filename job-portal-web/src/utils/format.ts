export const truncate = (s: string, n = 100) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
export const currency = (n: number, code = 'USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(n);
