import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";
import systemConfig from "./system-config.mjs";

export default {
  applicationTargets: {
    actor: { effectType: "consequence", label: "TYPES.Actor.actor" },
    armament: { effectType: "imbuement", label: "TERIOCK.DOCUMENTS.armament.plural" },
    item: { effectType: "imbuement", label: "DOCUMENT.Items" },
  },
  cover: ["halfCover", "threeQuartersCover", "fullCover"],
  // no sort
  kind: /** @enum {Teriock.Config.KindEntry} */ {
    special: { color: colors.palette.purple, icon: icons.form.special, label: "TERIOCK.TERMS.EffectKind.special" },
    normal: { color: colors.palette.green, icon: icons.form.normal, label: "TERIOCK.TERMS.EffectKind.normal" },
    gifted: { color: colors.palette.blue, icon: icons.form.gifted, label: "TERIOCK.TERMS.EffectKind.gifted" },
    echo: { color: colors.palette.orange, icon: icons.form.echo, label: "TERIOCK.TERMS.EffectKind.echo" },
    intrinsic: { color: colors.palette.grey, icon: icons.form.intrinsic, label: "TERIOCK.TERMS.EffectKind.intrinsic" },
    ...systemConfig.childKinds,
  },
};

preLocalizeConfig("config.effect.applicationTargets", { key: "label" });
preLocalizeConfig("config.effect.kind", { key: "label" });
