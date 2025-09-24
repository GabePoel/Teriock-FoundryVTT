import { getIcon } from "../../helpers/path.mjs";

export const hacksData = {
  arm1: {
    _id: "armHack100000000",
    id: "armHack1",
    img: getIcon("hacks", "1st Arm Hack"),
    name: "1st Arm Hack",
    statuses: ["hacked"],
    hud: false,
    changes: [
      {
        key: "system.hacks.arm.value",
        value: "1",
        mode: 4,
        priority: 5,
      },
    ],
  },
  arm2: {
    _id: "armHack200000000",
    id: "armHack2",
    img: getIcon("hacks", "2nd Arm Hack"),
    name: "2nd Arm Hack",
    statuses: ["hacked"],
    hud: false,
    changes: [
      {
        key: "system.hacks.arm.value",
        value: "2",
        mode: 4,
        priority: 5,
      },
    ],
  },
  body1: {
    _id: "bodyHack00000000",
    id: "bodyHack",
    img: getIcon("hacks", "Body Hack"),
    name: "Body Hack",
    statuses: ["hacked", "immobilized"],
    hud: false,
    changes: [
      {
        key: "system.hacks.body.value",
        value: "1",
        mode: 4,
        priority: 5,
      },
    ],
  },
  ear1: {
    _id: "earHack000000000",
    id: "earHack",
    img: getIcon("hacks", "Ear Hack"),
    name: "Ear Hack",
    statuses: ["deaf", "hacked"],
    hud: false,
    changes: [
      {
        key: "system.hacks.ear.value",
        value: "1",
        mode: 4,
        priority: 5,
      },
    ],
  },
  eye1: {
    _id: "eyeHack000000000",
    id: "eyeHack",
    img: getIcon("hacks", "Eye Hack"),
    name: "Eye Hack",
    statuses: ["blind", "hacked"],
    hud: false,
    changes: [
      {
        key: "system.hacks.eye.value",
        value: "1",
        mode: 4,
        priority: 5,
      },
    ],
  },
  leg1: {
    _id: "legHack100000000",
    id: "legHack1",
    img: getIcon("hacks", "1st Leg Hack"),
    name: "1st Leg Hack",
    statuses: ["hacked", "slowed"],
    hud: false,
    changes: [
      {
        key: "system.hacks.leg.value",
        value: "1",
        mode: 4,
        priority: 5,
      },
    ],
  },
  leg2: {
    _id: "legHack200000000",
    id: "legHack2",
    img: getIcon("hacks", "2nd Leg Hack"),
    name: "2nd Leg Hack",
    statuses: ["hacked", "immobilized"],
    hud: false,
    changes: [
      {
        key: "system.hacks.leg.value",
        value: "1",
        mode: 2,
        priority: 5,
      },
    ],
  },
  mouth1: {
    _id: "mouthHack0000000",
    id: "mouthHack",
    img: getIcon("hacks", "Mouth Hack"),
    name: "Mouth Hack",
    statuses: ["hacked", "mute"],
    hud: false,
    changes: [
      {
        key: "system.hacks.mouth.value",
        value: "1",
        mode: 4,
        priority: 5,
      },
    ],
  },
  nose1: {
    _id: "noseHack00000000",
    id: "noseHack",
    img: getIcon("hacks", "Nose Hack"),
    name: "Nose Hack",
    statuses: ["hacked", "anosmatic"],
    hud: false,
    changes: [
      {
        key: "system.hacks.nose.value",
        value: "1",
        mode: 4,
        priority: 5,
      },
    ],
  },
};
