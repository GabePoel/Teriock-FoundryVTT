import { getIcon } from "../../helpers/path.mjs";

export const transformationsData = {
  fullTransformed: {
    _id: "fullTransformed0",
    hud: false,
    id: "fullTransformed",
    img: getIcon("conditions", "Transformed"),
    name: "Full Transformed",
    statuses: ["transformed"],
    type: "base",
  },
  greaterTransformed: {
    _id: "greaterTransform",
    hud: false,
    id: "greaterTransformed",
    img: getIcon("conditions", "Transformed"),
    name: "Greater Transformed",
    statuses: ["transformed"],
    type: "base",
  },
  minorTransformed: {
    _id: "minorTransformed",
    hud: false,
    id: "minorTransformed",
    img: getIcon("conditions", "Transformed"),
    name: "Minor Transformed",
    statuses: ["transformed"],
    type: "base",
  },
  polymorphed: {
    _id: "polymorphed00000",
    hud: false,
    id: "polymorphed",
    img: getIcon("abilities", "Polymorph"),
    name: "Polymorphed",
    statuses: ["fullTransformed", "transformed"],
    type: "base",
  },
  treeformed: {
    _id: "treeformed000000",
    changes: [
      {
        key: "system.transformation.img",
        value: "icons/environment/wilderness/tree-ash.webp",
        mode: 5,
        priority: 20,
      },
    ],
    hud: false,
    id: "treeformed",
    img: getIcon("abilities", "Treeform Ball"),
    name: "Treeformed",
    statuses: ["minorTransformed", "transformed"],
    type: "base",
  },
};
