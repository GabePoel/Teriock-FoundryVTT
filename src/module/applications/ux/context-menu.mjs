const { ContextMenu } = foundry.applications.ux;

/**
 * @inheritDoc
 */
export default class TeriockContextMenu extends ContextMenu {
  constructor(container, selector, menuItems, options = {}) {
    super(container, selector, menuItems, options);
    const { forceDirection } = options;
    this.#forceDirection = forceDirection;
  }

  /**
   * @type {"up"|"down"|undefined}
   */
  #forceDirection;

  /**
   * @inheritDoc
   * @returns {boolean}
   */
  get expandUp() {
    if (!this.#forceDirection) {
      return super.expandUp;
    } else {
      return this.#forceDirection === "up";
    }
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
