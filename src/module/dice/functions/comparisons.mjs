//noinspection EqualityComparisonWithCoercionJS,JSUnusedGlobalSymbols

const comparisons = {
  eq: (a, b) => +(a == b),
  gt: (a, b) => +(a > b),
  gte: (a, b) => +(a >= b),
  lt: (a, b) => +(a < b),
  lte: (a, b) => +(a <= b),
  neq: (a, b) => +(a != b),
};

export default comparisons;
