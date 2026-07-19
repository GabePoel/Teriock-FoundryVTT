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
      /** @type {Map<string, TeriockContextMenu>} */
      #contextMenus = new Map();

      /**
       * Creates a context menu for elements, or returns the one already connected for this selector.
       * @param {string} cssClass - The CSS class for elements to attach the menu to.
       * @param {ContextMenuEntry[]} menuItems - The context menu items.
       * @param {Foundry.ContextMenuOptions} [options]
       * @returns {TeriockContextMenu} The connected context menu.
       */
      _connectContextMenu(cssClass, menuItems, options = {}) {
        const existing = this.#contextMenus.get(cssClass);
        if (existing) { return existing; }
        const menu = new TeriockContextMenu(this.element, cssClass, menuItems, {
          eventName: "click",
          jQuery: false,
          ...options,
        });
        this.#contextMenus.set(cssClass, menu);
        return menu;
      }
    }
  );
}
