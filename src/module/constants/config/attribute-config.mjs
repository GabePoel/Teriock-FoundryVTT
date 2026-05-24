import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export const attributeConfig = {
  int: {
    icon: icons.attribute.int,
    identifier: "core:intelligence",
    label: "TERIOCK.TERMS.Attributes.int.label",
    name: "TERIOCK.TERMS.Attributes.int.name",
  },
  mov: {
    icon: icons.attribute.mov,
    identifier: "core:movement",
    label: "TERIOCK.TERMS.Attributes.mov.label",
    name: "TERIOCK.TERMS.Attributes.mov.name",
  },
  per: {
    icon: icons.attribute.per,
    identifier: "core:perception",
    label: "TERIOCK.TERMS.Attributes.per.label",
    name: "TERIOCK.TERMS.Attributes.per.name",
  },
  snk: {
    icon: icons.attribute.snk,
    identifier: "core:sneak",
    label: "TERIOCK.TERMS.Attributes.snk.label",
    name: "TERIOCK.TERMS.Attributes.snk.name",
  },
  str: {
    icon: icons.attribute.str,
    identifier: "core:strength",
    label: "TERIOCK.TERMS.Attributes.str.label",
    name: "TERIOCK.TERMS.Attributes.str.name",
  },
  unp: {
    icon: icons.attribute.unp,
    identifier: "core:presence",
    label: "TERIOCK.TERMS.Attributes.unp.label",
    name: "TERIOCK.TERMS.Attributes.unp.name",
  },
};

preLocalize("config.attribute", { keys: ["label", "name", "passive"], sort: true });
