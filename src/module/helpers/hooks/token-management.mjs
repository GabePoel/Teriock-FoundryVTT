import { isOwnerAndCurrentUser } from "../utils.mjs";

export default function registerTokenManagementHooks() {
  foundry.helpers.Hooks.on(
    "moveToken",
    async (document, _movement, _operation, user) => {
      if (isOwnerAndCurrentUser(document, user._id)) {
        await document.actor?.hookCall("movement");
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