import { systemPath } from "../../helpers/path.mjs";
import { bindCommonActions } from "../shared/_module.mjs";

const { ActorDirectory } = foundry.applications.sidebar.tabs;

export default class TeriockActorDirectory extends ActorDirectory {
  static _entryPartial = systemPath("templates/sidebar/document-partial.hbs");

  async _onRender(context, options) {
    await super._onRender(context, options);
    bindCommonActions(this.element);
  }
}
