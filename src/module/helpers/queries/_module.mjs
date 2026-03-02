import addToSustainingQuery from "./add-to-sustaining-query.mjs";
import createHotbarFolderQuery from "./create-hotbar-folder-query.mjs";
import fireTriggerQuery from "./fire-trigger-query.mjs";
import identifyItemQuery from "./identify-item-query.mjs";
import inCombatExpirationQuery from "./in-combat-expiration-query.mjs";
import resetAttackPenalties from "./reset-attack-penalties-query.mjs";
import sustainedExpirationQuery from "./sustained-expiration-query.mjs";
import timeAdvanceQuery from "./time-advance-query.mjs";
import updateEmbeddedDocumentsQuery from "./update-embedded-documents-query.mjs";
import updateQuery from "./update-query.mjs";

const queries = {
  "teriock.addToSustaining": addToSustainingQuery,
  "teriock.createHotbarFolder": createHotbarFolderQuery,
  "teriock.fireTrigger": fireTriggerQuery,
  "teriock.identifyItem": identifyItemQuery,
  "teriock.inCombatExpiration": inCombatExpirationQuery,
  "teriock.resetAttackPenalties": resetAttackPenalties,
  "teriock.sustainedExpiration": sustainedExpirationQuery,
  "teriock.timeAdvance": timeAdvanceQuery,
  "teriock.update": updateQuery,
  "teriock.updateEmbeddedDocuments": updateEmbeddedDocumentsQuery,
};

export default queries;
