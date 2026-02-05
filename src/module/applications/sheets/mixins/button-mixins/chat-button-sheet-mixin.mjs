import { icons } from "../../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function ChatButtonSheetMixin(Base) {
  /**
   * @extends {TeriockDocumentSheet}
   * @mixin
   */
  return class ChatButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      window: {
        controls: [
          {
            action: "chatThis",
            icon: makeIconClass(icons.ui.chat, "contextMenu"),
            label: "Share in Chat",
          },
        ],
      },
    };
  };
}
