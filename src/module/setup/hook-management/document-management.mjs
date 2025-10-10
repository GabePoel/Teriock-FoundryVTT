import { isOwnerAndCurrentUser } from "../../helpers/utils.mjs";

export default function registerDocumentManagementHooks() {
  foundry.helpers.Hooks.on(
    "updateItem",
    async (document, updateData, _options, userId) => {
      if (isOwnerAndCurrentUser(document, userId)) {
        if (
          document.system.isAttuned &&
          foundry.utils.hasProperty(updateData, "system.tier")
        ) {
          const attunement = document.system.attunement;
          if (attunement) {
            await attunement.update({
              "system.tier": document.system.tier.value,
            });
          }
        }
        for (const ability of document.abilities) {
          await ability.system.expireSustainedConsequences();
        }
      }
    },
  );

  foundry.helpers.Hooks.on(
    "teriock.actorPostUpdate",
    async (/** @param {TeriockActor} */ actor, userId) => {
      if (isOwnerAndCurrentUser(actor, userId)) {
        await actor.postUpdate();
      }
    },
  );

  foundry.helpers.Hooks.on("createItem", async (document, _options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      document.actor?.buildEffectTypes();
    }
  });

  foundry.helpers.Hooks.on("deleteItem", async (document, _options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      document.actor?.buildEffectTypes();
    }
  });

  foundry.helpers.Hooks.on(
    "createActiveEffect",
    async (document, _options, userId) => {
      if (isOwnerAndCurrentUser(document, userId)) {
        if (document.sup) {
          await document.sup.sheet.render();
        }
        document.actor?.buildEffectTypes();
      }
    },
  );

  foundry.helpers.Hooks.on(
    "deleteActiveEffect",
    async (document, _options, userId) => {
      if (isOwnerAndCurrentUser(document, userId)) {
        if (document.type === "ability") {
          await document.system.expireSustainedConsequences(true);
        }
        if (document.sup) {
          await document.sup.sheet.render();
        }
        document.actor?.buildEffectTypes();
      }
    },
  );

  foundry.helpers.Hooks.on(
    "updateActiveEffect" /**
     * @param {TeriockEffect} document
     * @param _updateData
     * @param _options
     * @param userId
     * @returns {Promise<void>}
     */,
    async (document, _updateData, _options, userId) => {
      if (document.documentName === "ActiveEffect") {
        if (document.sup && document.sup.sheet.rendered) {
          await document.sup.sheet.render();
        }
        if (
          isOwnerAndCurrentUser(document, userId) &&
          document.type === "ability"
        ) {
          await document.system.expireSustainedConsequences();
        }
      }
      if (document.parent.documentName === "Item") {
        if (document.parent.sheet.rendered) {
          await document.parent.sheet.render();
        }
      }
    },
  );
}
