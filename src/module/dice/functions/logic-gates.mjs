const logicGates = {
  and: (...args) => (args.every(Boolean) ? args.at(-1) : 0),
  if: (...args) => (args[0] ? args[1] : args[2] || 0),
  nand: (...args) => Number(!args.every(Boolean)),
  nor: (...args) => Number(!args.some(Boolean)),
  not: a => Number(!a),
  or: (...args) => args.find(Boolean) || 0,
  xnor: (...args) => Number(args.filter(Boolean).length % 2 === 0),
  xor: (...args) => Number(args.filter(Boolean).length % 2 === 1),
};

export default logicGates;
