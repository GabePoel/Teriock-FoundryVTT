import { isOwnerAndCurrentUser } from "../utils.mjs";

export default function registerTokenManagementHooks() {
  foundry.helpers.Hooks.on(
    "moveToken",
    async (document, _movement, _operation, user) => {
      if (isOwnerAndCurrentUser(document, user._id) && document.actor) {
        await document.actor.hookCall("movement");
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
