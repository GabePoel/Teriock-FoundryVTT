/**
 * @import { TokenMovementOperation } from "@client/documents/_types.mjs";
 * @import { DatabaseUpdateOperation } from "@common/abstract/_types.mjs";
 */

/**
 * @param {TeriockTokenDocument} document
 * @param {TokenMovementOperation} _movement
 * @param {Partial<DatabaseUpdateOperation>} _operation
 * @param {TeriockUser} user
 * @returns {Promise<boolean>}
 * @see {moveToken}
 */
async function fireMovementTrigger(document, _movement, _operation, user) {
  if (document.checkEditor(user) && document.actor) { await document.actor.hookCall("movement"); }
}

const tokenHookEntries = [["moveToken", fireMovementTrigger]];

export default tokenHookEntries;
