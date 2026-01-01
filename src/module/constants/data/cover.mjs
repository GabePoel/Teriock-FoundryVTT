import { getImage } from "../../helpers/path.mjs";

export const coverData = {
  cover1: {
    _id: "halfCover0000000",
    changes: [
      {
        key: "system.cover",
        value: "1",
        mode: 4,
        priority: 5,
      },
    ],
    hud: false,
    id: "halfCover",
    img: getImage("cover", "Half Cover"),
    name: "Half Cover",
  },
  cover2: {
    _id: "threeQuartersCov",
    changes: [
      {
        key: "system.cover",
        value: "2",
        mode: 4,
        priority: 5,
      },
    ],
    hud: false,
    id: "threeQuartersCover",
    img: getImage("cover", "Three-Quarters Cover"),
    name: "Three-Quarters Cover",
  },
  cover3: {
    _id: "fullCover0000000",
    changes: [
      {
        key: "system.cover",
        value: "3",
        mode: 4,
        priority: 5,
      },
    ],
    hud: false,
    id: "fullCover",
    img: getImage("cover", "Full Cover"),
    name: "Full Cover",
  },
};
