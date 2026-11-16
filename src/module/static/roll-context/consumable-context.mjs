import { preLocalizeObject } from "../../helpers/localization.mjs";

const consumableContext = {
  consumption: "TERIOCK.SYSTEMS.Consumable.FIELDS.consumption.enabled.label",
  "consumption.amount": "TERIOCK.SYSTEMS.Consumable.FIELDS.consumption.amount.label",
  quantity: "TERIOCK.ROLL_CONTEXT.Consumable.quantity",
  "quantity.max": "TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.maxFormula.label",
};

export default consumableContext;

preLocalizeObject("ROLL_CONTEXT.consumable");
