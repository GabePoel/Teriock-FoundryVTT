import { getIcon } from "../../helpers/path.mjs";

export const hacksData = {
  arm1: {
    _id: "armHack100000000",
    id: "armHack1",
    img: getIcon("hacks", "1st Arm Hack"),
    name: "1st Arm Hack",
    statuses: [ "hacked" ],
  },
  arm2: {
    _id: "armHack200000000",
    id: "armHack2",
    img: getIcon("hacks", "2nd Arm Hack"),
    name: "2nd Arm Hack",
    statuses: [ "hacked" ],
  },
  body1: {
    _id: "bodyHack00000000",
    id: "bodyHack",
    img: getIcon("hacks", "Body Hack"),
    name: "Body Hack",
    statuses: [
      "hacked",
      "immobilized",
    ],
  },
  ear1: {
    _id: "earHack000000000",
    id: "earHack",
    img: getIcon("hacks", "Ear Hack"),
    name: "Ear Hack",
    statuses: [
      "deaf",
      "hacked",
    ],
  },
  eye1: {
    _id: "eyeHack000000000",
    id: "eyeHack",
    img: getIcon("hacks", "Eye Hack"),
    name: "Eye Hack",
    statuses: [
      "blind",
      "hacked",
    ],
  },
  leg1: {
    _id: "legHack100000000",
    id: "legHack1",
    img: getIcon("hacks", "1st Leg Hack"),
    name: "1st Leg Hack",
    statuses: [
      "hacked",
      "slowed",
    ],
  },
  leg2: {
    _id: "legHack200000000",
    id: "legHack2",
    img: getIcon("hacks", "2nd Leg Hack"),
    name: "2nd Leg Hack",
    statuses: [
      "hacked",
      "immobilized",
    ],
  },
  mouth1: {
    _id: "mouthHack0000000",
    id: "mouthHack",
    img: getIcon("hacks", "Mouth Hack"),
    name: "Mouth Hack",
    statuses: [
      "hacked",
      "mute",
    ],
  },
  nose1: {
    _id: "noseHack00000000",
    id: "noseHack",
    img: getIcon("hacks", "Nose Hack"),
    name: "Nose Hack",
    statuses: [
      "hacked",
      "anosmatic",
    ],
  },
};
