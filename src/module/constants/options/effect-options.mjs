import { preLocalize } from "../../helpers/localization.mjs";

const simpleChangeMode = {
  2: "EFFECT.MODE_ADD",
  3: "EFFECT.MODE_DOWNGRADE",
  4: "EFFECT.MODE_UPGRADE",
  5: "EFFECT.MODE_OVERRIDE",
};

const foundryChangeMode = {
  1: "EFFECT.MODE_MULTIPLY",
  ...simpleChangeMode,
};

export const effectOptions = {
  simpleChangeMode,
  foundryChangeMode,
  changeMode: {
    0: "TERIOCK.CHANGES.Mode.boost",
    ...foundryChangeMode,
  },
  transformationLevel: {
    minor: "TERIOCK.EFFECTS.TransformationLevel.minor",
    full: "TERIOCK.EFFECTS.TransformationLevel.full",
    greater: "TERIOCK.EFFECTS.TransformationLevel.greater",
  },
  illusionLevel: {
    minor: "TERIOCK.EFFECTS.IllusionLevel.minor",
    full: "TERIOCK.EFFECTS.IllusionLevel.full",
    greater: "TERIOCK.EFFECTS.IllusionLevel.greater",
  },
};

preLocalize("options.effect.simpleChangeMode");
preLocalize("options.effect.foundryChangeMode");
preLocalize("options.effect.changeMode");
preLocalize("options.effect.transformationLevel");
preLocalize("options.effect.illusionLevel");
