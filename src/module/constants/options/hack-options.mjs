import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

/**
 * Hack button definitions.
 * @type {Record<Teriock.Parameters.Actor.HackableBodyPart, Teriock.Config.HackConfig>}
 */
export const hackOptions = {
  arm: {
    icon: icons.hack.arm,
    label: "TERIOCK.EFFECTS.Hacks.arm.apply",
    max: 2,
    remove: "TERIOCK.EFFECTS.Hacks.arm.remove",
  },
  leg: {
    icon: icons.hack.leg,
    label: "TERIOCK.EFFECTS.Hacks.leg.apply",
    max: 2,
    remove: "TERIOCK.EFFECTS.Hacks.leg.remove",
  },
  body: {
    icon: icons.hack.body,
    label: "TERIOCK.EFFECTS.Hacks.body.apply",
    max: 1,
    remove: "TERIOCK.EFFECTS.Hacks.body.remove",
  },
  eye: {
    icon: icons.hack.eye,
    label: "TERIOCK.EFFECTS.Hacks.eye.apply",
    max: 1,
    remove: "TERIOCK.EFFECTS.Hacks.eye.remove",
  },
  ear: {
    icon: icons.hack.ear,
    label: "TERIOCK.EFFECTS.Hacks.ear.apply",
    max: 1,
    remove: "TERIOCK.EFFECTS.Hacks.ear.remove",
  },
  mouth: {
    icon: icons.hack.mouth,
    label: "TERIOCK.EFFECTS.Hacks.mouth.apply",
    max: 1,
    remove: "TERIOCK.EFFECTS.Hacks.mouth.remove",
  },
  nose: {
    icon: icons.hack.nose,
    label: "TERIOCK.EFFECTS.Hacks.nose.apply",
    max: 1,
    remove: "TERIOCK.EFFECTS.Hacks.nose.remove",
  },
};

preLocalize("options.hack", { keys: ["label", "remove"] });
