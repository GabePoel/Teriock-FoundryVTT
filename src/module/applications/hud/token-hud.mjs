const { TokenHUD } = foundry.applications.hud;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/** @inheritDoc */
export default class TeriockTokenHUD extends TokenHUD {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["teriock"] };

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    for (const b of ["bar1", "bar2"]) {
      const bar = this.document.getBarAttribute(b);
      result.hud.querySelectorAll(`.attribute.${b}`).forEach(/** @param {HTMLElement} el */ el => {
        el.dataset.attribute = bar?.attribute;
      });
    }
    super._replaceHTML(result, content, options);
  }
}
