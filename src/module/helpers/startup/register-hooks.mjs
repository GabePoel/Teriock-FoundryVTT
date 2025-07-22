import { dispatch } from "../../commands/dispatch.mjs";
import TeriockImageSheet from "../../sheets/misc-sheets/image-sheet/image-sheet.mjs";
import hotbarDropDialog from "../dialogs/hotbar-drop-dialog.mjs";

/**
 * Check if the {@link TeriockUser} owns and uses the given document.
 *
 * @param {ClientDocument} document
 * @param {string} userId
 * @returns {boolean}
 */
function isOwnerAndCurrentUser(document, userId) {
  return game.user.id === userId && document.isOwner;
}

/**
 * Add click event listeners to multiple elements.
 *
 * @param {NodeList} elements - Collection of DOM elements to add listeners to
 * @param {Function} handler - Click event handler function
 * @returns {void}
 */
function addClickHandler(elements, handler) {
  elements.forEach((element) => {
    if (element) {
      element.addEventListener("click", handler);
    }
  });
}

/**
 * Register all Foundry VTT hooks for Teriock.
 * Handles document updates, chat interactions, combat events, and UI behaviors.
 *
 * @returns {void}
 */
export default function registerHooks() {
  foundry.helpers.Hooks.on("updateItem", async (document, updateData, options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      if (document.type === "equipment" && document.system.isAttuned && updateData.system.tier) {
        const attunement = document.system.attunement;
        if (attunement) {
          await attunement.update({
            "system.tier": document.system.tier.derived,
          });
        }
      }
      await document.actor?.postUpdate();
    }
  });

  foundry.helpers.Hooks.on("updateActor", async (document, changed, options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      const doCheckDown =
        typeof changed.system?.hp?.value === "number" ||
        typeof changed.system?.mp?.value === "number" ||
        typeof changed.system?.money?.debt === "number";
      await document.postUpdate({
        checkDown: !doCheckDown,
      });
    }
  });

  foundry.helpers.Hooks.on("createItem", async (document, options, userId) => {
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

  foundry.helpers.Hooks.on("deleteItem", async (document, options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      const sup = document.sup;
      if (sup && typeof sup.update === "function") {
        await sup.update({});
        await sup.sheet.render();
      }
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate();
    }
  });

  foundry.helpers.Hooks.on("createActiveEffect", async (document, options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      const sup = document.sup;
      if (sup && typeof sup.update === "function") {
        await sup.forceUpdate();
      }
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate({ checkDown: true });
    }
  });

  foundry.helpers.Hooks.on("deleteActiveEffect", async (document, options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      const sup = document.sup;
      if (sup && typeof sup.update === "function") {
        await sup.forceUpdate();
      }
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate({ checkDown: true });
    }
  });

  foundry.helpers.Hooks.on("updateActiveEffect", async (document, updateData, options, userId) => {
    console.debug(`Teriock | Active Effect updated: ${document.name}`, updateData);
    if (isOwnerAndCurrentUser(document, userId) && document.type === "ability") {
      const sup = document.sup;
      if (sup && typeof sup.update === "function") {
        await sup.update({});
        await sup.sheet.render();
      }
    }
  });

  foundry.helpers.Hooks.on("combatTurnChange", async (combat) => {
    const combatants = combat.combatants;
    for (const combatant of combatants) {
      const actor = combatant.actor;
      if (actor?.isOwner) {
        if (actor.system.attackPenalty > 0) {
          await actor.update({
            "system.attackPenalty": 0,
          });
        } else {
          await actor.forceUpdate();
        }
        const effects = actor.temporaryEffects;
        for (const effect of effects) {
          await effect.system.checkExpiration();
        }
      }
    }
  });

  foundry.helpers.Hooks.on("chatMessage", (chatLog, message, chatData) => {
    const users = /** @type {WorldCollection<TeriockUser>} */ game.users;
    const sender = users.get(chatData.user);
    if (message.startsWith("/")) return dispatch(message, chatData, sender);
  });

  foundry.helpers.Hooks.on("renderChatMessageHTML", (message, html) => {
    // Image click handler
    /** TODO: Fix and move to {@link TeriockBaseMessageData} */
    html.querySelectorAll(".timage").forEach((imgEl) => {
      imgEl.addEventListener("click", async (event) => {
        event.stopPropagation();
        event.preventDefault();
        const img = imgEl.getAttribute("data-src");
        if (img && img.length > 0) {
          const image = new TeriockImageSheet(img);
          await image.render(true);
        }
      });
    });

    // Open tags
    /** TODO: Move to {@link TeriockBaseMessageData} */
    addClickHandler(html.querySelectorAll('[data-action="open"]'), async (event) => {
      event.preventDefault();
      const uuid = event.currentTarget.getAttribute("data-uuid");
      if (!uuid) return;
      const doc = /** @type{ClientDocument} */ await foundry.utils.fromUuid(uuid);
      if (doc && typeof doc.sheet?.render === "function") {
        await doc.sheet.render(true);
      }
    });

    /** TODO: Move to {@link TeriockBaseMessageData} */
    html.querySelectorAll(".teriock-target-container").forEach((container) => {
      let clickTimeout = null;

      container.addEventListener("click", async (event) => {
        event.stopPropagation();
        const uuid = container.getAttribute("data-uuid");
        if (!uuid) return;

        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
          return;
        }

        clickTimeout = setTimeout(async () => {
          const doc = /** @type{TeriockToken} */ await foundry.utils.fromUuid(uuid);
          if (doc.isOwner) {
            if (doc?.token?.object) {
              doc.token.object.control();
            } else {
              doc.getActiveTokens()[0]?.control();
            }
          }
          clickTimeout = null;
        }, 200);
      });

      container.addEventListener("dblclick", async (event) => {
        event.stopPropagation();
        const uuid = container.getAttribute("data-uuid");
        if (!uuid) return;

        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }

        const doc = /** @type {TeriockActor} */ await foundry.utils.fromUuid(uuid);
        if (doc && doc.sheet && doc.isOwner && typeof doc.sheet.render === "function") {
          await doc.sheet.render(true);
        }
      });
    });
  });

  foundry.helpers.Hooks.on("hotbarDrop", (bar, data, slot) => {
    fromUuid(data.uuid).then(
      /** @param {TeriockItem|TeriockEffect} doc */ async (doc) => {
        if (!doc || !["Item", "ActiveEffect"].includes(doc.documentName)) return;
        const macroName = `Use ${doc.name}`;
        const { searchTerm, command } = await hotbarDropDialog(doc);
        const folders = /** @type {WorldCollection<Folder>} */ game.folders;
        let macroFolder = folders.find((f) => f.name === "Player Macros" && f.type === "Macro");
        if (!macroFolder) {
          macroFolder = await Folder.create({
            name: "Player Macros",
            type: "Macro",
          });
        }
        const macros = /** @type {WorldCollection<TeriockMacro>} */ game.macros;
        let macro = /** @type {TeriockMacro|undefined} */ macros.find(
          (m) => m.name === macroName && m.command?.startsWith(searchTerm),
        );
        /** @type {TeriockUser} */
        const user = game.user;
        if (!macro) {
          macro = /** @type {TeriockMacro} */ await Macro.create({
            name: macroName,
            type: "script",
            img: doc.img,
            command,
            flags: { teriock: { itemMacro: true } },
            folder: macroFolder.id,
          }).catch((err) => {
            console.error(`Failed to create macro: ${err}`);
            ui.notifications.error(`Failed to create macro: ${err.message}`);
          });
          if (macro) {
            await user.assignHotbarMacro(macro, slot);
          }
        } else {
          await user.assignHotbarMacro(macro, slot);
        }
        return false;
      },
    );
    return false;
  });

  foundry.helpers.Hooks.on("combatRound", async (combat, updateData, updateOptions) => {
    const direction = updateOptions.direction;
    await game.time.advance(5 * direction);
  });

  foundry.helpers.Hooks.on("updateWorldTime", async (worldTime, dt, options, userId) => {
    if (game.user.id === userId && game.user?.isActiveGM) {
      const scene = game.scenes.viewed;
      const tokens = scene.tokens;
      const actors = tokens.map((token) => token.actor);

      for (const actor of actors) {
        // Handle temporary effects expiration
        const effects = actor.temporaryEffects;
        for (const effect of effects) {
          await effect.system.checkExpiration();
        }

        // Update debt with interest if the actor has debt and an interest rate
        const currentDebt = actor.system.money?.debt || 0;
        const dailyInterestRate = actor.system.interestRate || 0;

        if (currentDebt > 0 && dailyInterestRate > 0) {
          // Calculate new debt after interest
          const daysElapsed = dt / 86400; // Convert seconds to days
          const newDebt = currentDebt * Math.pow(1 + dailyInterestRate, daysElapsed);

          // Update the actor's debt
          await actor.update({
            "system.money.debt": Math.round(newDebt * 100) / 100, // Round to 2 decimal places
          });
        }

        await actor.forceUpdate();
      }
    }
  });

  foundry.helpers.Hooks.on("moveToken", async (document, movement, operation, user) => {
    if (document.isOwner && document.actor && game.user.id === user._id) {
      const actor = document.actor;
      const effects = actor.movementExpirationEffects;
      for (const effect of effects) {
        await effect.system.expire();
      }
    }
  });

  foundry.helpers.Hooks.on("applyTokenStatusEffect", (token) => {
    const actor = token.actor;
    if (actor) {
      actor.prepareDerivedData();
    }
  });
}
