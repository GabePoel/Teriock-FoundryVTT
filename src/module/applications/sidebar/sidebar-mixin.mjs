import { systemPath } from "../../helpers/path.mjs";
import { bindCommonActions } from "../shared/_module.mjs";

/**
 * @param {typeof DocumentDirectory} Base
 * @constructor
 */
export default function SidebarMixin(Base) {
  return (
    /**
     * @mixin
     */
    class Sidebar extends Base {
      static _entryPartial = systemPath(
        "templates/sidebar/document-partial.hbs",
      );

      async _onRender(context, options) {
        await super._onRender(context, options);
        if (game.settings.get("teriock", "sidebarTooltips")) {
          bindCommonActions(this.element);
        }
      }
    }
  );
}
