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
    name: "Open Image",
    icon: makeIcon("image", "contextMenu"),
    callback: async (target) => {
      await new ImagePopout({
        src: target.getAttribute("src"),
        window: { title: "Image Preview" },
      }).render(true);
    },
    condition: (target) => {
      const src = target.getAttribute("src");
      return src && src.length > 0 && target.getAttribute("data-openable");
    },
  },
  {
    name: "Share Image",
    icon: makeIcon("share", "contextMenu"),
    callback: async (target) => {
      await chatImage(target.getAttribute("src"));
    },
    condition: (target) => {
      const src = target.getAttribute("src");
      return src && src.length > 0 && target.getAttribute("data-shareable");
    },
  },
  {
    name: "Open Document",
    icon: makeIcon("arrow-up-right-from-square", "contextMenu"),
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
