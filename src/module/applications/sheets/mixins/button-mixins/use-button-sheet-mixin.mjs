import { makeIconClass } from "../../../../helpers/utils.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function UseButtonSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     */
    class UseButtonSheet extends Base {
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
    }
  );
}
