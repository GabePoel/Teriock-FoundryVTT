/**
 * @param {TeriockToken} token
 * @param {Teriock.Keys.Status} statusId
 * @param {boolean} active
 * @returns {Promise<void>}
 * @see {applyTokenStatusEffect}
 * @todo Remove release restriction once token magic is ready for V14.
 */
async function applyTokenMagicFilters(token, statusId, active) {
  if (
    game.release.generation === 13
    && token.document.baseActor?.system.settings.token.autoMagic
    && game.modules.get("tokenmagic")?.active
    && game.teriock.getSetting("autoTokenMagicConditionEffects")
    && token.isOwner
  ) {
    if (Object.keys(TERIOCK.display.tokenMagic).includes(statusId)) {
      const params = TERIOCK.display.tokenMagic[statusId];
      if (active) { await TokenMagic.addFilters(token, [params]); }
      else { await TokenMagic.deleteFilters(token, params.filterId); }
    }
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
  if (document.checkEditor(user) && document.actor) { await document.actor.hookCall("movement"); }
}

const tokenHookEntries = [["applyTokenStatusEffect", applyTokenMagicFilters], ["moveToken", fireMovementTrigger]];

export default tokenHookEntries;
