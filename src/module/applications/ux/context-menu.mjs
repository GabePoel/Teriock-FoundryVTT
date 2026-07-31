import { makeIcon } from "../../helpers/icon.mjs";

const { ContextMenu } = foundry.applications.ux;

/**
 * @import { ContextMenuEntry, ContextMenuOptions } from "@client/applications/ux/context-menu.mjs";
 */

/** @inheritDoc */
export default class TeriockContextMenu extends ContextMenu {
  /**
   * Helper method to quickly generate context menu entries.
   * @param {TeriockDocument} document - Document to be updated.
   * @param {{label: string; icon: string; value: any; path?: string;}[]} choices - Map to build entries from.
   * @param {object} [options] - Options.
   * @param {string} [options.path] - Default path to use for updates.
   * @return {ContextMenuEntry[]}
   */
  static makeUpdateEntries(document, choices, options) {
    return choices.map(c => {
      return {
        icon: c.icon,
        label: c.label,
        onClick: async () => {
          await document.update({ [c.path || options.path]: c.value });
        },
        visible: () => document.sheet?.isEditable,
      };
    });
  }

  /**
   * @inheritDoc
   * @param {HTMLElement} container
   * @param {string} selector
   * @param {ContextMenuEntry[]} menuItems
   * @param {ContextMenuOptions & { forceDirection?: "up"|"down"|null }} [options]
   */
  constructor(container, selector, menuItems, options = {}) {
    for (const item of menuItems) {
      if (item.icon && !item.icon.includes("<i")) { item.icon = makeIcon(item.icon, "contextMenu"); }
    }
    super(container, selector, menuItems, options);
    this.#forceDirection = options.forceDirection ?? null;
  }

  /** @type {"up"|"down"|null} */
  #forceDirection;

  /**
   * @inheritDoc
   * @returns {boolean}
   */
  get expandUp() {
    if (!this.#forceDirection) { return super.expandUp; }
    return this.#forceDirection === "up";
  }

  /** @inheritDoc */
  _setPosition(menu, target, { event } = {}) {
    super._setPosition(menu, target, { event });
    if (this.#forceDirection) {
      menu.classList.toggle("expand-up", this.expandUp);
      menu.classList.toggle("expand-down", !this.expandUp);
    }
  }
}
