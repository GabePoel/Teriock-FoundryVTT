/**
 * @import { TokenMovementOperation } from "@client/documents/_types.mjs";
 * @import { DatabaseUpdateOperation } from "@common/abstract/_types.mjs";
 */

/**
 * @param {TeriockToken} token
 * @param {boolean} controlled
 * @see {controlToken}
 * @category Groups
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

/**
 * Make sure linked actors have the correct terrains when the scene changes or the canvas loads.
 * @see {canvasReady}
 * @category Terrain
 */
function checkSceneTerrains() {
  const actors = new Set(game.actors.filter(a => a._cache.terrains?.size));
  for (const token of canvas.scene?.tokens ?? []) { if (token.actor) { actors.add(token.actor); } }
  for (const actor of actors) { actor.system.checkTerrains?.(); }
}

const tokenHookEntries = [["canvasReady", checkSceneTerrains], ["controlToken", markCombatantsControlled], [
  "moveToken",
  fireMovementTrigger,
]];

export default tokenHookEntries;
