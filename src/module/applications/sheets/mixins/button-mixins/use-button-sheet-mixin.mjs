import { makeIconClass } from "../../../../helpers/utils.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 */
export default function UseButtonSheetMixin(Base) {
  /**
   * @extends {DocumentSheetV2}
   * @mixin
   */
  return class UseButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      window: {
        controls: [
          {
            action: "rollThis",
            icon: makeIconClass("dice", "contextMenu"),
            label: "Use This",
          },
        ],
      },
    };
  };
}
