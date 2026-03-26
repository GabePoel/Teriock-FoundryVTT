import { preLocalize } from "../../helpers/localization.mjs";

export const transformationOptions = {
  level: {
    minor: "TERIOCK.EFFECTS.TransformationLevel.minor",
    full: "TERIOCK.EFFECTS.TransformationLevel.full",
    greater: "TERIOCK.EFFECTS.TransformationLevel.greater",
  },
  reset: {
    hp: {
      initial: true,
      path: "system.hp.value",
    },
    mp: {
      initial: false,
      path: "system.mp.value",
    },
  },
  suppress: {
    attunement: {
      initial: false,
      path: "disabled",
    },
    body: {
      initial: true,
      path: "system.disabled",
    },
    consequence: {
      initial: false,
      path: "disabled",
    },
    equipment: {
      initial: true,
      path: "system.stashed",
    },
    fluency: {
      initial: true,
      path: "system.disabled",
    },
    mount: {
      initial: false,
      path: "system.disabled",
    },
    rank: {
      initial: true,
      path: "system.disabled",
    },
    resource: {
      initial: false,
      path: "system.disabled",
    },
    species: {
      initial: true,
      path: "system.disabled",
    },
  },
};

preLocalize("options.transformation.level");
