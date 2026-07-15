/* eslint-disable eqeqeq */
const comparisons = {
  eq: { label: "TERIOCK.TERMS.Comparison.eq", fn: (a, b) => Number(a == b) },
  gt: { label: "TERIOCK.TERMS.Comparison.gt", fn: (a, b) => Number(a > b) },
  gte: { label: "TERIOCK.TERMS.Comparison.gte", fn: (a, b) => Number(a >= b) },
  lt: { label: "TERIOCK.TERMS.Comparison.lt", fn: (a, b) => Number(a < b) },
  lte: { label: "TERIOCK.TERMS.Comparison.lte", fn: (a, b) => Number(a <= b) },
  neq: { label: "TERIOCK.TERMS.Comparison.neq", fn: (a, b) => Number(a != b) },
};

// no sort
const dieFaces = { 2: "d2", 4: "d4", 6: "d6", 8: "d8", 10: "d10", 12: "d12", 20: "d20", 100: "d100" };

export default { comparisons, dieFaces };
