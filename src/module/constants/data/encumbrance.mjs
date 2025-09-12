import { getIcon } from "../../helpers/path.mjs";

export const encumbranceData = {
  level1: {
    _id: "encumbranceL1000",
    changes: [
      {
        key: "system.movementSpeed.base",
        mode: 3,
        priority: 30,
        value: -10,
      },
    ],
    id: "lightlyEncumbered",
    img: getIcon("conditions", "Encumbered"),
    name: "Lightly Encumbered",
    statuses: [ "encumbered" ],
  },
  level2: {
    _id: "encumbranceL2000",
    id: "heavilyEncumbered",
    img: getIcon("conditions", "Encumbered"),
    name: "Heavily Encumbered",
    statuses: [
      "encumbered",
      "slowed",
    ],
  },
  level3: {
    _id: "encumbranceL3000",
    id: "cannotCarryMore",
    img: getIcon("conditions", "Encumbered"),
    name: "Overburdened",
    statuses: [ "immobilized" ],
  },
};
