import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

/**
 * Hack button definitions.
 * @type {Record<string, Teriock.UI.ButtonDefinition & { remove: string}>}
 */
export const hackOptions = {
  arm: {
    label: "TERIOCK.EFFECTS.Hacks.arm.apply",
    remove: "TERIOCK.EFFECTS.Hacks.arm.remove",
    icon: icons.hack.arm,
  },
  leg: {
    label: "TERIOCK.EFFECTS.Hacks.leg.apply",
    remove: "TERIOCK.EFFECTS.Hacks.leg.remove",
    icon: icons.hack.leg,
  },
  body: {
    label: "TERIOCK.EFFECTS.Hacks.body.apply",
    remove: "TERIOCK.EFFECTS.Hacks.body.remove",
    icon: icons.hack.body,
  },
  eye: {
    label: "TERIOCK.EFFECTS.Hacks.eye.apply",
    remove: "TERIOCK.EFFECTS.Hacks.eye.remove",
    icon: icons.hack.eye,
  },
  ear: {
    label: "TERIOCK.EFFECTS.Hacks.ear.apply",
    remove: "TERIOCK.EFFECTS.Hacks.ear.remove",
    icon: icons.hack.ear,
  },
  mouth: {
    label: "TERIOCK.EFFECTS.Hacks.mouth.apply",
    remove: "TERIOCK.EFFECTS.Hacks.mouth.remove",
    icon: icons.hack.mouth,
  },
  nose: {
    label: "TERIOCK.EFFECTS.Hacks.nose.apply",
    remove: "TERIOCK.EFFECTS.Hacks.nose.remove",
    icon: icons.hack.nose,
  },
};

preLocalize("options.hack", { keys: ["label", "remove"] });
