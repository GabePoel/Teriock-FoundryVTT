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
      if (game.teriock.getSetting("developerMode") && this.window.header) {
        this.window.header
          .querySelectorAll("[data-action=copyUuid]")
          .forEach((el) => {
            el.addEventListener("auxclick", (e) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              console.log("Debug", this.document, this);
            });
          });
      }
      this.element.querySelectorAll("[data-never-disable]").forEach(
        /** @param {HTMLButtonElement|HTMLInputElement} e */
        (e) => (e.disabled = false),
      );
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      return Object.assign(await super._prepareContext(options), {
        TERIOCK,
        appId: this.id,
      });
    }
  }
  return BaseApplication;
}
