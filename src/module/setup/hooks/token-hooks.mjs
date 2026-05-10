//noinspection JSUnresolvedReference

/**
 * @param {TeriockToken} token
 * @param {Teriock.Keys.Status} statusId
 * @param {boolean} active
 * @returns {Promise<void>}
 * @see {applyTokenStatusEffect}
 */
async function applyTokenMagicFilters(token, statusId, active) {
  const activeGM = game.users.activeGM;
  let tokenEditor;
  const user = game.user;
  if (activeGM) tokenEditor = Boolean(user.isActiveGM);
  else tokenEditor = token.isOwner;
  if (
    token.document.baseActor?.getSetting("token.autoMagic") &&
    game.modules.get("tokenmagic")?.active &&
    game.teriock.getSetting("autoTokenMagicConditionEffects") &&
    tokenEditor
  ) {
    if (Object.keys(TERIOCK.display.tokenMagic).includes(statusId)) {
      const params = TERIOCK.display.tokenMagic[statusId];
      if (active) await TokenMagic.addFilters(token, [params]);
      else await TokenMagic.deleteFilters(token, params.filterId);
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
  if (document.checkEditor(user) && document.actor) {
    await document.actor.hookCall("movement");
  }
}

const HOOK_ENTRIES = [
  ["applyTokenStatusEffect", applyTokenMagicFilters],
  ["moveToken", fireMovementTrigger],
];

export default function registerTokenManagementHooks() {
  HOOK_ENTRIES.forEach(([hook, handler]) =>
    foundry.helpers.Hooks.on(hook, handler),
  );
}
