import { preLocalize } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";

export const effectOptions = {
  applicationTargets: {
    actor: {
      effectType: "consequence",
      label: "TYPES.Actor.actor",
    },
    armament: {
      effectType: "imbuement",
      label: "TERIOCK.CHANGES.Targets.armament",
    },
  },
  cover: ["halfCover", "threeQuartersCover", "fullCover"],
  form: {
    special: {
      label: "TERIOCK.TERMS.EffectForm.special",
      icon: icons.form.special,
      color: colors.purple,
    },
    normal: {
      label: "TERIOCK.TERMS.EffectForm.normal",
      icon: icons.form.normal,
      color: colors.green,
    },
    gifted: {
      label: "TERIOCK.TERMS.EffectForm.gifted",
      icon: icons.form.gifted,
      color: colors.blue,
    },
    echo: {
      label: "TERIOCK.TERMS.EffectForm.echo",
      icon: icons.form.echo,
      color: colors.orange,
    },
    intrinsic: {
      label: "TERIOCK.TERMS.EffectForm.intrinsic",
      icon: icons.form.intrinsic,
      color: colors.grey,
    },
    flaw: {
      label: "TERIOCK.TERMS.EffectForm.flaw",
      icon: icons.form.flaw,
      color: colors.red,
    },
  },
};

preLocalize("options.effect.applicationTargets", { key: "label" });
preLocalize("options.effect.form", { key: "label" });
