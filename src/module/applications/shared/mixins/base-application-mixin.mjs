import { bindCommonActions } from "../_module.mjs";

/**
 * Mixin to ensure that `TERIOCK` values are always available.
 * @param {typeof ApplicationV2} Base
 */
export default function BaseApplicationMixin(Base) {
  /**
   * @extends {ApplicationV2}
   * @mixin
   */
  class BaseApplication extends Base {
    /** @type {Partial<ApplicationConfiguration>}*/
    static DEFAULT_OPTIONS = { classes: ["teriock"] };

    /** @inheritDoc */
    async _onRender(context, options = {}) {
      await super._onRender(context, options);
      bindCommonActions(this.element);
      this.element.querySelectorAll("[data-never-disable]").forEach(
        /** @param {HTMLButtonElement|HTMLInputElement} e */
        e => (e.disabled = false),
      );
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      return Object.assign(await super._prepareContext(options), { appId: this.id, TERIOCK });
    }
  }
  return BaseApplication;
}
