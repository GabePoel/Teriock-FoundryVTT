import { icons } from "../../constants/display/icons.mjs";
import { makeIcon } from "../../helpers/utils.mjs";
import { previewSheet } from "./_module.mjs";

const { ImagePopout } = foundry.applications.apps;

/**
 * Context menu options for image elements.
 * Provides options to open images in a dedicated sheet or share them in chat.
 * @type {Array}
 */
const imageContextMenuOptions = [
  {
    name: game.i18n.localize("TERIOCK.SYSTEMS.Child.MENU.openImage"),
    icon: makeIcon(icons.ui.image, "contextMenu"),
    callback: async (target) => {
      await new ImagePopout({
        src: target.getAttribute("src"),
        window: {
          title: game.i18n.localize("TERIOCK.SYSTEMS.Child.MENU.imagePreview"),
        },
      }).render(true);
    },
    condition: (target) => {
      const src = target.getAttribute("src");
      return src && src.length > 0 && target.getAttribute("data-openable");
    },
  },
  {
    name: game.i18n.localize("TERIOCK.SYSTEMS.Child.MENU.shareImage"),
    icon: makeIcon(icons.ui.shareImage, "contextMenu"),
    callback: async (target) => {
      await chatImage(target.getAttribute("src"));
    },
    condition: (target) => {
      const src = target.getAttribute("src");
      return src && src.length > 0 && target.getAttribute("data-shareable");
    },
  },
  {
    name: game.i18n.localize("TERIOCK.SYSTEMS.Child.MENU.openDocument"),
    icon: makeIcon(icons.ui.openWindow, "contextMenu"),
    callback: async (target) => {
      const uuid = target.getAttribute("data-uuid");
      if (uuid) {
        const doc = await fromUuid(uuid);
        if (doc) {
          await previewSheet(doc);
        }
      }
    },
    condition: (target) =>
      target.getAttribute("data-openable-document") &&
      target.getAttribute("data-uuid"),
  },
];
export default imageContextMenuOptions;

/**
 * Creates a chat message with an image.
 * @param {string} img - The image URL to display in chat.
 * @returns {Promise<void>}
 */
export async function chatImage(img) {
  if (img) {
    await foundry.documents.ChatMessage.create({
      content: `
        <div
          class="timage"
          data-src="${img}"
          style="display: flex; justify-content: center;"
        >
          <img src="${img}" class="teriock-image" alt="Image">
        </div>`,
    });
  }
}
