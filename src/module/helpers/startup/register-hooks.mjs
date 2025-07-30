import { dispatch } from "../command/dispatch.mjs";
import TeriockImageSheet from "../../applications/sheets/misc-sheets/image-sheet/image-sheet.mjs";

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
      const sup = document.sup;
      if (sup && typeof sup.update === "function") {
        await sup.update({});
        await sup.sheet.render();
      }
      document.actor?.buildEffectTypes();
      await document.actor?.postUpdate();
    }
  });

  foundry.helpers.Hooks.on(
    "createActiveEffect",
    async (document, _options, userId) => {
      if (isOwnerAndCurrentUser(document, userId)) {
        const sup = document.sup;
        if (sup && typeof sup.update === "function") {
          await sup.forceUpdate();
        }
        document.actor?.buildEffectTypes();
        await document.actor?.postUpdate({ checkDown: true });
      }
    },
  );

  foundry.helpers.Hooks.on(
    "deleteActiveEffect",
    async (document, _options, userId) => {
      if (isOwnerAndCurrentUser(document, userId)) {
        const sup = document.sup;
        if (sup && typeof sup.update === "function") {
          await sup.forceUpdate();
        }
        document.actor?.buildEffectTypes();
        await document.actor?.postUpdate({ checkDown: true });
      }
    },
  );

  foundry.helpers.Hooks.on(
    "updateActiveEffect",
    async (document, updateData, _options, userId) => {
      console.debug(
        `Teriock | Active Effect updated: ${document.name}`,
        updateData,
      );
      if (
        isOwnerAndCurrentUser(document, userId) &&
        document.type === "ability"
      ) {
        const sup = document.sup;
        if (sup && typeof sup.update === "function") {
          await sup.update({});
          await sup.sheet.render();
        }
      }
    },
  );

  foundry.helpers.Hooks.on("chatMessage", (_chatLog, message, chatData) => {
    const users = /** @type {WorldCollection<TeriockUser>} */ game.users;
    const sender = users.get(chatData.user);
    if (message.startsWith("/")) return dispatch(message, chatData, sender);
  });

  foundry.helpers.Hooks.on("renderChatMessageHTML", (_message, html) => {
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
    addClickHandler(
      html.querySelectorAll('[data-action="open"]'),
      async (event) => {
        event.preventDefault();
        const uuid = event.currentTarget.getAttribute("data-uuid");
        if (!uuid) return;
        const doc =
          /** @type{ClientDocument} */ await game.teriock.api.utils.fromUuid(
            uuid,
          );
        if (doc && typeof doc.sheet?.render === "function") {
          await doc.sheet.render(true);
        }
      },
    );

    /** TODO: Move to {@link TeriockBaseMessageData} */
    html.querySelectorAll(".teriock-target-container").forEach((container) => {
      let clickTimeout = null;

      container.addEventListener("click", async (event) => {
        event.stopPropagation();
        /** @type {Teriock.UUID<TeriockToken>} */
        const uuid = container.getAttribute("data-uuid");
        if (!uuid) return;

        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
          return;
        }

        clickTimeout = setTimeout(async () => {
          const doc = await game.teriock.api.utils.fromUuid(uuid);
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
        /** @type {Teriock.UUID<TeriockActor>} */
        const uuid = container.getAttribute("data-uuid");
        if (!uuid) return;

        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }

        const doc = await game.teriock.api.utils.fromUuid(uuid);
        if (
          doc &&
          doc.sheet &&
          doc.isOwner &&
          typeof doc.sheet.render === "function"
        ) {
          await doc.sheet.render(true);
        }
      });
    });
  });

  foundry.helpers.Hooks.on(
    "updateWorldTime",
    async (_worldTime, dt, _options, userId) => {
      if (game.user.id === userId && game.user?.isActiveGM) {
        const scene = game.scenes.viewed;
        const tokens = scene.tokens;
        const actors = tokens.map((token) => token.actor);

        for (const actor of actors) {
          // Handle temporary effects expiration
          const effects = actor.temporaryEffects;
          for (const effect of effects) {
            if (typeof effect?.system?.checkExpiration === "function") {
              await effect?.system?.checkExpiration();
            }
          }

          // Update debt with interest if the actor has debt and an interest rate
          const currentDebt = actor.system.money?.debt || 0;
          const dailyInterestRate = actor.system.interestRate || 0;

          if (currentDebt > 0 && dailyInterestRate > 0) {
            // Calculate new debt after interest
            const daysElapsed = dt / 86400; // Convert seconds to days
            const newDebt =
              currentDebt * Math.pow(1 + dailyInterestRate, daysElapsed);

            // Update the actor's debt
            await actor.update({
              "system.money.debt": Math.round(newDebt * 100) / 100, // Round to 2 decimal places
            });
          }

          await actor.forceUpdate();
        }
      }
    },
  );

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
