import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";

export default {
  applicationTargets: {
    actor: { effectType: "consequence", label: "TYPES.Actor.actor" },
    armament: { effectType: "imbuement", label: "TERIOCK.CHANGES.Targets.armament" },
    item: { effectType: "imbuement", label: "TERIOCK.CHANGES.Targets.items" },
  },
  cover: ["halfCover", "threeQuartersCover", "fullCover"],
  // no sort
  form: /** @enum {Teriock.Config.SubtypeEntry} */ {
    special: { color: colors.palette.purple, icon: icons.form.special, label: "TERIOCK.TERMS.EffectForm.special" },
    normal: { color: colors.palette.green, icon: icons.form.normal, label: "TERIOCK.TERMS.EffectForm.normal" },
    gifted: { color: colors.palette.blue, icon: icons.form.gifted, label: "TERIOCK.TERMS.EffectForm.gifted" },
    echo: { color: colors.palette.orange, icon: icons.form.echo, label: "TERIOCK.TERMS.EffectForm.echo" },
    intrinsic: { color: colors.palette.grey, icon: icons.form.intrinsic, label: "TERIOCK.TERMS.EffectForm.intrinsic" },
    flaw: { color: colors.palette.red, icon: icons.form.flaw, label: "TERIOCK.TERMS.EffectForm.flaw" },
  },
};

preLocalizeConfig("config.effect.applicationTargets", { key: "label" });
preLocalizeConfig("config.effect.form", { key: "label" });
