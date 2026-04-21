import { icons } from "../../constants/display/icons.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { dedent } from "../../helpers/string.mjs";
import { makeIcon } from "../../helpers/utils.mjs";

const { ImagePopout } = foundry.applications.apps;

/**
 * Context menu options for image elements.
 * Provides options to open images in a dedicated sheet or share them in chat.
 * @type {Array}
 */
const imageContextMenuOptions = [
  {
    label: "TERIOCK.SYSTEMS.Child.MENU.openImage",
    icon: makeIcon(icons.ui.image, "contextMenu"),
    onClick: async (_ev, target) => {
      await new ImagePopout({
        src: target.getAttribute("src"),
        window: {
          title: "TERIOCK.SYSTEMS.Child.MENU.imagePreview",
        },
      }).render(true);
    },
    visible: (target) => {
      const src = target.getAttribute("src");
      return (
        src &&
        src.length > 0 &&
        target.getAttribute("data-openable") &&
        (game.user.isGM || game.teriock.getSetting("openChatImages"))
      );
    },
  },
  {
    label: "TERIOCK.SYSTEMS.Child.MENU.shareImage",
    icon: makeIcon(icons.ui.shareImage, "contextMenu"),
    onClick: async (_ev, target) => {
      await chatImage(target.getAttribute("src"));
    },
    visible: (target) => {
      const src = target.getAttribute("src");
      return src && src.length > 0 && target.getAttribute("data-shareable");
    },
  },
  {
    label: "TERIOCK.SYSTEMS.Child.MENU.openDocument",
    icon: makeIcon(icons.ui.openWindow, "contextMenu"),
    onClick: async (_ev, target) => {
      const uuid = target.getAttribute("data-uuid");
      if (uuid) {
        const doc = await fromUuid(uuid);
        if (doc) await doc.sheet.render(true);
      }
    },
    visible: (target) =>
      target.getAttribute("data-openable-document") &&
      target.getAttribute("data-uuid") &&
      (game.user.isGM || game.teriock.getSetting("openChatDocuments")),
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
    const messageData = {
      content: dedent(`
        <div
          class="timage"
          data-src="${img}"
          style="display: flex; justify-content: center;"
        >
          <img src="${img}" class="teriock-image" alt="Image" data-openable="true">
        </div>`),
    };
    await TeriockChatMessage.create(messageData, { defaultMode: true });
  }
}
