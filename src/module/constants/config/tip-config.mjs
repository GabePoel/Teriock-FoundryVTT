import { preLocalizeConfig } from "../../helpers/localization.mjs";

const suppression = {
  armor: "TERIOCK.SYSTEMS.Rank.MESSAGES.suppression.armor",
  consumed: "TERIOCK.SYSTEMS.Consumable.MESSAGES.suppression.consumed",
  dampened: "TERIOCK.SYSTEMS.BaseEffect.MESSAGES.suppression.dampened",
  deattuned: "TERIOCK.SYSTEMS.BaseEffect.MESSAGES.suppression.deattuned",
  destroyed: "TERIOCK.SYSTEMS.Equipment.MESSAGES.suppression.destroyed",
  disabled: "TERIOCK.SYSTEMS.Child.MESSAGES.suppression.disabled",
  elder: "TERIOCK.SYSTEMS.Child.MESSAGES.suppression.elder",
  forced: "TERIOCK.SYSTEMS.Child.MESSAGES.suppression.forced",
  inactiveRanks: "TERIOCK.SYSTEMS.Archetype.MESSAGES.suppression.inactiveRanks",
  inactiveTransformation: "TERIOCK.SYSTEMS.Species.MESSAGES.suppression.inactiveTransformation",
  notPrimary: "TERIOCK.SYSTEMS.Transformation.MESSAGES.suppression.notPrimary",
  parentDestroyed: "TERIOCK.SYSTEMS.BaseEffect.MESSAGES.suppression.destroyed",
  parentStashed: "TERIOCK.SYSTEMS.BaseEffect.MESSAGES.suppression.stashed",
  parentUnequipped: "TERIOCK.SYSTEMS.BaseEffect.MESSAGES.suppression.unequipped",
  shattered: "TERIOCK.SYSTEMS.BaseEffect.MESSAGES.suppression.shattered",
  stashed: "TERIOCK.SYSTEMS.Equipment.MESSAGES.suppression.stashed",
  unequipped: "TERIOCK.SYSTEMS.Equipment.MESSAGES.suppression.unequipped",
  unmounted: "TERIOCK.SYSTEMS.Mount.MESSAGES.suppression.unmounted",
};

const error = {
  overCarriedCount: "TERIOCK.SYSTEMS.Equipment.MESSAGES.error.overCarriedCount",
  overCarriedWeight: "TERIOCK.SYSTEMS.Equipment.MESSAGES.error.overCarriedWeight",
};

export default { error, suppression };

preLocalizeConfig("config.tip.suppression");
preLocalizeConfig("config.tip.error");
