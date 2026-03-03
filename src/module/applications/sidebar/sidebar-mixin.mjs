import { bindCommonActions } from "../shared/_module.mjs";

/**
 * @param {typeof DocumentDirectory} Base
 */
export default function SidebarMixin(Base) {
  return (
    /**
     * @extends {DocumentDirectory}
     * @mixin
     */
    class Sidebar extends Base {
      static _entryPartial = "teriock/sidebar/document-partial";

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        if (game.settings.get("teriock", "sidebarTooltips")) {
          bindCommonActions(this.element);
        }
      }
    }
  );
}
