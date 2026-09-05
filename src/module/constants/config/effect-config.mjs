import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors, icons } from "../display/_module.mjs";
import systemConfig from "./system-config.mjs";

export default {
  applicationTargets: {
    actor: { effectType: "consequence", label: "DOCUMENT.Actors" },
    armament: { effectType: "imbuement", label: "TERIOCK.DOCUMENTS.armament.plural" },
    item: { effectType: "imbuement", label: "DOCUMENT.Items" },
  },
  cover: ["halfCover", "threeQuartersCover", "fullCover"],
  // no sort
  kind: /** @enum {Teriock.Config.KindEntry} */ {
    special: {
      color: colors.palette.purple,
      icon: icons.manifest.form.special,
      label: "TERIOCK.TERMS.EffectKind.special",
    },
    normal: { color: colors.palette.green, icon: icons.manifest.form.normal, label: "TERIOCK.TERMS.EffectKind.normal" },
    gifted: { color: colors.palette.blue, icon: icons.manifest.form.gifted, label: "TERIOCK.TERMS.EffectKind.gifted" },
    echo: { color: colors.palette.orange, icon: icons.manifest.form.echo, label: "TERIOCK.TERMS.EffectKind.echo" },
    intrinsic: {
      color: colors.palette.grey,
      icon: icons.manifest.form.intrinsic,
      label: "TERIOCK.TERMS.EffectKind.intrinsic",
    },
    ...systemConfig.childKinds,
  },
};

preLocalizeConfig("config.effect.applicationTargets", { key: "label" });
preLocalizeConfig("config.effect.kind", { key: "label" });
