/* eslint-disable eqeqeq */
const comparisons = {
  eq: { inverse: "neq", label: "TERIOCK.TERMS.Comparison.eq", fn: (a, b) => Number(a == b) },
  gt: { inverse: "lte", label: "TERIOCK.TERMS.Comparison.gt", fn: (a, b) => Number(a > b) },
  gte: { inverse: "lt", label: "TERIOCK.TERMS.Comparison.gte", fn: (a, b) => Number(a >= b) },
  lt: { inverse: "gte", label: "TERIOCK.TERMS.Comparison.lt", fn: (a, b) => Number(a < b) },
  lte: { inverse: "gt", label: "TERIOCK.TERMS.Comparison.lte", fn: (a, b) => Number(a <= b) },
  neq: { inverse: "eq", label: "TERIOCK.TERMS.Comparison.neq", fn: (a, b) => Number(a != b) },
};

export default { comparisons };
