import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export const attributeOptions = {
  int: {
    icon: icons.attribute.int,
    label: "TERIOCK.TERMS.Attributes.int.label",
    name: "TERIOCK.TERMS.Attributes.int.name",
    page: "TERIOCK.TERMS.Attributes.int.page",
  },
  mov: {
    icon: icons.attribute.mov,
    label: "TERIOCK.TERMS.Attributes.mov.label",
    name: "TERIOCK.TERMS.Attributes.mov.name",
    page: "TERIOCK.TERMS.Attributes.mov.page",
  },
  per: {
    icon: icons.attribute.per,
    label: "TERIOCK.TERMS.Attributes.per.label",
    name: "TERIOCK.TERMS.Attributes.per.name",
    page: "TERIOCK.TERMS.Attributes.per.page",
  },
  snk: {
    icon: icons.attribute.snk,
    label: "TERIOCK.TERMS.Attributes.snk.label",
    name: "TERIOCK.TERMS.Attributes.snk.name",
    page: "TERIOCK.TERMS.Attributes.snk.page",
  },
  str: {
    icon: icons.attribute.str,
    label: "TERIOCK.TERMS.Attributes.str.label",
    name: "TERIOCK.TERMS.Attributes.str.name",
    page: "TERIOCK.TERMS.Attributes.str.page",
  },
  unp: {
    icon: icons.attribute.unp,
    label: "TERIOCK.TERMS.Attributes.unp.label",
    name: "TERIOCK.TERMS.Attributes.unp.name",
    page: "TERIOCK.TERMS.Attributes.unp.page",
  },
};

preLocalize("options.attribute", {
  keys: ["label", "name", "page"],
  sort: true,
});
