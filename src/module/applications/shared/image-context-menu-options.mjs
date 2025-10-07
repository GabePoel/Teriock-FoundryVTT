import { chatImage } from "../../helpers/utils.mjs";
import { TeriockImagePreviewer } from "../api/_module.mjs";

/**
 * Context menu options for image elements.
 * Provides options to open images in a dedicated sheet or share them in chat.
 * @type {Array}
 */
const imageContextMenuOptions = [
  {
    name: "Open Image",
    icon: '<i class="fa-solid fa-image"></i>',
    callback: async (target) => {
      const image = new TeriockImagePreviewer(target.getAttribute("src"));
      await image.render(true);
    },
    condition: (target) => {
      const src = target.getAttribute("src");
      return src && src.length > 0 && target.getAttribute("data-openable");
    },
  },
  {
    name: "Share Image",
    icon: '<i class="fa-solid fa-share"></i>',
    callback: async (target) => {
      await chatImage(target.getAttribute("src"));
    },
    condition: (target) => {
      const src = target.getAttribute("src");
      return src && src.length > 0 && target.getAttribute("data-shareable");
    },
  },
];

export default imageContextMenuOptions;
