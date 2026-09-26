import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons, thumbnails } from "../display/_module.mjs";

export default {
  int: {
    abbreviation: "TERIOCK.TERMS.Attributes.int.abbreviation",
    icon: icons.manifest.attribute.int,
    identifier: "core:intelligence",
    img: thumbnails.manifest.attribute.intelligence,
    label: "TERIOCK.TERMS.Attributes.int.label",
  },
  mov: {
    abbreviation: "TERIOCK.TERMS.Attributes.mov.abbreviation",
    icon: icons.manifest.attribute.mov,
    identifier: "core:movement",
    img: thumbnails.manifest.attribute.movement,
    label: "TERIOCK.TERMS.Attributes.mov.label",
  },
  per: {
    abbreviation: "TERIOCK.TERMS.Attributes.per.abbreviation",
    icon: icons.manifest.attribute.per,
    identifier: "core:perception",
    img: thumbnails.manifest.attribute.perception,
    impact: "perceive",
    label: "TERIOCK.TERMS.Attributes.per.label",
  },
  snk: {
    abbreviation: "TERIOCK.TERMS.Attributes.snk.abbreviation",
    icon: icons.manifest.attribute.snk,
    identifier: "core:sneak",
    img: thumbnails.manifest.attribute.sneak,
    impact: "hide",
    label: "TERIOCK.TERMS.Attributes.snk.label",
  },
  str: {
    abbreviation: "TERIOCK.TERMS.Attributes.str.abbreviation",
    icon: icons.manifest.attribute.str,
    identifier: "core:strength",
    img: thumbnails.manifest.attribute.strength,
    label: "TERIOCK.TERMS.Attributes.str.label",
  },
  unp: {
    abbreviation: "TERIOCK.TERMS.Attributes.unp.abbreviation",
    icon: icons.manifest.attribute.unp,
    identifier: "core:presence",
    img: thumbnails.manifest.attribute.unusedPresence,
    label: "TERIOCK.TERMS.Attributes.unp.label",
    notImprovable: true,
  },
};

preLocalizeConfig("config.attribute", { keys: ["label", "abbreviation"], sort: true });
