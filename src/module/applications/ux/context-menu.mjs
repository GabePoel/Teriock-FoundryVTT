import { makeIcon } from "../../helpers/icon.mjs";

const { ContextMenu } = foundry.applications.ux;

/**
 * @import { ContextMenuEntry, ContextMenuOptions } from "@client/applications/ux/context-menu.mjs";
 */

/** @inheritDoc */
export default class TeriockContextMenu extends ContextMenu {
  /**
   * @inheritDoc
   * @param {HTMLElement} container
   * @param {string} selector
   * @param {ContextMenuEntry[]} menuItems
   * @param {ContextMenuOptions} [options]
   */
  constructor(container, selector, menuItems, options = {}) {
    for (const item of menuItems) {
      if (item.icon && !item.icon.includes("<i")) { item.icon = makeIcon(item.icon, "contextMenu"); }
    }
    super(container, selector, menuItems, options);
  }
}
