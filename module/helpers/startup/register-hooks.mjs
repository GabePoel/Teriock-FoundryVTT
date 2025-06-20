import TeriockImageSheet from "../../sheets/misc-sheets/image-sheet/image-sheet.mjs";
import { dispatch } from "../../commands/dispatch.mjs";
import { imageContextMenuOptions } from "../../sheets/misc-sheets/image-sheet/connections/_context-menus.mjs";
const { ux } = foundry.applications;

export default function registerHooks() {
  Hooks.on("updateItem", async (document, updateData, options, userId) => {
    if (game.user.id === userId && document.isOwner) {
      await document.getActor()?.postUpdate();
    }
  });

  Hooks.on("updateActor", async (document, changed, options, userId) => {
    if (game.user.id === userId && document.isOwner) {
      await document.postUpdate();
    }
  });

  Hooks.on("createItem", async (document, options, userId) => {
    if (game.user.id === userId && document.isOwner) {
      if (document.type === "equipment") {
        if (document.getActor()) {
          await document.system.unequip();
        }
      }
      await document.getActor()?.postUpdate();
    }
  });

  Hooks.on("deleteItem", async (document, options, userId) => {
    if (game.user.id === userId && document.isOwner) {
      await document.getActor()?.postUpdate();
    }
  });

  Hooks.on("createActiveEffect", async (document, options, userId) => {
    if (game.user.id === userId && document.isOwner) {
      if (document.type === "ability") {
        if (document.system.childIds?.length > 0) {
          const childAbilityData = [];
          for (const childAbility of document.getChildren()) {
            const data = foundry.utils.duplicate(childAbility);
            data.system.parentId = document._id;
            childAbilityData.push(data);
          }
          const newChildAbilities = await document.parent.createEmbeddedDocuments("ActiveEffect", childAbilityData);
          const newChildIds = newChildAbilities.map((ability) => ability._id);
          document.update({
            "system.childIds": newChildIds,
          });
        }
      }
      await document.getActor()?.postUpdate();
    }
  });

  Hooks.on("deleteActiveEffect", async (document, options, userId) => {
    if (game.user.id === userId && document.isOwner) {
      if (document.type === "ability") {
        if (document.system.parentId) {
          const parent = document.parent.getEmbeddedDocument("ActiveEffect", document.system.parentId);
          if (parent) {
            const childIds = parent.system.childIds.filter((id) => id !== document._id);
            await parent.update({ "system.childIds": childIds });
          }
        }
        if (document.system.childIds?.length > 0) {
          const childIds = document.system.childIds;
          await document.parent.deleteEmbeddedDocuments("ActiveEffect", childIds);
        }
      }
      await document.getActor()?.postUpdate();
    }
  });

  Hooks.on("updateActiveEffect", async (document, updateData, options, userId) => {
    if (game.user.id === userId && document.isOwner && document.type === "ability") {
      const parent = document.getParent();
      if (parent) {
        await parent.update({});
        await parent.sheet.render();
      }
    }
  });

  Hooks.on("combatTurnChange", async (combat, prior, current) => {
    const combatants = combat.combatants;
    for (const combatant of combatants) {
      const actor = combatant.actor;
      if (actor?.isOwner) {
        await actor.update({
          "system.attackPenalty": 0,
        });
        const effects = actor.temporaryEffects;
        for (const effect of effects) {
          await effect.system.checkExpiration();
        }
      }
    }
  });

  Hooks.on("chatMessage", (chatLog, message, chatData) => {
    const sender = game.users.get(chatData.user);
    if (message.startsWith("/")) return dispatch(message, chatData, sender);
  });

  Hooks.on("renderChatMessageHTML", (message, html, context) => {
    new ux.ContextMenu(html, ".timage", imageContextMenuOptions, {
      eventName: "contextmenu",
      jQuery: false,
      fixed: true,
    });
    html.querySelectorAll(".timage").forEach((imgEl) => {
      imgEl.addEventListener("click", async (event) => {
        event.stopPropagation();
        event.preventDefault();
        const img = imgEl.getAttribute("data-src");
        if (img && img.length > 0) {
          const image = new TeriockImageSheet(img);
          image.render(true);
        }
      });
    });
    const buttons = html.querySelectorAll(".harm-button");
    buttons.forEach((button) => {
      if (button) {
        button.addEventListener("click", async (event) => {
          const data = event.currentTarget.dataset;
          const amount = parseInt(data.amount);
          const type = data.type || "damage";
          const targets = game.user.targets;

          for (const target of targets) {
            const actor = target.actor;
            if (!actor) continue;
            if (type === "damage") {
              await actor.takeDamage(amount);
            } else if (type === "drain") {
              await actor.takeDrain(amount);
            } else if (type === "wither") {
              await actor.takeWither(amount);
            }
          }
        });
      }
    });
    const openTags = html.querySelectorAll('[data-action="open"]');
    openTags.forEach((tag) => {
      tag.addEventListener("click", async (event) => {
        event.preventDefault();
        const uuid = tag.getAttribute("data-uuid");
        if (!uuid) return;
        const doc = await fromUuid(uuid);
        if (doc && typeof doc.sheet?.render === "function") {
          doc.sheet.render(true);
        }
      });
    });
  });

  Hooks.on("renderDialogV2", (application, html, context) => {
    const openTags = html.querySelectorAll('[data-action="open"]');
    openTags.forEach((tag) => {
      tag.addEventListener("click", async (event) => {
        event.preventDefault();
        const uuid = tag.getAttribute("data-uuid");
        if (!uuid) return;
        const doc = await fromUuid(uuid);
        if (doc && typeof doc.sheet?.render === "function") {
          doc.sheet.render(true);
        }
      });
    });
  });

  Hooks.on("hotbarDrop", (bar, data, slot) => {
    fromUuid(data.uuid).then(async (item) => {
      if (!item || typeof item.roll !== "function") return;
      const id = item._id;

      const macroName = `Roll ${item.name}`;
      const command = `// ID: ${id}
const item = await fromUuid("${item.uuid}");
if (!item) return ui.notifications.warn("Item not found: ${item.name}");

const options = {
  advantage: window.event?.altKey,
  disadvantage: window.event?.shiftKey,
  twoHanded: window.event?.ctrlKey,
};

await item.use(options);
`;
      let macroFolder = game.folders.find((f) => f.name === "Player Macros" && f.type === "Macro");
      if (!macroFolder) {
        macroFolder = await Folder.create({
          name: "Player Macros",
          type: "Macro",
        });
      }
      let macro = game.macros.find((m) => m.name === macroName && m.command?.startsWith(`// ID: ${id}`));
      if (!macro) {
        macro = await Macro.create({
          name: macroName,
          type: "script",
          img: item.img,
          command,
          flags: { teriock: { itemMacro: true } },
          folder: macroFolder.id,
        }).catch((err) => {
          console.error(`Failed to create macro: ${err}`);
          ui.notifications.error(`Failed to create macro: ${err.message}`);
        });
        if (macro) {
          game.user.assignHotbarMacro(macro, slot);
        }
      } else {
        game.user.assignHotbarMacro(macro, slot);
      }
    });

    return false;
  });

  Hooks.on("combatRound", (combat, updateData, updateOptions) => {
    const direction = updateOptions.direction;
    game.time.advance(5 * direction);
  });

  Hooks.on("updateWorldTime", (worldTime, dt, options, userId) => {
    if (game.user.id === userId && game.user.isActiveGM) {
      const sceneId = game.user.viewedScene;
      const scene = game.scenes.get(sceneId);
      const tokens = scene?.tokens;
      const actors = tokens?.map((token) => token.actor);
      for (const actor of actors) {
        const effects = actor.temporaryEffects;
        for (const effect of effects) {
          effect.system.checkExpiration();
        }
      }
    }
  });

  Hooks.on("moveToken", async (document, movement, operation, user) => {
    console.log("moveToken", document, movement, operation, user);
    if (document.isOwner && document.actor && game.user.id === user._id) {
      const actor = document.actor;
      if (actor.effectKeys?.effect?.has("brace")) {
        actor.update({ "system.hp.temp": 0 });
      }
      const effects = actor.movementExpirationEffects;
      for (const effect of effects) {
        await effect.system.expire();
      }
    }
  });
}
