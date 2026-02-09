const simpleChangeMode = {
  2: "Add",
  3: "Downgrade",
  4: "Upgrade",
  5: "Override",
};

const foundryChangeMode = {
  1: "Multiply",
  ...simpleChangeMode,
};

export const effectOptions = {
  simpleChangeMode,
  foundryChangeMode,
  changeMode: {
    0: "Boost",
    ...foundryChangeMode,
  },
  transformationLevel: {
    minor: "Minor Transformation",
    full: "Full Transformation",
    greater: "Greater Transformation",
  },
  illusionLevel: {
    minor: "Minor Illusion",
    full: "Full Illusion",
    greater: "Greater Illusion",
  },
};
