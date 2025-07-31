import { isOwnerAndCurrentUser } from "../utils.mjs";

export default function registerDocumentManagementHooks() {
  foundry.helpers.Hooks.on(
    "updateItem",
    async (document, updateData, _options, userId) => {
      if (isOwnerAndCurrentUser(document, userId)) {
        if (
          document.type === "equipment" &&
          document.system.isAttuned &&
          updateData.system.tier
        ) {
          const attunement = document.system.attunement;
          if (attunement) {
            await attunement.update({
              "system.tier": document.system.tier.derived,
            });
          }
        }
        const abilities = document.effectTypes?.ability || [];
        for (const ability of abilities) {
          await ability.system.expireSustainedConsequences();
        }
        await document.actor?.postUpdate();
      }
    },
  );

  foundry.helpers.Hooks.on(
    "updateActor",
    async (document, changed, _options, userId) => {
      if (isOwnerAndCurrentUser(document, userId)) {
        const doCheckDown =
          typeof changed.system?.hp?.value === "number" ||
          typeof changed.system?.mp?.value === "number" ||
          typeof changed.system?.money?.debt === "number";
        await document.postUpdate({
          checkDown: !doCheckDown,
        });
      }
    },
  );

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

  foundry.helpers.Hooks.on(
    "createActiveEffect",
    async (document, _options, userId) => {
      if (isOwnerAndCurrentUser(document, userId)) {
        if (document.sup) await document.sup.sheet.render();
        document.actor?.buildEffectTypes();
        await document.actor?.postUpdate({ checkDown: true });
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
        if (document.sup) await document.sup.sheet.render();
        document.actor?.buildEffectTypes();
        await document.actor?.postUpdate({ checkDown: true });
      }
    },
  );

  foundry.helpers.Hooks.on(
    "updateActiveEffect",
    async (document, _updateData, _options, userId) => {
      if (
        isOwnerAndCurrentUser(document, userId) &&
        document.type === "ability"
      ) {
        await document.system.expireSustainedConsequences();
        if (document.sup) await document.sup.sheet.render();
      }
    },
  );
}
