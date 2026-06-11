import { makeIcon } from "../../../../../helpers/utils.mjs";
import { TeriockContextMenu } from "../../../../ux/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default Base => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     */
    class ConnectionCommonSheetPart extends Base {
      /**
       * Build and connect context menu entries that update this document from some object.
       * @param {string} cssClass - The CSS class for elements to attach the menu to.
       * @param {object} obj - Object with keys, labels, and icons.
       * @param {string} path - Path of document to update.
       * @param {string} eventName - The event name to trigger the menu.
       */
      _connectBuildContextMenu(cssClass, obj, path, eventName) {
        this._connectContextMenu(
          cssClass,
          Object.entries(obj).map(([k, v]) => {
            return {
              icon: makeIcon(v.icon, "contextMenu"),
              label: v.label || k.titleCase(),
              onClick: async () => await this.document.update({ [path]: k }),
            };
          }),
          eventName,
        );
      }

      /**
       * Creates a context menu for elements.
       * @param {string} cssClass - The CSS class for elements to attach the menu to.
       * @param {ContextMenuEntry[]} menuItems - The context menu items.
       * @param {string} eventName - The event name to trigger the menu.
       * @param {"up"|"down"} [direction] - Direction for the context menu to expand.
       * @param {boolean} [fixed]
       * @returns {ContextMenu} The created context menu.
       */
      _connectContextMenu(cssClass, menuItems, eventName, direction, fixed = false) {
        return /** @type {ContextMenu} */ new TeriockContextMenu(this.element, cssClass, menuItems, {
          eventName,
          fixed,
          forceDirection: direction,
          jQuery: false,
        });
      }
    }
  );
};
