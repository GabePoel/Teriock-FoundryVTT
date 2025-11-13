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
            icon: "fa-solid fa-comment",
            label: "Share in Chat",
            action: "chatThis",
          },
        ],
      },
    };
  };
}
