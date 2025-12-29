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
            icon: makeIconClass("comment", "contextMenu"),
            label: "Share in Chat",
          },
        ],
      },
    };
  };
}
