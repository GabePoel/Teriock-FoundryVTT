import { makeIconClass } from "../../../../helpers/utils.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 * @constructor
 */
export default function UseButtonSheetMixin(Base) {
  /**
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
