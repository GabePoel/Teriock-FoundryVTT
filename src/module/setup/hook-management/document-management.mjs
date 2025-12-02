import { isOwnerAndCurrentUser } from "../../helpers/utils.mjs";

export default function registerDocumentManagementHooks() {
  foundry.helpers.Hooks.on(
    "teriock.actorPostUpdate",
    /**
     * @param {TeriockActor} actor
     * @param {ID<TeriockUser>} userId
     * @returns {Promise<void>}
     */
    async (actor, userId) => {
      if (isOwnerAndCurrentUser(actor, userId)) {
        await actor.postUpdate();
      }
    },
  );
}
