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
      document.getActor()?.buildEffectTypes();
      await document.getActor()?.postUpdate();
    }
  });

  Hooks.on("deleteItem", async (document, options, userId) => {
    if (game.user.id === userId && document.isOwner) {
      document.getActor()?.buildEffectTypes();
      await document.getActor()?.postUpdate();
    }
  });

  Hooks.on("createActiveEffect", async (document, options, userId) => {
    if (game.user.id === userId && document.isOwner) {
      if (document.type === "ability") {
        if (document.system.childIds?.length > 0) {
          const childAbilityData = [];
          for (const childAbility of await document.getChildrenAsync()) {
            const data = foundry.utils.duplicate(childAbility);
            data.system.parentId = document._id;
            childAbilityData.push(data);
          }
          const newChildAbilities = await document.parent.createEmbeddedDocuments("ActiveEffect", childAbilityData);
          const newChildIds = newChildAbilities.map((ability) => ability._id);
          await document.update({
            "system.childIds": newChildIds,
          });
          await document.unsaveFamily();
        }
      }
      document.getActor()?.buildEffectTypes();
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
      document.getActor()?.buildEffectTypes();
      await document.getActor()?.postUpdate();
    }
  });

  // TODO: This might not be needed anymore.
  Hooks.on("updateActiveEffect", async (document, updateData, options, userId) => {
    console.debug(`Teriock | Active Effect updated: ${document.name}`, updateData);
    if (game.user.id === userId && document.isOwner && document.type === "ability") {
      const parent = document.getParent();
      if (parent && typeof parent.update === "function") {
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
    // Add event listener for roll buttons in chat
    const rollButtons = html.querySelectorAll(".teriock-chat-button");
    rollButtons.forEach((button) => {
      if (button) {
        button.addEventListener("click", async (event) => {
          const data = event.currentTarget.dataset;
          const action = data.action;
          const formula = data.data;
          // Determine actors: prefer selected tokens, else character, else do nothing
          let actors = [];
          if (canvas.tokens?.controlled?.length > 0) {
            actors = canvas.tokens.controlled.map((t) => t.actor).filter(Boolean);
          } else if (game.user.character) {
            actors = [game.user.character];
          }
          let double = false;
          if (event.ctrlKey) double = true;
          if (actors.length === 0) return;
          // List of supported roll actions
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
          ];
          // Map action to button label
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
          };
          const actionIcons = {
            takeDamage: "fa-heart",
            takeDrain: "fa-brain",
            takeWither: "fa-hourglass-half",
          };
          const actionClasses = {
            takeDamage: "damage-button",
            takeDrain: "drain-button",
            takeWither: "wither-button",
          };
          if (rollActions.includes(action) && formula) {
            // Roll the formula using TeriockRoll for each actor
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
              const roll = new game.teriock.TeriockRoll(formula, actor.getRollData(), { context });
              if (double) {
                roll.alter(2, 0);
              }
              await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
              });
            }
          }
          if (action === "rollResistance") {
            const attr = button.getAttribute("data-data");
            const options = {};
            if (event.altKey) options.advantage = true;
            if (event.shiftKey) options.disadvantage = true;
            for (const actor of actors) {
              if (actor && typeof actor.rollResistance === "function") {
                actor.rollResistance(options);
              }
            }
          }
          if (action === "rollFeatSave") {
            const attr = button.getAttribute("data-data");
            const total = button.getAttribute("data-total");
            const threshold = total ? Number(total) : undefined;
            const options = threshold !== undefined ? { threshold } : {};
            if (event.altKey) options.advantage = true;
            if (event.shiftKey) options.disadvantage = true;
            for (const actor of actors) {
              if (typeof actor.rollFeatSave === "function") {
                actor.rollFeatSave(attr, options);
              }
            }
          }
          if (action === "applyEffect") {
            const effectData = button.getAttribute("data-data");
            let effectObj = null;
            try {
              effectObj = JSON.parse(effectData);
            } catch (e) {
              ui.notifications.error("Failed to parse effect data.");
              return;
            }
            for (const actor of actors) {
              if (actor && typeof actor.createEmbeddedDocuments === "function") {
                await actor.createEmbeddedDocuments("ActiveEffect", [effectObj]);
                ui.notifications.info(`Applied effect: ${effectObj.name}`);
              }
            }
          }
          if (action === "takeHack") {
            const bodyPart = button.getAttribute("data-data");
            for (const actor of actors) {
              if (actor && typeof actor.takeHack === "function") {
                await actor.takeHack(bodyPart);
                ui.notifications.info(`Hacked ${bodyPart} for ${actor.name}`);
              }
            }
          }
          if (action === "takeAwaken") {
            for (const actor of actors) {
              if (actor && typeof actor.takeAwaken === "function") {
                await actor.takeAwaken();
                ui.notifications.info(`Awakened ${actor.name}`);
              }
            }
          }
          if (action === "applyStatus") {
            const status = button.getAttribute("data-data");
            if (!status) {
              ui.notifications.error("No status specified.");
              return;
            }
            for (const actor of actors) {
              if (actor && typeof actor.toggleStatusEffect === "function") {
                await actor.toggleStatusEffect(status, { active: true });
                ui.notifications.info(`${actor.name} is now ${CONFIG.TERIOCK.conditions[status].toLowerCase()}`);
              }
            }
          }
          if (action === "removeStatus") {
            const status = button.getAttribute("data-data");
            if (!status) {
              ui.notifications.error("No status specified.");
              return;
            }
            for (const actor of actors) {
              if (actor && typeof actor.toggleStatusEffect === "function") {
                await actor.toggleStatusEffect(status, { active: false });
                ui.notifications.info(`${actor.name} is no longer ${CONFIG.TERIOCK.conditions[status].toLowerCase()}`);
              }
            }
          }
          if (action === "rollTradecraft") {
            const tradecraftKey = button.getAttribute("data-data");
            const options = {};
            if (event.altKey) options.advantage = true;
            if (event.shiftKey) options.disadvantage = true;
            for (const actor of actors) {
              if (actor && typeof actor.rollTradecraft === "function") {
                actor.rollTradecraft(tradecraftKey, options);
              }
            }
          }
        });
      }
    });
    // Add event listener for apply-result buttons
    html.querySelectorAll(".apply-result").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const data = event.currentTarget.dataset;
        const amount = parseInt(data.total);
        let actors = [];
        if (canvas.tokens?.controlled?.length > 0) {
          actors = canvas.tokens.controlled.map((t) => t.actor).filter(Boolean);
        } else if (game.user.character) {
          actors = [game.user.character];
        }
        if (actors.length === 0) return;
        const action = data.action;
        for (const actor of actors) {
          if (!actor) continue;
          if (action === "takeDamage") {
            await actor.takeDamage(amount);
            ui.notifications.info(`${actor.name} took ${amount} damage`);
          } else if (action === "takeDrain") {
            await actor.takeDrain(amount);
            ui.notifications.info(`${actor.name} took ${amount} drain`);
          } else if (action === "takeWither") {
            await actor.takeWither(amount);
            ui.notifications.info(`${actor.name} took ${amount} wither`);
          } else if (action === "takeHeal") {
            await actor.takeHeal(amount);
            ui.notifications.info(`${actor.name} gained ${amount} HP`);
          } else if (action === "takeRevitalize") {
            await actor.takeRevitalize(amount);
            ui.notifications.info(`${actor.name} gained ${amount} MP`);
          } else if (action === "takeSetTempHp") {
            await actor.takeSetTempHp(amount);
            ui.notifications.info(`${actor.name} now has ${actor.system.hp.temp} temporary HP`);
          } else if (action === "takeSetTempMp") {
            await actor.takeSetTempMp(amount);
            ui.notifications.info(`${actor.name} now has ${actor.system.mp.temp} temporary MP`);
          } else if (action === "takeGainTempHp") {
            await actor.takeGainTempHp(amount);
            ui.notifications.info(`${actor.name} gained ${amount} temporary HP`);
          } else if (action === "takeGainTempMp") {
            await actor.takeGainTempMp(amount);
            ui.notifications.info(`${actor.name} gained ${amount} temporary MP`);
          } else if (action === "takeSleep") {
            await actor.takeSleep(amount);
            ui.notifications.info(`Did sleep check for ${actor.name}`);
          } else if (action === "takeKill") {
            await actor.takeKill(amount);
            ui.notifications.info(`Did kill check for ${actor.name}`);
          } else if (action === "takeHack") {
            const bodyPart = data.data;
            await actor.takeHack(bodyPart);
            ui.notifications.info(`Hacked ${bodyPart} for ${actor.name}`);
          }
        }
      });
    });

    // Add right-click (contextmenu) handler for Apply Effect button
    html.querySelectorAll('.teriock-chat-button[data-action="applyEffect"]').forEach((button) => {
      button.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
        const effectData = button.getAttribute("data-data");
        let effectObj = null;
        try {
          effectObj = JSON.parse(effectData);
        } catch (e) {
          ui.notifications.error("Failed to parse effect data.");
          return;
        }
        // Determine actors: prefer selected tokens, else character
        let actors = [];
        if (canvas.tokens?.controlled?.length > 0) {
          actors = canvas.tokens.controlled.map((t) => t.actor).filter(Boolean);
        } else if (game.user.character) {
          actors = [game.user.character];
        }
        if (actors.length === 0) return;
        for (const actor of actors) {
          if (actor && typeof actor.deleteEmbeddedDocuments === "function") {
            // Find the effect by name
            const found = actor.effects.find((e) => e.name === effectObj.name);
            if (found) {
              await actor.deleteEmbeddedDocuments("ActiveEffect", [found.id]);
              ui.notifications.info(`Removed effect: ${effectObj.name}`);
            } else {
              ui.notifications.warn(`Effect not found: ${effectObj.name}`);
            }
          }
        }
      });
    });

    // Add right-click (contextmenu) handler for applyStatus: right-click removes the status
    html.querySelectorAll('.teriock-chat-button[data-action="applyStatus"]').forEach((button) => {
      button.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
        const status = button.getAttribute("data-data");
        if (!status) {
          ui.notifications.error("No status specified.");
          return;
        }
        let actors = [];
        if (canvas.tokens?.controlled?.length > 0) {
          actors = canvas.tokens.controlled.map((t) => t.actor).filter(Boolean);
        } else if (game.user.character) {
          actors = [game.user.character];
        }
        if (actors.length === 0) return;
        for (const actor of actors) {
          if (actor && typeof actor.toggleStatusEffect === "function") {
            await actor.toggleStatusEffect(status, { active: false });
            ui.notifications.info(`${actor.name} is no longer ${CONFIG.TERIOCK.conditions[status].toLowerCase()}`);
          }
        }
      });
    });

    // Add right-click (contextmenu) handler for removeStatus: right-click applies the status
    html.querySelectorAll('.teriock-chat-button[data-action="removeStatus"]').forEach((button) => {
      button.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
        const status = button.getAttribute("data-data");
        if (!status) {
          ui.notifications.error("No status specified.");
          return;
        }
        let actors = [];
        if (canvas.tokens?.controlled?.length > 0) {
          actors = canvas.tokens.controlled.map((t) => t.actor).filter(Boolean);
        } else if (game.user.character) {
          actors = [game.user.character];
        }
        if (actors.length === 0) return;
        for (const actor of actors) {
          if (actor && typeof actor.toggleStatusEffect === "function") {
            await actor.toggleStatusEffect(status, { active: true });
            ui.notifications.info(`${actor.name} is now ${CONFIG.TERIOCK.conditions[status].toLowerCase()}`);
          }
        }
      });
    });

    // Add right-click (contextmenu) handler for takeHack: right-click does unhack
    html.querySelectorAll('.teriock-chat-button[data-action="takeHack"]').forEach((button) => {
      button.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
        const bodyPart = button.getAttribute("data-data");
        let actors = [];
        if (canvas.tokens?.controlled?.length > 0) {
          actors = canvas.tokens.controlled.map((t) => t.actor).filter(Boolean);
        } else if (game.user.character) {
          actors = [game.user.character];
        }
        if (actors.length === 0) return;
        for (const actor of actors) {
          if (actor && typeof actor.takeUnhack === "function") {
            await actor.takeUnhack(bodyPart);
            ui.notifications.info(`Unhacked ${bodyPart} for ${actor.name}`);
          }
        }
      });
    });

    // Add event listeners for .teriock-target-container
    html.querySelectorAll(".teriock-target-container").forEach((container) => {
      let clickTimeout = null;

      container.addEventListener("click", async (event) => {
        event.stopPropagation();
        const uuid = container.getAttribute("data-uuid");
        if (!uuid) return;

        // Clear any existing timeout
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
          return; // This was a double-click, let the dblclick handler deal with it
        }

        // Set timeout for single click
        clickTimeout = setTimeout(async () => {
          const doc = await foundry.utils.fromUuid(uuid);
          if (doc.isOwner) {
            if (doc?.token?.object) {
              doc.token.object.control();
            } else {
              doc.getActiveTokens()[0]?.control();
            }
          }
          clickTimeout = null;
        }, 200); // 200ms delay to detect double-click
      });

      container.addEventListener("dblclick", async (event) => {
        event.stopPropagation();
        const uuid = container.getAttribute("data-uuid");
        if (!uuid) return;

        // Clear single click timeout
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }

        const doc = await foundry.utils.fromUuid(uuid);
        if (doc && doc.sheet && doc.isOwner && typeof doc.sheet.render === "function") {
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

  Hooks.on("applyTokenStatusEffect", (token, statusId, active) => {
    const actor = token.actor;
    if (actor) {
      actor.prepareDerivedData();
    }
  });
}
