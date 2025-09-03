export const encumbranceData = {
  level1: {
    name: "Lightly Encumbered",
    id: "lightlyEncumbered",
    _id: "encumbranceL1000",
    statuses: ["encumbered"],
    changes: [
      {
        key: "system.movementSpeed.base",
        mode: 3,
        value: -10,
        priority: 30,
      },
    ],
  },
  level2: {
    name: "Heavily Encumbered",
    id: "heavilyEncumbered",
    _id: "encumbranceL2000",
    statuses: ["encumbered", "slowed"],
  },
  level3: {
    name: "Overburdened",
    id: "cannotCarryMore",
    _id: "encumbranceL3000",
    statuses: ["immobilized"],
  },
};
