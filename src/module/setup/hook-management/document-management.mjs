import { isOwnerAndCurrentUser } from "../../helpers/utils.mjs";

export default function registerDocumentManagementHooks() {
  foundry.helpers.Hooks.on(
    "teriock.actorPostUpdate",
    /**
     * @param {TeriockActor} actor
     * @param {Teriock.ID<TeriockUser>} userId
     * @returns {Promise<void>}
     */
    async (actor, userId) => {
      if (isOwnerAndCurrentUser(actor, userId)) {
        await actor.postUpdate();
      }
    },
  );

  foundry.helpers.Hooks.on(
    "updateItem",
    /**
     * @param {TeriockItem} item
     * @param {object} updateData
     * @param {object} _options
     * @param {Teriock.ID<TeriockUser>} userId
     * @returns {Promise<void>}
     */
    async (item, updateData, _options, userId) => {
      if (isOwnerAndCurrentUser(item, userId)) {
        if (
          item.system.isAttuned &&
          foundry.utils.hasProperty(updateData, "system.tier")
        ) {
          const attunement = item.system.attunement;
          if (attunement) {
            await attunement.update({
              "system.tier": item.system.tier.value,
            });
          }
        }
        for (const ability of item.abilities) {
          await ability.system.expireSustainedConsequences();
        }
      }
    },
  );

  foundry.helpers.Hooks.on(
    "createActiveEffect",
    /**
     * @param {TeriockEffect} effect
     * @param {object} _options
     * @param {Teriock.ID<TeriockUser>} userId
     * @returns {Promise<void>}
     */
    async (effect, _options, userId) => {
      if (isOwnerAndCurrentUser(effect, userId)) {
        if (effect.sup && effect.sup.sheet.rendered) {
          await effect.sup.sheet.render();
        }
      }
    },
  );

  foundry.helpers.Hooks.on(
    "deleteActiveEffect",
    /**
     * @param {TeriockEffect} effect
     * @param {object} _options
     * @param {Teriock.ID<TeriockUser>} userId
     * @returns {Promise<void>}
     */
    async (effect, _options, userId) => {
      if (isOwnerAndCurrentUser(effect, userId)) {
        if (effect.type === "ability") {
          await effect.system.expireSustainedConsequences(true);
        }
        if (effect.sup && effect.sup.sheet.rendered) {
          await effect.sup.sheet.render();
        }
      }
    },
  );

  foundry.helpers.Hooks.on(
    "updateActiveEffect",
    /**
     * @param {TeriockEffect} effect
     * @param {object} _updateData
     * @param {object} _options
     * @param {Teriock.ID<TeriockUser>} userId
     * @returns {Promise<void>}
     */
    async (effect, _updateData, _options, userId) => {
      if (effect.sup && effect.sup.sheet.rendered) {
        await effect.sup.sheet.render();
      }
      if (isOwnerAndCurrentUser(effect, userId) && effect.type === "ability") {
        await effect.system.expireSustainedConsequences();
      }
      if (effect.parent.documentName === "Item") {
        if (effect.parent.sheet.rendered) {
          await effect.parent.sheet.render();
        }
      }
    },
  );
}
