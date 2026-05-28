/* eslint-disable eqeqeq */
const comparisons = {
  eq: (a, b) => Number(a == b),
  gt: (a, b) => Number(a > b),
  gte: (a, b) => Number(a >= b),
  lt: (a, b) => Number(a < b),
  lte: (a, b) => Number(a <= b),
  neq: (a, b) => Number(a != b),
};

export default comparisons;
