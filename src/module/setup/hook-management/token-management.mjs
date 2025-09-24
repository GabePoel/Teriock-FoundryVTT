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
}
