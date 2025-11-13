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
            icon: "fa-solid fa-dice",
            label: "Use This",
            action: "rollThis",
          },
        ],
      },
    };
  };
}
