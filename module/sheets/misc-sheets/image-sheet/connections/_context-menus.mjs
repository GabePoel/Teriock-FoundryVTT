import { chatImage } from "../../../../helpers/utils.mjs";
import TeriockImageSheet from "../image-sheet.mjs";

export const imageContextMenuOptions = [
  {
    name: "Open Image",
    icon: '<i class="fa-solid fa-image"></i>',
    callback: async (target) => {
      const img = target.getAttribute("data-src");
      const image = new TeriockImageSheet(img);
      image.render(true);
    },
    condition: (target) => {
      const img = target.getAttribute("data-src");
      return img && img.length > 0;
    },
  },
  {
    name: "Share Image",
    icon: '<i class="fa-solid fa-share"></i>',
    callback: async (target) => {
      const img = target.getAttribute("data-src");
      await chatImage(img);
    },
  },
];
