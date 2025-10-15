//noinspection EqualityComparisonWithCoercionJS,JSUnusedGlobalSymbols

const logicGates = {
  and: (...args) => (args.every(Boolean) ? args.at(-1) : 0),
  nand: (...args) => +!args.every(Boolean),
  nor: (...args) => +!args.some(Boolean),
  not: (a) => +!a,
  or: (...args) => args.find(Boolean) || 0,
  xnor: (...args) => +(args.filter(Boolean).length % 2 === 0),
  xor: (...args) => +(args.filter(Boolean).length % 2 === 1),
};

export default logicGates;
