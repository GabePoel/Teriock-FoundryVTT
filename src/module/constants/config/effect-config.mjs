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
  form: /** @enum {Teriock.Config.SubtypeEntry} */ {
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

preLocalize("config.effect.applicationTargets", { key: "label" });
preLocalize("config.effect.form", { key: "label" });
