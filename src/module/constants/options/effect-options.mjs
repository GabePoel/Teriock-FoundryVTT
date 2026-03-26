import { preLocalize } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";

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
  illusionLevel: {
    minor: "TERIOCK.EFFECTS.IllusionLevel.minor",
    full: "TERIOCK.EFFECTS.IllusionLevel.full",
    greater: "TERIOCK.EFFECTS.IllusionLevel.greater",
  },
  form: {
    special: {
      name: "TERIOCK.TERMS.EffectForm.special",
      icon: icons.form.special,
      color: colors.purple,
    },
    normal: {
      name: "TERIOCK.TERMS.EffectForm.normal",
      icon: icons.form.normal,
      color: colors.green,
    },
    gifted: {
      name: "TERIOCK.TERMS.EffectForm.gifted",
      icon: icons.form.gifted,
      color: colors.blue,
    },
    echo: {
      name: "TERIOCK.TERMS.EffectForm.echo",
      icon: icons.form.echo,
      color: colors.orange,
    },
    intrinsic: {
      name: "TERIOCK.TERMS.EffectForm.intrinsic",
      icon: icons.form.intrinsic,
      color: colors.grey,
    },
    flaw: {
      name: "TERIOCK.TERMS.EffectForm.flaw",
      icon: icons.form.flaw,
      color: colors.red,
    },
  },
};

preLocalize("options.effect.simpleChangeMode");
preLocalize("options.effect.foundryChangeMode");
preLocalize("options.effect.changeMode");
preLocalize("options.effect.illusionLevel");
preLocalize("options.effect.form", { key: "name" });
