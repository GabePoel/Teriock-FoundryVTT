import { preLocalizeObject } from "../../helpers/localization.mjs";
import simpleContext from "./simple-context.mjs";

const contractContext = {
  attuned: "TERIOCK.SYSTEMS.Attunement.USAGE.attuned",
  "av.max": "TERIOCK.SYSTEMS.BaseItem.FIELDS.maxAv.label",
  tier: "TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label",
};

export default contractContext;

preLocalizeObject("ROLL_CONTEXT.contract");
Hooks.once("teriock.identifiersInit", () => {
  Object.assign(contractContext, simpleContext);
});
