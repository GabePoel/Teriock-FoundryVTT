import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/_module.mjs";

/** @enum {Teriock.Config.HackEntry} */
export default {
  arm: {
    icon: icons.manifest.hack.arm,
    label: "TERIOCK.EFFECTS.Hacks.arm.apply",
    max: 2,
    part: "TERIOCK.EFFECTS.Hacks.arm.part",
    remove: "TERIOCK.EFFECTS.Hacks.arm.remove",
    statuses: ["arm-hack-1", "arm-hack-2"],
  },
  leg: {
    icon: icons.manifest.hack.leg,
    label: "TERIOCK.EFFECTS.Hacks.leg.apply",
    max: 2,
    part: "TERIOCK.EFFECTS.Hacks.leg.part",
    remove: "TERIOCK.EFFECTS.Hacks.leg.remove",
    statuses: ["leg-hack-1", "leg-hack-2"],
  },

  body: {
    icon: icons.manifest.hack.body,
    label: "TERIOCK.EFFECTS.Hacks.body.apply",
    max: 1,
    part: "TERIOCK.EFFECTS.Hacks.body.part",
    remove: "TERIOCK.EFFECTS.Hacks.body.remove",
    statuses: ["body-hack"],
  },

  ear: {
    icon: icons.manifest.hack.ear,
    label: "TERIOCK.EFFECTS.Hacks.ear.apply",
    max: 1,
    part: "TERIOCK.EFFECTS.Hacks.ear.part",
    remove: "TERIOCK.EFFECTS.Hacks.ear.remove",
    statuses: ["ear-hack"],
  },
  eye: {
    icon: icons.manifest.hack.eye,
    label: "TERIOCK.EFFECTS.Hacks.eye.apply",
    max: 1,
    part: "TERIOCK.EFFECTS.Hacks.eye.part",
    remove: "TERIOCK.EFFECTS.Hacks.eye.remove",
    statuses: ["eye-hack"],
  },
  mouth: {
    icon: icons.manifest.hack.mouth,
    label: "TERIOCK.EFFECTS.Hacks.mouth.apply",
    max: 1,
    part: "TERIOCK.EFFECTS.Hacks.mouth.part",
    remove: "TERIOCK.EFFECTS.Hacks.mouth.remove",
    statuses: ["mouth-hack"],
  },
  nose: {
    icon: icons.manifest.hack.nose,
    label: "TERIOCK.EFFECTS.Hacks.nose.apply",
    max: 1,
    part: "TERIOCK.EFFECTS.Hacks.nose.part",
    remove: "TERIOCK.EFFECTS.Hacks.nose.remove",
    statuses: ["nose-hack"],
  },
};

preLocalizeConfig("config.hack", { keys: ["label", "part", "remove"] });
