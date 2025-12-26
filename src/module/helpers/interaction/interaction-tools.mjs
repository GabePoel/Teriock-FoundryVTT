export function parseArguments(input) {
  const regex = /([^\s"']+)|"([^"]*)"|'([^']*)'/g;
  const args = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    args.push(match[1] || match[2] || match[3]);
  }
  return args.reduce((acc, term) => {
    if (term.includes("=")) {
      const [key, ...valParts] = term.split("=");
      acc.push([key, valParts.join("=")]);
    } else {
      acc.push([term, true]);
    }
    return acc;
  }, []);
}

export function interpretArguments(argArr, command) {
  const argObj = {};
  let num = 0;
  const definedArgs = command.args || [];
  const definedFlags = command.flags || {};
  for (const [key, value] of argArr) {
    if (num < definedArgs.length && typeof value === "boolean") {
      argObj[definedArgs[num]] = key;
      num += 1;
    } else {
      if (definedFlags[key]) argObj[definedFlags[key]] = value;
      else argObj[key] = value;
    }
  }
  return argObj;
}
