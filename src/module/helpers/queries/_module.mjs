import { default as addToSustainingQuery } from "./add-to-sustaining-query.mjs";
import { default as callPseudoHookQuery } from "./call-pseudo-hook-query.mjs";
import { default as createHotbarFolderQuery } from "./create-hotbar-folder-query.mjs";
import { default as identifyItemQuery } from "./identify-item-query.mjs";
import { default as inCombatExpirationQuery } from "./in-combat-expiration-query.mjs";
import { default as resetAttackPenalties } from "./reset-attack-penalties-query.mjs";
import { default as sustainedExpirationQuery } from "./sustained-expiration-query.mjs";
import { default as timeAdvanceQuery } from "./time-advance-query.mjs";
import { default as updateEmbeddedDocumentsQuery } from "./update-embedded-documents-query.mjs";
import { default as updateQuery } from "./update-query.mjs";

const queries = {
  "teriock.addToSustaining": addToSustainingQuery,
  "teriock.callPseudoHook": callPseudoHookQuery,
  "teriock.createHotbarFolder": createHotbarFolderQuery,
  "teriock.identifyItem": identifyItemQuery,
  "teriock.inCombatExpiration": inCombatExpirationQuery,
  "teriock.resetAttackPenalties": resetAttackPenalties,
  "teriock.sustainedExpiration": sustainedExpirationQuery,
  "teriock.timeAdvance": timeAdvanceQuery,
  "teriock.update": updateQuery,
  "teriock.updateEmbeddedDocuments": updateEmbeddedDocumentsQuery,
};

export default queries;
