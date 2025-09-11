import { getIcon } from "../../helpers/path.mjs";

export const hacksData = {
  arm1: {
    name: "1st Arm Hack",
    img: getIcon("hacks", "1st Arm Hack"),
    id: "armHack1",
    _id: "armHack100000000",
    statuses: [ "hacked" ],
  },
  arm2: {
    name: "2nd Arm Hack",
    img: getIcon("hacks", "2nd Arm Hack"),
    id: "armHack2",
    _id: "armHack200000000",
    statuses: [ "hacked" ],
  },
  leg1: {
    name: "1st Leg Hack",
    img: getIcon("hacks", "1st Leg Hack"),
    id: "legHack1",
    _id: "legHack100000000",
    statuses: [
      "hacked",
      "slowed",
    ],
  },
  leg2: {
    name: "2nd Leg Hack",
    img: getIcon("hacks", "2nd Leg Hack"),
    id: "legHack2",
    _id: "legHack200000000",
    statuses: [
      "hacked",
      "immobilized",
    ],
  },
  ear1: {
    name: "Ear Hack",
    img: getIcon("hacks", "Ear Hack"),
    id: "earHack",
    _id: "earHack000000000",
    statuses: [
      "hacked",
      "deaf",
    ],
  },
  eye1: {
    name: "Eye Hack",
    img: getIcon("hacks", "Eye Hack"),
    id: "eyeHack",
    _id: "eyeHack000000000",
    statuses: [
      "hacked",
      "blind",
    ],
  },
  nose1: {
    name: "Nose Hack",
    img: getIcon("hacks", "Nose Hack"),
    id: "noseHack",
    _id: "noseHack00000000",
    statuses: [
      "hacked",
      "anosmatic",
    ],
  },
  mouth1: {
    name: "Mouth Hack",
    img: getIcon("hacks", "Mouth Hack"),
    id: "mouthHack",
    _id: "mouthHack0000000",
    statuses: [
      "hacked",
      "mute",
    ],
  },
  body1: {
    name: "Body Hack",
    img: getIcon("hacks", "Body Hack"),
    id: "bodyHack",
    _id: "bodyHack00000000",
    statuses: [
      "hacked",
      "immobilized",
    ],
  },
};
