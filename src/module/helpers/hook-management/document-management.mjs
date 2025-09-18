import { isOwnerAndCurrentUser } from "../utils.mjs";

export default function registerDocumentManagementHooks() {
  foundry.helpers.Hooks.on("updateItem", async (document, updateData, _options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      if (document.type === "equipment" && document.system.isAttuned && updateData.system.tier) {
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
      await document.actor?.postUpdate();
    }
  });

  foundry.helpers.Hooks.on("updateActor", async (document, changed, _options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      const doCheckDown = typeof changed.system?.hp?.value
        === "number"
        || typeof changed.system?.mp?.value
        === "number"
        || typeof changed.system?.money?.debt
        === "number";
      const doPrepareTokens = typeof changed.system?.hp?.value
        === "number"
        || typeof changed.system?.mp?.value
        === "number";
      await document.postUpdate({
        checkDown: !doCheckDown,
        prepareTokens: !doPrepareTokens,
      });
    }
  });

  foundry.helpers.Hooks.on("createItem", async (document, _options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      if (document.type === "equipment") {
        if (document.actor) {
          await document.update({ "system.equipped": false });
        }
      }
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate();
    }
  });

  foundry.helpers.Hooks.on("deleteItem", async (document, _options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate();
    }
  });

  foundry.helpers.Hooks.on("createActiveEffect", async (document, _options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      if (document.sup) {
        await document.sup.sheet.render();
      }
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate({ checkDown: true });
    }
  });

  foundry.helpers.Hooks.on("deleteActiveEffect", async (document, _options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      if (document.type === "ability") {
        await document.system.expireSustainedConsequences(true);
      }
      if (document.sup) {
        await document.sup.sheet.render();
      }
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate({ checkDown: true });
    }
  });

  foundry.helpers.Hooks.on("updateActiveEffect", /**
   * @param {TeriockEffect} document
   * @param _updateData
   * @param _options
   * @param userId
   * @returns {Promise<void>}
   */
  async (document, _updateData, _options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      await document.actor?.postUpdate();
    }
    if (document.documentName === "ActiveEffect") {
      if (document.sup && document.sup.sheet.rendered) {
        await document.sup.sheet.render();
      }
      if (isOwnerAndCurrentUser(document, userId) && document.type === "ability") {
        await document.system.expireSustainedConsequences();
      }
    }
    if (document.parent.documentName === "Item") {
      if (document.parent.sheet.rendered) {
        await document.parent.sheet.render();
      }
    }
  });
}
