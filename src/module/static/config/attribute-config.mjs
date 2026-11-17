import { preLocalizeObject } from "../../helpers/localization.mjs";
import { icons, thumbnails } from "../display/_module.mjs";

export default {
  int: {
    abbreviation: "TERIOCK.TERMS.Attributes.int.abbreviation",
    icon: icons.manifest.attribute.int,
    identifier: "core:intelligence",
    img: thumbnails.manifest.attribute.intelligence,
    label: "TERIOCK.TERMS.Attributes.int.label",
    morphReset: { initial: false },
  },
  mov: {
    abbreviation: "TERIOCK.TERMS.Attributes.mov.abbreviation",
    icon: icons.manifest.attribute.mov,
    identifier: "core:movement",
    img: thumbnails.manifest.attribute.movement,
    label: "TERIOCK.TERMS.Attributes.mov.label",
    morphReset: { initial: true },
  },
  per: {
    abbreviation: "TERIOCK.TERMS.Attributes.per.abbreviation",
    command: "perceive",
    icon: icons.manifest.attribute.per,
    identifier: "core:perception",
    img: thumbnails.manifest.attribute.perception,
    label: "TERIOCK.TERMS.Attributes.per.label",
    morphReset: { initial: true },
  },
  snk: {
    abbreviation: "TERIOCK.TERMS.Attributes.snk.abbreviation",
    command: "hide",
    icon: icons.manifest.attribute.snk,
    identifier: "core:sneak",
    img: thumbnails.manifest.attribute.sneak,
    label: "TERIOCK.TERMS.Attributes.snk.label",
    morphReset: { initial: true },
  },
  str: {
    abbreviation: "TERIOCK.TERMS.Attributes.str.abbreviation",
    icon: icons.manifest.attribute.str,
    identifier: "core:strength",
    img: thumbnails.manifest.attribute.strength,
    label: "TERIOCK.TERMS.Attributes.str.label",
    morphReset: { initial: true },
  },
  unp: {
    abbreviation: "TERIOCK.TERMS.Attributes.unp.abbreviation",
    icon: icons.manifest.attribute.unp,
    identifier: "core:presence",
    img: thumbnails.manifest.attribute.unusedPresence,
    label: "TERIOCK.TERMS.Attributes.unp.label",
    morphReset: { initial: true },
    notImprovable: true,
  },
};

preLocalizeObject("CONFIG.attribute", {
  key: "abbreviation",
  keys: ["label", "abbreviation"],
  last: "unp",
  sort: true,
});
