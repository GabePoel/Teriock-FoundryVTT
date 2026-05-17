import { preLocalize } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";

export const effectConfig = {
  applicationTargets: {
    actor: {
      effectType: "consequence",
      label: "TYPES.Actor.actor",
    },
    armament: {
      effectType: "imbuement",
      label: "TERIOCK.CHANGES.Targets.armament",
    },
    item: {
      effectType: "imbuement",
      label: "TERIOCK.CHANGES.Targets.items",
    },
  },
  cover: ["halfCover", "threeQuartersCover", "fullCover"],
  // no sort
  form: /** @enum {Teriock.Config.SubtypeEntry} */ {
    special: {
      color: colors.purple,
      icon: icons.form.special,
      label: "TERIOCK.TERMS.EffectForm.special",
    },
    normal: {
      color: colors.green,
      icon: icons.form.normal,
      label: "TERIOCK.TERMS.EffectForm.normal",
    },
    gifted: {
      color: colors.blue,
      icon: icons.form.gifted,
      label: "TERIOCK.TERMS.EffectForm.gifted",
    },
    echo: {
      color: colors.orange,
      icon: icons.form.echo,
      label: "TERIOCK.TERMS.EffectForm.echo",
    },
    intrinsic: {
      color: colors.grey,
      icon: icons.form.intrinsic,
      label: "TERIOCK.TERMS.EffectForm.intrinsic",
    },
    flaw: {
      color: colors.red,
      icon: icons.form.flaw,
      label: "TERIOCK.TERMS.EffectForm.flaw",
    },
  },
};

preLocalize("config.effect.applicationTargets", { key: "label" });
preLocalize("config.effect.form", { key: "label" });
