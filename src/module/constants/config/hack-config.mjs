import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

/** @enum {Teriock.Config.HackEntry} */
export default {
  arm: {
    icon: icons.hack.arm,
    label: "TERIOCK.EFFECTS.Hacks.arm.apply",
    max: 2,
    part: "TERIOCK.EFFECTS.Hacks.arm.part",
    remove: "TERIOCK.EFFECTS.Hacks.arm.remove",
    statuses: ["armHack1", "armHack2"],
  },
  leg: {
    icon: icons.hack.leg,
    label: "TERIOCK.EFFECTS.Hacks.leg.apply",
    max: 2,
    part: "TERIOCK.EFFECTS.Hacks.leg.part",
    remove: "TERIOCK.EFFECTS.Hacks.leg.remove",
    statuses: ["legHack1", "legHack2"],
  },

  body: {
    icon: icons.hack.body,
    label: "TERIOCK.EFFECTS.Hacks.body.apply",
    max: 1,
    part: "TERIOCK.EFFECTS.Hacks.body.part",
    remove: "TERIOCK.EFFECTS.Hacks.body.remove",
    statuses: ["bodyHack"],
  },

  ear: {
    icon: icons.hack.ear,
    label: "TERIOCK.EFFECTS.Hacks.ear.apply",
    max: 1,
    part: "TERIOCK.EFFECTS.Hacks.ear.part",
    remove: "TERIOCK.EFFECTS.Hacks.ear.remove",
    statuses: ["earHack"],
  },
  eye: {
    icon: icons.hack.eye,
    label: "TERIOCK.EFFECTS.Hacks.eye.apply",
    max: 1,
    part: "TERIOCK.EFFECTS.Hacks.eye.part",
    remove: "TERIOCK.EFFECTS.Hacks.eye.remove",
    statuses: ["eyeHack"],
  },
  mouth: {
    icon: icons.hack.mouth,
    label: "TERIOCK.EFFECTS.Hacks.mouth.apply",
    max: 1,
    part: "TERIOCK.EFFECTS.Hacks.mouth.part",
    remove: "TERIOCK.EFFECTS.Hacks.mouth.remove",
    statuses: ["mouthHack"],
  },
  nose: {
    icon: icons.hack.nose,
    label: "TERIOCK.EFFECTS.Hacks.nose.apply",
    max: 1,
    part: "TERIOCK.EFFECTS.Hacks.nose.part",
    remove: "TERIOCK.EFFECTS.Hacks.nose.remove",
    statuses: ["noseHack"],
  },
};

preLocalizeConfig("config.hack", { keys: ["label", "part", "remove"] });
