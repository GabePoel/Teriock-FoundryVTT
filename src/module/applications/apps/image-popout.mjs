import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { chatImage } from "../shared/image-context-menu-options.mjs";

const { ImagePopout } = foundry.applications.apps;

/** @inheritDoc */
export default class TeriockImagePopout extends ImagePopout {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: {
      shareInChat: this.#shareInChat,
    },
    window: {
      controls: [
        {
          action: "shareInChat",
          icon: makeIconClass(icons.ui.shareImage, "contextMenu"),
          label: "TERIOCK.SYSTEMS.Child.MENU.shareInChat",
        },
      ],
    },
  };

  /**
   * Share this image in chat.
   * @return {Promise<void>}
   */
  static async #shareInChat() {
    await chatImage(this.options.src);
  }
}
