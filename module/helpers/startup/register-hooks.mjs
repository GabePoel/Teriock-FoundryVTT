const { ux } = foundry.applications;
import { dispatch } from "../../commands/dispatch.mjs";
import { TeriockRoll } from "../../documents/_module.mjs";
import { imageContextMenuOptions } from "../../sheets/misc-sheets/image-sheet/connections/_context-menus.mjs";
import TeriockImageSheet from "../../sheets/misc-sheets/image-sheet/image-sheet.mjs";
import { boostDialog } from "../dialogs/_module.mjs";

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
 * Get targets.
 *
 * @returns {TeriockActor[]}
 */
function getTargetActors() {
  let actors = [];
  if (canvas.tokens?.controlled?.length > 0) {
    actors = canvas.tokens.controlled.map((t) => t.actor).filter(Boolean);
  } else if (game.user.character) {
    actors = [game.user.character];
  }
  return actors;
}

/**
 * Modifier roll options.
 *
 * @param {MouseEvent} event
 * @returns {{advantage, disadvantage, double, twoHanded}}
 */
function getModifierOptions(event) {
  return {
    advantage: event.altKey,
    disadvantage: event.shiftKey,
    double: event.altKey,
    twoHanded: event.ctrlKey,
  };
}

/**
 * Apply an action to multiple actors with consistent notification messages.
 *
 * @param {TeriockActor[]} actors - Array of actors to apply the action to
 * @param {string} action - The action to perform (e.g., "takeDamage", "takeHeal")
 * @param {number} [amount] - The amount value for the action
 * @param {string} [data] - Additional data for the action (e.g., body part for hack actions)
 * @returns {Promise<void>}
 */
async function applyActorAction(actors, action, amount, data) {
  const actionMap = {
    takeDamage: (actor, amt) => actor.takeDamage(amt),
    takeDrain: (actor, amt) => actor.takeDrain(amt),
    takeWither: (actor, amt) => actor.takeWither(amt),
    takeHeal: (actor, amt) => actor.takeHeal(amt),
    takeRevitalize: (actor, amt) => actor.takeRevitalize(amt),
    takeSetTempHp: (actor, amt) => actor.takeSetTempHp(amt),
    takeSetTempMp: (actor, amt) => actor.takeSetTempMp(amt),
    takeGainTempHp: (actor, amt) => actor.takeGainTempHp(amt),
    takeGainTempMp: (actor, amt) => actor.takeGainTempMp(amt),
    takeSleep: (actor, amt) => actor.takeSleep(amt),
    takeKill: (actor, amt) => actor.takeKill(amt),
    takePay: (actor, amt) => actor.takePay(amt),
    takeHack: (actor, _, bodyPart) => actor.takeHack(bodyPart),
    takeUnhack: (actor, _, bodyPart) => actor.takeUnhack(bodyPart),
    takeAwaken: (actor) => actor.takeAwaken(),
    takeRevive: (actor) => actor.takeRevive(),
  };

  const actionMessages = {
    takeDamage: (name, amt) => `${name} took ${amt} damage`,
    takeDrain: (name, amt) => `${name} took ${amt} drain`,
    takeWither: (name, amt) => `${name} took ${amt} wither`,
    takeHeal: (name, amt) => `${name} gained ${amt} HP`,
    takeRevitalize: (name, amt) => `${name} gained ${amt} MP`,
    takeSetTempHp: (name, actor) => `${name} now has ${actor.system.hp.temp} temporary HP`,
    takeSetTempMp: (name, actor) => `${name} now has ${actor.system.mp.temp} temporary MP`,
    takeGainTempHp: (name, amt) => `${name} gained ${amt} temporary HP`,
    takeGainTempMp: (name, amt) => `${name} gained ${amt} temporary MP`,
    takeSleep: (name) => `Did sleep check for ${name}`,
    takeKill: (name) => `Did kill check for ${name}`,
    takePay: (name, amt) => `${name} paid ${amt} ₲`,
    takeHack: (name, _, bodyPart) => `Hacked ${bodyPart} for ${name}`,
    takeUnhack: (name, _, bodyPart) => `Unhacked ${bodyPart} for ${name}`,
    takeAwaken: (name) => `Awakened ${name}`,
    takeRevive: (name) => `Revived ${name}`,
  };

  const actionFn = actionMap[action];
  if (!actionFn) return;

  for (const actor of actors) {
    if (!actor) continue;

    await actionFn(actor, amount, data);

    const messageFn = actionMessages[action];
    if (messageFn) {
      const message = messageFn(actor.name, amount === undefined ? actor : amount, data);
      ui.notifications.info(message);
    }
  }
}

/**
 * Toggle a status effect on multiple actors.
 *
 * @param {TeriockActor[]} actors - Array of actors to toggle the status effect on
 * @param {string} status - The status effect identifier
 * @param {boolean} active - Whether to activate (true) or deactivate (false) the status
 * @returns {Promise<void>}
 */
async function toggleStatusEffect(actors, status, active) {
  if (!status) {
    ui.notifications.error("No status specified.");
    return;
  }

  for (const actor of actors) {
    if (actor && typeof actor.toggleStatusEffect === "function") {
      await actor.toggleStatusEffect(status, { active });
      const statusText = active ? "now" : "no longer";
      ui.notifications.info(`${actor.name} is ${statusText} ${CONFIG.TERIOCK.conditions[status].toLowerCase()}`);
    }
  }
}

/**
 * Handle applying or removing effects on multiple actors.
 *
 * @param {TeriockActor[]} actors - Array of actors to apply/remove effects on
 * @param {string} effectData - JSON string containing effect data
 * @param {boolean} [remove=false] - Whether to remove the effect instead of applying it
 * @returns {Promise<void>}
 */
async function handleEffectAction(actors, effectData, remove = false) {
  let effectObj = null;
  try {
    effectObj = JSON.parse(effectData);
  } catch (e) {
    ui.notifications.error("Failed to parse effect data.");
    return;
  }

  for (const actor of actors) {
    if (!actor) continue;

    if (remove) {
      if (typeof actor.deleteEmbeddedDocuments === "function") {
        const found = actor.effects.find((e) => e.name === effectObj.name);
        if (found) {
          await actor.deleteEmbeddedDocuments("ActiveEffect", [found.id]);
          ui.notifications.info(`Removed effect: ${effectObj.name}`);
        } else {
          ui.notifications.warn(`Effect not found: ${effectObj.name}`);
        }
      }
    } else {
      if (typeof actor.createEmbeddedDocuments === "function") {
        await actor.createEmbeddedDocuments("ActiveEffect", [effectObj]);
        ui.notifications.info(`Applied effect: ${effectObj.name}`);
      }
    }
  }
}

/**
 * Perform roll-based actions on multiple actors.
 *
 * @param {TeriockActor[]} actors - Array of actors to perform rolls for
 * @param {string} action - The roll action to perform (e.g., "rollResistance", "rollFeatSave")
 * @param {any} data - Data needed for the roll action
 * @param {object} [options={}] - Roll options including advantage/disadvantage
 * @returns {Promise<void>}
 */
async function performRollAction(actors, action, data, options = {}) {
  const rollActions = {
    rollResistance: (actor) => actor.rollResistance(options),
    rollFeatSave: (actor) => actor.rollFeatSave(data, options),
    rollTradecraft: (actor) => actor.rollTradecraft(data, options),
  };

  const rollFn = rollActions[action];
  if (!rollFn) return;

  for (const actor of actors) {
    if (actor && typeof rollFn === "function") {
      rollFn(actor);
    }
  }
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
 * Add context menu (right-click) event listeners to multiple elements.
 *
 * @param {NodeList} elements - Collection of DOM elements to add listeners to
 * @param {Function} handler - Context menu event handler function
 * @returns {void}
 */
function addContextMenuHandler(elements, handler) {
  elements.forEach((element) => {
    element.addEventListener("contextmenu", handler);
  });
}

/**
 * Handle roll button actions for both click and context menu events.
 *
 * @param {MouseEvent} event - The click or context menu event
 * @param {boolean} useBoostDialog - Whether to use the boost dialog for formulas
 * @returns {Promise<void>}
 */
async function handleRollButtonAction(event, useBoostDialog = false) {
  /** @type {HTMLButtonElement} */
  const target = event.currentTarget;
  const data = target.dataset;
  const action = data.action;
  const formula = data.data;
  const actors = getTargetActors();
  const options = getModifierOptions(event);

  if (actors.length === 0) return;

  // Roll actions with formulas
  const rollActions = [
    "takeDamage",
    "takeDrain",
    "takeWither",
    "takeHeal",
    "takeRevitalize",
    "takeSetTempHp",
    "takeSetTempMp",
    "takeGainTempHp",
    "takeGainTempMp",
    "takeSleep",
    "takeKill",
    "takePay",
  ];

  const actionLabels = {
    takeDamage: "Apply Damage",
    takeDrain: "Apply Drain",
    takeWither: "Apply Wither",
    takeHeal: "Apply Healing",
    takeRevitalize: "Apply Revitalization",
    takeSetTempHp: "Set Temp HP",
    takeSetTempMp: "Set Temp MP",
    takeGainTempHp: "Gain Temp HP",
    takeGainTempMp: "Gain Temp MP",
    takeSleep: "Sleep",
    takeKill: "Kill",
    takePay: "Pay Gold",
  };

  const actionIcons = {
    takeDamage: "fa-heart",
    takeDrain: "fa-brain",
    takeWither: "fa-hourglass-half",
    takeSleep: "fa-bed",
    takeKill: "fa-skull",
    takePay: "fa-coin",
  };

  const actionClasses = {
    takeDamage: "damage-button",
    takeDrain: "drain-button",
    takeWither: "wither-button",
    takePay: "payment-button",
  };

  if (rollActions.includes(action) && formula) {
    let finalFormula = formula;

    // Use boost dialog if requested (right-click)
    if (useBoostDialog) {
      finalFormula = await boostDialog(formula);
      if (finalFormula === null) return; // User cancelled the dialog
    }

    const context = {
      buttons: [
        {
          label: actionLabels[action] || "Apply to Targets",
          icon: `fa-solid ${actionIcons[action] || "fa-plus"}`,
          action: action,
          classes: `apply-result ${actionClasses[action] || ""}`,
        },
      ],
    };

    for (const actor of actors) {
      const roll = new TeriockRoll(finalFormula, actor.getRollData(), { context });
      if (options.double) {
        roll.alter(2, 0);
      }
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
      });
    }
  }

  // Handle specific actions
  if (action === "rollResistance") {
    await performRollAction(actors, action, null, options);
  }

  if (action === "rollFeatSave") {
    // const attr = event.currentTarget.getAttribute("data-data");
    const attr = target.dataset.data;
    // const total = event.currentTarget.getAttribute("data-total");
    const total = target.dataset.total;
    const threshold = total ? Number(total) : undefined;
    const rollOptions = threshold !== undefined ? { ...options, threshold } : options;
    await performRollAction(actors, action, attr, rollOptions);
  }

  if (action === "rollTradecraft") {
    // const tradecraftKey = event.currentTarget.getAttribute("data-data");
    const tradecraftKey = target.dataset.data;
    await performRollAction(actors, action, tradecraftKey, options);
  }

  if (action === "applyEffect") {
    // const effectData = event.currentTarget.getAttribute("data-data");
    const effectData = target.dataset.data;
    await handleEffectAction(actors, effectData);
  }

  if (action === "takeHack") {
    // const bodyPart = event.currentTarget.getAttribute("data-data");
    const bodyPart = target.dataset.data;
    await applyActorAction(actors, action, undefined, bodyPart);
  }

  if (action === "takeAwaken") {
    await applyActorAction(actors, action);
  }

  if (action === "takeRevive") {
    await applyActorAction(actors, action);
  }

  if (action === "applyStatus") {
    // const status = event.currentTarget.getAttribute("data-data");
    const status = target.dataset.data;
    await toggleStatusEffect(actors, status, true);
  }

  if (action === "removeStatus") {
    // const status = event.currentTarget.getAttribute("data-data");
    const status = target.dataset.data;
    await toggleStatusEffect(actors, status, false);
  }
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
      if (document.type === "equipment" && document.system.attuned && updateData.system.tier) {
        const attunement = document.system.attunement;
        if (attunement) {
          await attunement.update({
            "system.tier": document.system.tier.derived,
          });
        }
      }
      await document.actor.postUpdate();
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
          await document.system.unequip();
        }
      }
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate();
    }
  });

  foundry.helpers.Hooks.on("deleteItem", async (document, options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate();
    }
  });

  foundry.helpers.Hooks.on("createActiveEffect", async (document, options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      if (document.type === "ability" || document.type === "effect") {
        if (document.system.subIds?.length > 0) {
          const subAbilityData = [];
          let subs = document.subs;
          if (subs[0] === null) {
            subs = await document.subsAsync();
          }
          for (const subAbility of subs) {
            const data = foundry.utils.duplicate(subAbility);
            data.system.supId = document._id;
            subAbilityData.push(data);
          }
          const newSubAbilities = await document.parent.createEmbeddedDocuments("ActiveEffect", subAbilityData);
          const newSubIds = newSubAbilities.map((ability) => ability._id);
          await document.update({
            "system.subIds": newSubIds,
          });
          await document.unlockHierarchy();
        }
      }
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate({ checkDown: true });
    }
  });

  foundry.helpers.Hooks.on("deleteActiveEffect", async (document, options, userId) => {
    if (isOwnerAndCurrentUser(document, userId)) {
      if (document.type === "ability" || document.type === "effect") {
        if (document.system.supId) {
          const sup = document.parent.getEmbeddedDocument("ActiveEffect", document.system.supId);
          if (sup) {
            const subIds = sup.system.subIds.filter((id) => id !== document._id);
            await sup.update({ "system.subIds": subIds });
          }
        }
        if (document.system.subIds?.length > 0) {
          const subIds = document.system.subIds;
          await document.parent.deleteEmbeddedDocuments("ActiveEffect", subIds);
        }
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
    new ux.ContextMenu(html, ".timage", imageContextMenuOptions, {
      eventName: "contextmenu",
      jQuery: false,
      fixed: true,
    });

    // Image click handler
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

    // Harm buttons
    addClickHandler(html.querySelectorAll(".harm-button"), async (event) => {
      const data = event.currentTarget.dataset;
      const amount = parseInt(data.amount);
      const type = data.type || "damage";
      const targets = game.user?.targets;
      for (const target of targets) {
        const actor = target.actor;
        if (!actor) continue;
        await applyActorAction([actor], `take${type.charAt(0).toUpperCase() + type.slice(1)}`, amount);
      }
    });

    // Open tags
    addClickHandler(html.querySelectorAll('[data-action="open"]'), async (event) => {
      event.preventDefault();
      const uuid = event.currentTarget.getAttribute("data-uuid");
      if (!uuid) return;
      const doc = /** @type{ClientDocument} */ await foundry.utils.fromUuid(uuid);
      if (doc && typeof doc.sheet?.render === "function") {
        await doc.sheet.render(true);
      }
    });

    // REPLACE THE OLD MAIN ROLL BUTTONS CODE WITH THIS:
    // Main roll buttons - left click (normal behavior)
    addClickHandler(html.querySelectorAll(".teriock-chat-button"), async (event) => {
      await handleRollButtonAction(event, false);
    });

    // Main roll buttons - right click (with boost dialog)
    addContextMenuHandler(html.querySelectorAll(".teriock-chat-button"), async (event) => {
      event.preventDefault();
      await handleRollButtonAction(event, true);
    });

    // Apply result buttons (these stay the same)
    addClickHandler(html.querySelectorAll(".apply-result"), async (event) => {
      const data = event.currentTarget.dataset;
      const amount = parseInt(data.total);
      const action = data.action;
      const actors = getTargetActors();

      if (actors.length === 0) return;

      if (action === "takeHack") {
        const bodyPart = data.data;
        await applyActorAction(actors, action, undefined, bodyPart);
      } else {
        await applyActorAction(actors, action, amount);
      }
    });

    // REMOVE OR REPLACE THE OLD CONTEXT MENU HANDLERS:
    // These old context menu handlers can be removed since they're now handled by the main button handler:
    /*
    addContextMenuHandler(html.querySelectorAll('.teriock-chat-button[data-action="applyEffect"]'), async (event) => {
      // This is now handled by the main handleRollButtonAction function
    });

    addContextMenuHandler(html.querySelectorAll('.teriock-chat-button[data-action="applyStatus"]'), async (event) => {
      // This is now handled by the main handleRollButtonAction function
    });

    addContextMenuHandler(html.querySelectorAll('.teriock-chat-button[data-action="removeStatus"]'), async (event) => {
      // This is now handled by the main handleRollButtonAction function
    });

    addContextMenuHandler(html.querySelectorAll('.teriock-chat-button[data-action="takeHack"]'), async (event) => {
      // This is now handled by the main handleRollButtonAction function
    });
    */

    // Target container handlers (these stay the same)
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

  foundry.helpers.Hooks.on("hotbarDrop", async (bar, data, slot) => {
    fromUuid(data.uuid).then(
      /** @param {TeriockItem|TeriockEffect} item */ async (item) => {
        if (!item || !["Item", "ActiveEffect"].includes(item.documentName)) return;
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
          (m) => m.name === macroName && m.command?.startsWith(`// ID: ${id}`),
        );
        /** @type {TeriockUser} */
        const user = game.user;
        if (!macro) {
          macro = /** @type {TeriockMacro} */ await Macro.create({
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
            await user.assignHotbarMacro(macro, slot);
          }
        } else {
          await user.assignHotbarMacro(macro, slot);
        }
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
      if (actor.effectKeys?.effect?.has("brace")) {
        actor.update({ "system.hp.temp": 0 });
      }
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
