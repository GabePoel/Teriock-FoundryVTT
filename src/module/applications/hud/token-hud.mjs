const { TokenHUD } = foundry.applications.hud;

export default class TeriockTokenHUD extends TokenHUD {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["teriock"] };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    for (const b of ["bar1", "bar2"]) {
      const bar = this.document.getBarAttribute(b);
      this.element.querySelectorAll(`.attribute.${b}`).forEach(
        /** @param {HTMLElement} el */ (el) => {
          el.dataset.attribute = bar?.attribute;
        },
      );
    }
  }
}
