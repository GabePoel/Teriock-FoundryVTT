import { getImage } from "../../helpers/path.mjs";
import { completeUtilityStatuses } from "../../helpers/utils.mjs";

const transformationsData = {
  fullTransformed: {
    id: "fullTransformed",
    img: getImage("conditions", "Transformed"),
    name: "TERIOCK.STATUSES.Transformations.fullTransformed",
    statuses: ["transformed"],
  },
  greaterTransformed: {
    id: "greaterTransformed",
    img: getImage("conditions", "Transformed"),
    name: "TERIOCK.STATUSES.Transformations.greaterTransformed",
    statuses: ["transformed"],
  },
  illusionTransformed: {
    id: "illusionTransformed",
    img: getImage("abilities", "Illusionary Arts"),
    name: "TERIOCK.STATUSES.Transformations.illusionTransformed",
  },
  minorTransformed: {
    id: "minorTransformed",
    img: getImage("conditions", "Transformed"),
    name: "TERIOCK.STATUSES.Transformations.minorTransformed",
    statuses: ["transformed"],
  },
  polymorphed: {
    id: "polymorphed",
    img: getImage("abilities", "Polymorph"),
    name: "TERIOCK.STATUSES.Transformations.polymorphed",
    statuses: ["fullTransformed", "transformed"],
  },
  treeformed: {
    changes: [
      {
        key: "tokenOverrides.ring.enabled",
        priority: 20,
        type: "override",
        value: "true",
      },
      {
        key: "tokenOverrides.ring.subject.texture",
        priority: 20,
        type: "override",
        value: "icons/environment/wilderness/tree-ash.webp",
      },
    ],
    id: "treeformed",
    img: getImage("abilities", "Treeform Ball"),
    name: "TERIOCK.STATUSES.Transformations.treeformed",
    statuses: ["minorTransformed", "transformed"],
  },
};

completeUtilityStatuses(transformationsData);
export default transformationsData;
