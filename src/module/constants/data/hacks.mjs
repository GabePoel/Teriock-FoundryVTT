import { getImage } from "../../helpers/path.mjs";

export const hacksData = {
  arm1: {
    _id: "armHack100000000",
    id: "armHack1",
    img: getImage("hacks", "1st Arm Hack"),
    name: "TERIOCK.STATUSES.Hacks.armHack1",
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
    img: getImage("hacks", "2nd Arm Hack"),
    name: "TERIOCK.STATUSES.Hacks.armHack2",
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
    img: getImage("hacks", "Body Hack"),
    name: "TERIOCK.STATUSES.Hacks.bodyHack",
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
    img: getImage("hacks", "Ear Hack"),
    name: "TERIOCK.STATUSES.Hacks.earHack",
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
    img: getImage("hacks", "Eye Hack"),
    name: "TERIOCK.STATUSES.Hacks.eyeHack",
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
    img: getImage("hacks", "1st Leg Hack"),
    name: "TERIOCK.STATUSES.Hacks.legHack1",
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
    img: getImage("hacks", "2nd Leg Hack"),
    name: "TERIOCK.STATUSES.Hacks.legHack2",
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
    img: getImage("hacks", "Mouth Hack"),
    name: "TERIOCK.STATUSES.Hacks.mouthHack",
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
    img: getImage("hacks", "Nose Hack"),
    name: "TERIOCK.STATUSES.Hacks.noseHack",
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
