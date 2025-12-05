import { makeIconClass } from "../../../../helpers/utils.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 * @constructor
 */
export default function ChatButtonSheetMixin(Base) {
  /**
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
