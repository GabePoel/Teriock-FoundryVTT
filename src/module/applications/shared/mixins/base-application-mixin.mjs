import { bindCommonActions } from "../_module.mjs";

/**
 * Mixin to ensure that `TERIOCK` values are always available.
 * @param {typeof ApplicationV2} Base
 */
export default function BaseApplicationMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  /**
   * @mixin
   * @extends {ApplicationV2}
   */
  class BaseApplication extends Base {
    /**
     * @type {Partial<ApplicationConfiguration>}
     */
    static DEFAULT_OPTIONS = {
      classes: ["teriock"],
    };

    /** @inheritDoc */
    async _onRender(options = {}) {
      await super._onRender(options);
      bindCommonActions(this.element);
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      Object.assign(context, {
        TERIOCK,
        appId: this.id,
      });
      return context;
    }
  }
  return BaseApplication;
}
