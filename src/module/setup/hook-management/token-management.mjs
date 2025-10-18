//noinspection JSUnresolvedReference

import { isOwnerAndCurrentUser } from "../../helpers/utils.mjs";

export default function registerTokenManagementHooks() {
  foundry.helpers.Hooks.on(
    "moveToken",
    async (document, _movement, _operation, user) => {
      if (isOwnerAndCurrentUser(document, user._id) && document.actor) {
        const data = await document.actor.hookCall("movement");
        if (data.cancel) {
          return false;
        }
        for (const e of document.actor.movementExpirationEffects) {
          await e.system.expire();
        }
      }
    },
  );

  foundry.helpers.Hooks.on("applyTokenStatusEffect", (token) => {
    const actor = token.actor;
    if (actor) {
      actor.prepareDerivedData();
    }
  });

  foundry.helpers.Hooks.on(
    "applyTokenStatusEffect",
    async (token, statusId, active) => {
      if (
        game.modules.get("tokenmagic")?.active &&
        game.settings.get("teriock", "automaticTokenMagicConditionEffects")
      ) {
        if (Object.keys(TERIOCK.display.tokenMagic).includes(statusId)) {
          const params = TERIOCK.display.tokenMagic[statusId];
          if (active) {
            //eslint-disable-next-line no-undef
            await TokenMagic.addFilters(token, [params]);
          } else {
            //eslint-disable-next-line no-undef
            await TokenMagic.deleteFilters(token, params.filterId);
          }
        }
      }
    },
  );
}
