import { getImage } from "../../helpers/path.mjs";
import { completeUtilityStatuses } from "../../helpers/utils.mjs";

const hacksData = {
  arm1: {
    changes: [
      {
        key: "system.hacks.arm.value",
        priority: 5,
        type: "upgrade",
        value: "1",
      },
    ],
    id: "armHack1",
    img: getImage("hacks", "1st Arm Hack"),
    name: "TERIOCK.STATUSES.Hacks.armHack1",
    statuses: ["hacked"],
  },
  arm2: {
    changes: [
      {
        key: "system.hacks.arm.value",
        priority: 5,
        type: "upgrade",
        value: "2",
      },
    ],
    id: "armHack2",
    img: getImage("hacks", "2nd Arm Hack"),
    name: "TERIOCK.STATUSES.Hacks.armHack2",
    statuses: ["hacked"],
  },
  body1: {
    changes: [
      {
        key: "system.hacks.body.value",
        priority: 5,
        type: "upgrade",
        value: "1",
      },
    ],
    id: "bodyHack",
    img: getImage("hacks", "Body Hack"),
    name: "TERIOCK.STATUSES.Hacks.bodyHack",
    statuses: ["hacked", "immobilized"],
  },
  ear1: {
    changes: [
      {
        key: "system.hacks.ear.value",
        priority: 5,
        type: "upgrade",
        value: "1",
      },
    ],
    id: "earHack",
    img: getImage("hacks", "Ear Hack"),
    name: "TERIOCK.STATUSES.Hacks.earHack",
    statuses: ["deaf", "hacked"],
  },
  eye1: {
    changes: [
      {
        key: "system.hacks.eye.value",
        priority: 5,
        type: "upgrade",
        value: "1",
      },
    ],
    id: "eyeHack",
    img: getImage("hacks", "Eye Hack"),
    name: "TERIOCK.STATUSES.Hacks.eyeHack",
    statuses: ["blind", "hacked"],
  },
  leg1: {
    changes: [
      {
        key: "system.hacks.leg.value",
        priority: 5,
        type: "upgrade",
        value: "1",
      },
    ],
    id: "legHack1",
    img: getImage("hacks", "1st Leg Hack"),
    name: "TERIOCK.STATUSES.Hacks.legHack1",
    statuses: ["hacked", "slowed"],
  },
  leg2: {
    changes: [
      {
        key: "system.hacks.leg.value",
        priority: 5,
        type: "upgrade",
        value: "2",
      },
    ],
    id: "legHack2",
    img: getImage("hacks", "2nd Leg Hack"),
    name: "TERIOCK.STATUSES.Hacks.legHack2",
    statuses: ["hacked", "immobilized"],
  },
  mouth1: {
    changes: [
      {
        key: "system.hacks.mouth.value",
        priority: 5,
        type: "upgrade",
        value: "1",
      },
    ],
    id: "mouthHack",
    img: getImage("hacks", "Mouth Hack"),
    name: "TERIOCK.STATUSES.Hacks.mouthHack",
    statuses: ["hacked", "mute"],
  },
  nose1: {
    changes: [
      {
        key: "system.hacks.nose.value",
        priority: 5,
        type: "upgrade",
        value: "1",
      },
    ],
    id: "noseHack",
    img: getImage("hacks", "Nose Hack"),
    name: "TERIOCK.STATUSES.Hacks.noseHack",
    statuses: ["hacked", "anosmatic"],
  },
};

completeUtilityStatuses(hacksData);
export default hacksData;
