/**
 * @import { TokenMovementOperation } from "@client/documents/_types.mjs";
 * @import { DatabaseUpdateOperation } from "@common/abstract/_types.mjs";
 */

/**
 * @param {TeriockToken} token
 * @param {boolean} controlled
 * @see {controlToken}
 */
function markCombatantsControlled(token, controlled) {
  for (const combatant of ui.combat?.viewed?.getCombatantsByToken(token.document) ?? []) {
    ui.combat.markCombatantControlled(combatant, controlled);
  }
}

/**
 * @param {TeriockTokenDocument} document
 * @param {TokenMovementOperation} _movement
 * @param {Partial<DatabaseUpdateOperation>} _operation
 * @param {TeriockUser} user
 * @returns {Promise<boolean>}
 * @see {moveToken}
 */
async function fireMovementTrigger(document, _movement, _operation, user) {
  if (document.checkEditor(user) && document.actor) { await document.actor.fireTrigger("movement"); }
}

const tokenHookEntries = [["controlToken", markCombatantsControlled], ["moveToken", fireMovementTrigger]];

export default tokenHookEntries;
