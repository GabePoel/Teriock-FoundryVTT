import { preLocalizeObject } from "../../helpers/localization.mjs";

export default {
  // no sort
  groups: {
    general: "TERIOCK.COMMON.General",
    classification: "TERIOCK.COMMON.Classification",
    costs: "TERIOCK.COMMON.Costs",
    combat: "TERIOCK.COMMON.Combat",
    metaphysics: "TERIOCK.COMMON.Metaphysics",
    attributes: "TERIOCK.COMMON.Attributes",
    transformation: "TERIOCK.COMMON.Transformation",
  },
  // no sort
  sizes: {
    tiny: "TERIOCK.SHEETS.Common.CARD.Sizes.tiny",
    small: "TERIOCK.SHEETS.Common.CARD.Sizes.small",
    medium: "TERIOCK.SHEETS.Common.CARD.Sizes.medium",
    large: "TERIOCK.SHEETS.Common.CARD.Sizes.large",
  },
  subgroups: {
    activation: "TERIOCK.COMMON.Activation",
    adjustments: "TERIOCK.COMMON.Adjustments",
    defense: "TERIOCK.COMMON.Defense",
    descriptions: "TERIOCK.COMMON.Descriptions",
    formulas: "TERIOCK.COMMON.Formulas",
    notes: "TERIOCK.COMMON.Notes",
    offense: "TERIOCK.COMMON.Offense",
    overview: "TERIOCK.COMMON.Overview",
    results: "TERIOCK.COMMON.Results",
    tweaks: "TERIOCK.COMMON.Tweaks",
    upgrades: "TERIOCK.COMMON.Upgrades",
  },
};

preLocalizeObject("CONFIG.display.groups");
preLocalizeObject("CONFIG.display.subgroups");
preLocalizeObject("CONFIG.display.sizes");
