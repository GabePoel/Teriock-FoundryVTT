import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export default {
  int: {
    abbreviation: "TERIOCK.TERMS.Attributes.int.abbreviation",
    icon: icons.attribute.int,
    identifier: "core:intelligence",
    label: "TERIOCK.TERMS.Attributes.int.label",
  },
  mov: {
    abbreviation: "TERIOCK.TERMS.Attributes.mov.abbreviation",
    icon: icons.attribute.mov,
    identifier: "core:movement",
    label: "TERIOCK.TERMS.Attributes.mov.label",
  },
  per: {
    abbreviation: "TERIOCK.TERMS.Attributes.per.abbreviation",
    icon: icons.attribute.per,
    identifier: "core:perception",
    impact: "perceive",
    label: "TERIOCK.TERMS.Attributes.per.label",
  },
  snk: {
    abbreviation: "TERIOCK.TERMS.Attributes.snk.abbreviation",
    icon: icons.attribute.snk,
    identifier: "core:sneak",
    impact: "hide",
    label: "TERIOCK.TERMS.Attributes.snk.label",
  },
  str: {
    abbreviation: "TERIOCK.TERMS.Attributes.str.abbreviation",
    icon: icons.attribute.str,
    identifier: "core:strength",
    label: "TERIOCK.TERMS.Attributes.str.label",
  },
  unp: {
    abbreviation: "TERIOCK.TERMS.Attributes.unp.abbreviation",
    icon: icons.attribute.unp,
    identifier: "core:presence",
    label: "TERIOCK.TERMS.Attributes.unp.label",
    notImprovable: true,
  },
};

preLocalizeConfig("config.attribute", { keys: ["label", "abbreviation"], sort: true });
