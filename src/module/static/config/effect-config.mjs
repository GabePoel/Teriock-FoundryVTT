import { preLocalizeObject } from "../../helpers/localization.mjs";
import { toId } from "../../utils/_module.mjs";
import { colors, icons } from "../display/_module.mjs";
import * as STATUSES from "../statuses.mjs";
import kindConfig from "./kind-config.mjs";

export default {
  applicationTargets: {
    actor: { effectType: "consequence", label: "DOCUMENT.Actors" },
    armament: { effectType: "imbuement", label: "TERIOCK.DOCUMENTS.Item.armament.plural" },
    item: { effectType: "imbuement", label: "DOCUMENT.Items" },
  },
  common: {
    conditionImmunity: {
      name: "TERIOCK.SYSTEMS.BaseActor.DEFAULTS.conditionImmunity",
      system: {
        affinities: Object.fromEntries(
          Object.keys(STATUSES.conditions).map(
            slug => [toId(slug), { _id: toId(slug), category: "condition", slug, type: "immunity" }]
          ),
        ),
      },
      type: "consequence",
    },
  },
  cover: ["half-cover", "three-quarters-cover", "full-cover"],
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
    ...kindConfig.child,
  },
};

preLocalizeObject("CONFIG.effect.applicationTargets", { key: "label", sort: true });
preLocalizeObject("CONFIG.effect.kind", { key: "label" });
preLocalizeObject("CONFIG.effect.common", { key: "name" });
