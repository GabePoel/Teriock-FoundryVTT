import createHotbarFolderQuery from "./create-hotbar-folder-query.mjs";
import fireTriggerQuery from "./fire-trigger-query.mjs";
import identifyItemQuery from "./identify-item-query.mjs";
import inCombatExpirationQuery from "./in-combat-expiration-query.mjs";
import massUpdateQuery from "./mass-update-query.mjs";
import resetAttackPenalties from "./reset-attack-penalties-query.mjs";
import updateQuery from "./update-query.mjs";

const queries = {
  "teriock.createHotbarFolder": createHotbarFolderQuery,
  "teriock.fireTrigger": fireTriggerQuery,
  "teriock.identifyItem": identifyItemQuery,
  "teriock.inCombatExpiration": inCombatExpirationQuery,
  "teriock.resetAttackPenalties": resetAttackPenalties,
  "teriock.update": updateQuery,
  "teriock.massUpdate": massUpdateQuery,
};

export default queries;
