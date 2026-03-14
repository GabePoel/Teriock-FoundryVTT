import { getImage } from "../../helpers/path.mjs";
import { completeUtilityStatuses } from "../../helpers/utils.mjs";

const coverData = {
  cover1: {
    changes: [
      {
        key: "system.cover",
        priority: 5,
        type: "upgrade",
        value: "1",
      },
    ],
    id: "halfCover",
    img: getImage("cover", "Half Cover"),
    name: "TERIOCK.STATUSES.Cover.halfCover",
  },
  cover2: {
    changes: [
      {
        key: "system.cover",
        priority: 5,
        type: "upgrade",
        value: "2",
      },
    ],
    id: "threeQuartersCover",
    img: getImage("cover", "Three-Quarters Cover"),
    name: "TERIOCK.STATUSES.Cover.threeQuartersCover",
  },
  cover3: {
    changes: [
      {
        key: "system.cover",
        priority: 5,
        type: "upgrade",
        value: "3",
      },
    ],
    id: "fullCover",
    img: getImage("cover", "Full Cover"),
    name: "TERIOCK.STATUSES.Cover.fullCover",
  },
};

completeUtilityStatuses(coverData);
export default coverData;
