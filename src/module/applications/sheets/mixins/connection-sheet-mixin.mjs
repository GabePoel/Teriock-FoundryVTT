import { TeriockContextMenu } from "../../ux/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function ConnectionSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     */
    class ConnectionSheet extends Base {
      /**
       * Creates a context menu for elements.
       * @param {string} cssClass - The CSS class for elements to attach the menu to.
       * @param {ContextMenuEntry[]} menuItems - The context menu items.
       * @param {Foundry.ContextMenuOptions} [options]
       * @returns {TeriockContextMenu} The created context menu.
       */
      _connectContextMenu(cssClass, menuItems, options = {}) {
        return new TeriockContextMenu(this.element, cssClass, menuItems, {
          eventName: "click",
          jQuery: false,
          ...options,
        });
      }
    }
  );
}
