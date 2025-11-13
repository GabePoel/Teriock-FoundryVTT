import { bindCommonActions } from "../_module.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @param {typeof ApplicationV2} Base
 * @constructor
 */
export default function RichApplicationMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ApplicationV2}
     * @mixes HandlebarsApplicationMixin
     * @mixin
     */
    class RichApplication extends HandlebarsApplicationMixin(Base) {
      /**
       * Assigns overall rules to tooltips of card containers.
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      async _initRichTooltipOrientation(target) {
        const rect = target.getBoundingClientRect();
        const leftSpace = rect.left;
        const rightSpace = window.innerWidth - rect.right;

        // Determine tooltip direction
        if (rightSpace >= 350) {
          target.dataset.tooltipDirection = "RIGHT";
        } else {
          target.dataset.tooltipDirection =
            leftSpace > rightSpace ? "LEFT" : "RIGHT";
        }
      }

      /** @inheritDoc */
      async _onRender(options) {
        await super._onRender(options);
        this.element.querySelectorAll(".tcard-container").forEach((element) => {
          element.addEventListener(
            "pointerenter",
            async function () {
              await this._initRichTooltipOrientation(element);
            }.bind(this),
          );
        });
        bindCommonActions(this.element);
      }
    }
  );
}
