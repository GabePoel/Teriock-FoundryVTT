import TeriockImageSheet from "../../applications/sheets/misc-sheets/image-sheet/image-sheet.mjs";
import { dispatch } from "../command/dispatch.mjs";
import { addClickHandler } from "../html.mjs";

export default function registerChatManagementHooks() {
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
          /** @type{ClientDocument} */ await foundry.utils.fromUuid(uuid);
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
        /** @type {Teriock.UUID<TeriockTokenDocument>} */
        const uuid = container.getAttribute("data-uuid");
        if (!uuid) return;

        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
          return;
        }

        clickTimeout = setTimeout(async () => {
          const doc = await foundry.utils.fromUuid(uuid);
          if (doc.isOwner) {
            if (doc.token?.object) {
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

        const doc = await foundry.utils.fromUuid(uuid);
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
}
