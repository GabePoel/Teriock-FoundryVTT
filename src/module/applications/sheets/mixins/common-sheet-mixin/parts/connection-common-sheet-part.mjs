import { toTitleCase } from "../../../../../helpers/string.mjs";
import { makeIcon } from "../../../../../helpers/utils.mjs";
import { TeriockContextMenu } from "../../../../ux/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     */
    class ConnectionCommonSheetPart extends Base {
      /**
       * Connects event handlers to elements matching a selector.
       * @param {string} selector - The CSS selector for elements to connect.
       * @param {string} eventType - The event type to listen for.
       * @param {Function} handler - The event handler function.
       */
      _connect(selector, eventType, handler) {
        this.element.querySelectorAll(selector).forEach((el) =>
          el.addEventListener(eventType, (e) => {
            e.stopPropagation();
            e.preventDefault();
            handler(e);
          }),
        );
      }

      /**
       * Build and connect context menu entries that update this document from some object.
       * @param {string} cssClass - The CSS class for elements to attach the menu to.
       * @param {object} obj - Object with keys, names, and icons.
       * @param {string} path - Path of document to update.
       * @param {string} eventName - The event name to trigger the menu.
       */
      _connectBuildContextMenu(cssClass, obj, path, eventName) {
        this._connectContextMenu(
          cssClass,
          Object.entries(obj).map(([k, v]) => {
            return {
              name: v.name || toTitleCase(k),
              icon: makeIcon(v.icon, "contextMenu"),
              callback: async () => {
                await this.document.update({ [path]: k });
              },
            };
          }),
          eventName,
        );
      }

      /**
       * Creates a context menu for elements.
       * @param {string} cssClass - The CSS class for elements to attach the menu to.
       * @param {object[]} menuItems - The context menu items.
       * @param {string} eventName - The event name to trigger the menu.
       * @param {"up"|"down"} [direction] - Direction for the context menu to expand.
       * @returns {ContextMenu} The created context menu.
       */
      _connectContextMenu(cssClass, menuItems, eventName, direction) {
        return /** @type {ContextMenu} */ new TeriockContextMenu(
          this.element,
          cssClass,
          menuItems,
          {
            eventName,
            jQuery: false,
            fixed: false,
            forceDirection: direction,
          },
        );
      }
    }
  );
};
